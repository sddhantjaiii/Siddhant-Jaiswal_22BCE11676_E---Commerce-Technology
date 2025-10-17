import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExplanationInput {
  product: {
    title: string;
    category: string;
    price: number;
    ratingRate: number;
  };
  userBehavior: {
    topCategory?: string;
    avgPrice?: number;
    totalViews?: number;
    recentSearches?: string[];
  };
}

/**
 * Generate LLM-powered explanation for why a product is recommended
 */
export async function generateExplanation(
  input: ExplanationInput
): Promise<string> {
  const { product, userBehavior } = input;

  // Build context from user behavior
  const behaviorContext = [];
  if (userBehavior.topCategory) {
    behaviorContext.push(`preference for ${userBehavior.topCategory}`);
  }
  if (userBehavior.avgPrice) {
    behaviorContext.push(`typical budget around $${userBehavior.avgPrice.toFixed(2)}`);
  }
  if (userBehavior.totalViews) {
    behaviorContext.push(`${userBehavior.totalViews} products viewed`);
  }
  if (userBehavior.recentSearches && userBehavior.recentSearches.length > 0) {
    behaviorContext.push(`recent searches: "${userBehavior.recentSearches.join('", "')}"`);
  }

  const behaviorSummary =
    behaviorContext.length > 0
      ? behaviorContext.join(', ')
      : 'their browsing activity';

  const prompt = `You are a friendly personal shopping assistant. Explain why this product is recommended to the user.

Product Details:
- Name: ${product.title}
- Category: ${product.category}
- Price: $${product.price}
- Rating: ${product.ratingRate}/5

User Profile:
${behaviorSummary}

Write a personalized 2-3 sentence explanation of why this product matches their interests. Be conversational and engaging. Focus on the value proposition based on their behavior.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content || 'This product matches your interests based on your browsing history.';
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'This product is recommended based on your browsing preferences.';
  }
}

/**
 * Generate bulk explanations for multiple products
 */
export async function generateBulkExplanations(
  inputs: ExplanationInput[]
): Promise<string[]> {
  const promises = inputs.map((input) => generateExplanation(input));
  return Promise.all(promises);
}
