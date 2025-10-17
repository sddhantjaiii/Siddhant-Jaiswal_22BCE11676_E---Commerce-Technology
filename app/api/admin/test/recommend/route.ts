import { generateRecommendationsWithExplanations, getAdminTestRecommendations } from '@/lib/recommender';
import { prisma } from '@/lib/prisma';
import { calculateExpiryDate } from '@/lib/utils';
import { hashPassword } from '@/lib/auth';
import { generateExplanation } from '@/lib/llm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, behaviors, limit = 6, generateExplanations = true } = body;

    if (!userId || !behaviors || !Array.isArray(behaviors)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, behaviors (array)' },
        { status: 400 }
      );
    }

    // Check if user exists, create if not (for testing purposes)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create a test user with hashed password
      const hashedPassword = await hashPassword('test-password-123');
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `test-${userId}@example.com`,
          password: hashedPassword,
          name: `Test User ${userId}`,
        },
      });
    }

    // Create test behaviors in database
    const sessionId = `test-${Date.now()}`;
    const createdBehaviors = [];

    for (const behavior of behaviors) {
      // Normalize action to match ActionType enum (uppercase)
      const normalizedAction = behavior.action.toUpperCase();
      
      const created = await prisma.userBehavior.create({
        data: {
          userId,
          sessionId,
          productId: behavior.productId,
          action: normalizedAction,
          metadata: behavior.metadata || null,
          expiresAt: calculateExpiryDate(30),
        },
      });
      createdBehaviors.push(created);
    }

    // Generate recommendations based on these behaviors using admin test function
    const recommendationResults = await getAdminTestRecommendations(userId, limit);

    // Fetch product details
    const productIds = recommendationResults.map((r) => r.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Map products to recommendations
    const recommendations = recommendationResults.map((rec) => ({
      ...rec,
      product: products.find((p) => p.id === rec.productId),
    }));

    // Generate LLM explanations if requested
    if (generateExplanations) {
      const summary = await prisma.userBehavior.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Calculate user behavior summary for explanations
      const categoryCount: Record<string, number> = {};
      const prices: number[] = [];
      summary.forEach((b) => {
        categoryCount[b.product.category] = (categoryCount[b.product.category] || 0) + 1;
        if (b.action === 'VIEW' || b.action === 'ADD_TO_CART') {
          prices.push(b.product.price);
        }
      });

      const topCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0];
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : undefined;

      const userBehavior = {
        topCategory,
        avgPrice,
        totalViews: summary.filter(b => b.action === 'VIEW').length,
      };

      // Generate explanations for top 3 recommendations
      for (let i = 0; i < Math.min(3, recommendations.length); i++) {
        const result = recommendations[i];
        if (result.product) {
          try {
            const explanation = await generateExplanation({
              product: {
                title: result.product.title,
                category: result.product.category,
                price: result.product.price,
                ratingRate: result.product.ratingRate,
              },
              userBehavior,
            });
            result.explanation = explanation;
          } catch (error) {
            console.error('Error generating explanation:', error);
            result.explanation = 'This product matches your browsing preferences.';
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      behaviorsCreated: createdBehaviors.length,
      recommendations,
      testData: {
        userId,
        behaviors: createdBehaviors,
        behaviorSummary: {
          totalBehaviors: createdBehaviors.length,
          viewCount: createdBehaviors.filter(b => b.action === 'VIEW').length,
        },
      },
    });
  } catch (error) {
    console.error('Error in admin test:', error);
    return NextResponse.json(
      { error: 'Failed to run test recommendations' },
      { status: 500 }
    );
  }
}
