import { prisma } from './prisma';
import { generateExplanation } from './llm';

export interface RecommendationResult {
  productId: number;
  score: number;
  explanation?: string;
  algorithm: 'trending' | 'rule-based' | 'collaborative' | 'hybrid';
}

/**
 * Get user behavior summary for recommendation logic
 */
async function getUserBehaviorSummary(userId: string) {
  const behaviors = await prisma.userBehavior.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take: 50, // Last 50 interactions
  });

  if (behaviors.length === 0) {
    return null;
  }

  // Calculate statistics
  const categoryCount: Record<string, number> = {};
  const prices: number[] = [];
  let totalViews = 0;
  const searches: string[] = [];

  behaviors.forEach((behavior) => {
    // Count categories
    categoryCount[behavior.product.category] =
      (categoryCount[behavior.product.category] || 0) + 1;

    // Track prices
    if (behavior.action === 'VIEW' || behavior.action === 'ADD_TO_CART') {
      prices.push(behavior.product.price);
    }

    // Count views
    if (behavior.action === 'VIEW') {
      totalViews++;
    }

    // Track searches
    if (behavior.action === 'SEARCH' && behavior.metadata) {
      const metadata = behavior.metadata as { query?: string };
      if (metadata.query) {
        searches.push(metadata.query);
      }
    }
  });

  // Find top category
  const topCategory = Object.entries(categoryCount).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  // Calculate average price
  const avgPrice = prices.length > 0
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : undefined;

  return {
    topCategory,
    avgPrice,
    totalViews,
    recentSearches: searches.slice(0, 3), // Last 3 searches
    viewedProductIds: behaviors
      .filter((b) => b.action === 'VIEW')
      .map((b) => b.productId),
  };
}

/**
 * Get trending products (for new/guest users)
 */
async function getTrendingProducts(limit: number = 10): Promise<RecommendationResult[]> {
  const products = await prisma.product.findMany({
    orderBy: [
      { ratingCount: 'desc' },
      { ratingRate: 'desc' },
    ],
    take: limit,
  });

  return products.map((product, index) => ({
    productId: product.id,
    score: 1.0 - index * 0.05, // Decreasing score
    algorithm: 'trending' as const,
  }));
}

/**
 * Rule-based recommendations
 */
async function getRuleBasedRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationResult[]> {
  const summary = await getUserBehaviorSummary(userId);
  if (!summary) {
    return getTrendingProducts(limit);
  }

  const { topCategory, avgPrice, viewedProductIds } = summary;

  // Find products in top category, similar price range, not viewed
  const priceMin = avgPrice ? avgPrice * 0.5 : 0;
  const priceMax = avgPrice ? avgPrice * 1.5 : 1000000;

  const products = await prisma.product.findMany({
    where: {
      category: topCategory,
      price: {
        gte: priceMin,
        lte: priceMax,
      },
      id: {
        notIn: viewedProductIds,
      },
    },
    orderBy: [
      { ratingRate: 'desc' },
      { ratingCount: 'desc' },
    ],
    take: limit,
  });

  return products.map((product, index) => ({
    productId: product.id,
    score: 0.9 - index * 0.05,
    algorithm: 'rule-based' as const,
  }));
}

/**
 * Collaborative filtering recommendations
 */
async function getCollaborativeRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationResult[]> {
  const summary = await getUserBehaviorSummary(userId);
  if (!summary || summary.viewedProductIds.length < 3) {
    return getRuleBasedRecommendations(userId, limit);
  }

  // Find similar users who viewed the same products
  const similarUserIds = await prisma.userBehavior.groupBy({
    by: ['userId'],
    where: {
      productId: { in: summary.viewedProductIds },
      userId: { not: userId },
      action: { in: ['VIEW', 'ADD_TO_CART', 'PURCHASE'] },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 20, // Top 20 similar users
  });

  if (similarUserIds.length === 0) {
    return getRuleBasedRecommendations(userId, limit);
  }

  // Get products these similar users liked
  const recommendations = await prisma.userBehavior.groupBy({
    by: ['productId'],
    where: {
      userId: { in: similarUserIds.map((u) => u.userId).filter((id): id is string => id !== null) },
      productId: { notIn: summary.viewedProductIds },
      action: { in: ['VIEW', 'ADD_TO_CART', 'PURCHASE'] },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  });

  return recommendations.map((rec, index) => ({
    productId: rec.productId,
    score: 0.95 - index * 0.03,
    algorithm: 'collaborative' as const,
  }));
}

/**
 * Admin test recommendations (bypasses cold start limitations)
 * Used for testing and demonstration purposes
 */
export async function getAdminTestRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationResult[]> {
  const summary = await getUserBehaviorSummary(userId);
  
  // If no behavior data, return trending
  if (!summary) {
    return getTrendingProducts(limit);
  }

  const { topCategory, avgPrice, viewedProductIds } = summary;

  // Get products in the same category as viewed products
  const products = await prisma.product.findMany({
    where: {
      category: topCategory,
      id: {
        notIn: viewedProductIds, // Exclude already viewed products
      },
    },
    orderBy: [
      { ratingRate: 'desc' },
      { ratingCount: 'desc' },
    ],
    take: limit,
  });

  // If not enough products in the same category, get from all categories
  if (products.length < limit) {
    const additionalProducts = await prisma.product.findMany({
      where: {
        id: {
          notIn: [...viewedProductIds, ...products.map(p => p.id)],
        },
      },
      orderBy: [
        { ratingRate: 'desc' },
        { ratingCount: 'desc' },
      ],
      take: limit - products.length,
    });
    products.push(...additionalProducts);
  }

  return products.map((product, index) => ({
    productId: product.id,
    score: 0.95 - index * 0.05,
    algorithm: 'rule-based' as const,
  }));
}

/**
 * Hybrid recommendation engine (combines all strategies)
 */
export async function getHybridRecommendations(
  userId: string | null,
  limit: number = 10
): Promise<RecommendationResult[]> {
  // If no user, return trending
  if (!userId) {
    return getTrendingProducts(limit);
  }

  const summary = await getUserBehaviorSummary(userId);

  // Cold start (new user)
  if (!summary || summary.totalViews < 3) {
    return getTrendingProducts(limit);
  }

  // Warm start (some data)
  if (summary.totalViews < 10) {
    return getRuleBasedRecommendations(userId, limit);
  }

  // Hot start (lots of data) - mix collaborative + rule-based
  const collaborative = await getCollaborativeRecommendations(userId, Math.ceil(limit * 0.7));
  const ruleBased = await getRuleBasedRecommendations(userId, Math.ceil(limit * 0.3));

  // Combine and deduplicate
  const combined = [...collaborative, ...ruleBased];
  const unique = combined.filter(
    (rec, index, self) =>
      index === self.findIndex((r) => r.productId === rec.productId)
  );

  return unique.slice(0, limit).map(rec => ({ ...rec, algorithm: 'hybrid' as const }));
}

/**
 * Generate recommendations with LLM explanations
 */
export async function generateRecommendationsWithExplanations(
  userId: string | null,
  limit: number = 6,
  generateExplanations: boolean = true
): Promise<Array<RecommendationResult & { product: any }>> {
  // Get recommendations
  const recommendations = await getHybridRecommendations(userId, limit);

  // Fetch product details
  const productIds = recommendations.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Map products to recommendations
  const results = recommendations.map((rec) => ({
    ...rec,
    product: products.find((p) => p.id === rec.productId),
  }));

  // Generate explanations for top 3
  if (generateExplanations && userId) {
    const summary = await getUserBehaviorSummary(userId);
    
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const result = results[i];
      if (result.product) {
        try {
          const explanation = await generateExplanation({
            product: {
              title: result.product.title,
              category: result.product.category,
              price: result.product.price,
              ratingRate: result.product.ratingRate,
            },
            userBehavior: summary || {},
          });
          result.explanation = explanation;
        } catch (error) {
          console.error('Error generating explanation:', error);
        }
      }
    }
  }

  return results;
}

/**
 * Save recommendations to database (for caching)
 */
export async function saveRecommendations(
  userId: string,
  recommendations: RecommendationResult[]
): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour cache

  await prisma.recommendation.createMany({
    data: recommendations.map((rec) => ({
      userId,
      productId: rec.productId,
      score: rec.score,
      explanation: rec.explanation,
      algorithm: rec.algorithm,
      expiresAt,
    })),
  });
}

/**
 * Get cached recommendations (if not expired)
 */
export async function getCachedRecommendations(
  userId: string
): Promise<Array<RecommendationResult & { product: any }> | null> {
  const cached = await prisma.recommendation.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    include: { product: true },
    orderBy: { score: 'desc' },
  });

  if (cached.length === 0) {
    return null;
  }

  return cached.map((rec) => ({
    productId: rec.productId,
    score: rec.score,
    explanation: rec.explanation || undefined,
    algorithm: rec.algorithm as any,
    product: rec.product,
  }));
}
