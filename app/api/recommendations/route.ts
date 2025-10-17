import { getCurrentUser } from '@/lib/auth';
import { generateRecommendationsWithExplanations, getCachedRecommendations } from '@/lib/recommender';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const generateExplanations = searchParams.get('explanations') !== 'false';
    const useCache = searchParams.get('cache') !== 'false';

    // Get user if logged in
    const user = await getCurrentUser();
    const userId = user?.id || null;

    // Try to get cached recommendations first
    if (useCache && userId) {
      const cached = await getCachedRecommendations(userId);
      if (cached && cached.length > 0) {
        return NextResponse.json({ 
          recommendations: cached,
          cached: true,
          userId: userId || 'guest'
        });
      }
    }

    // Generate fresh recommendations
    const recommendations = await generateRecommendationsWithExplanations(
      userId,
      limit,
      generateExplanations && !!userId
    );

    return NextResponse.json({ 
      recommendations,
      cached: false,
      userId: userId || 'guest',
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
