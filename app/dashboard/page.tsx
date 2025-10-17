'use client';

import { useEffect, useState } from 'react';
import { RecommendationCard } from '@/components/RecommendationCard';

interface Recommendation {
  product: {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    ratingRate: number;
    ratingCount: number;
  };
  score: number;
  explanation: string | null;
  algorithm: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchRecommendations();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations?limit=6');
      const data = await response.json();
      
      setRecommendations(data.recommendations);
      setCached(data.cached || false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations?limit=6&cache=false');
      const data = await response.json();
      
      setRecommendations(data.recommendations);
      setCached(false);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {user ? `Welcome back, ${user.name || user.email}!` : 'Welcome!'}
        </h1>
        <p className="text-gray-600">
          {user
            ? 'Here are your personalized product recommendations'
            : 'Here are our trending products. Sign in for personalized recommendations!'}
        </p>
      </div>

      {cached && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-800">
            Showing cached recommendations. Last updated recently.
          </p>
          <button
            onClick={refreshRecommendations}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            No recommendations yet. Start browsing products to get personalized recommendations!
          </p>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <RecommendationCard
                key={`${rec.product.id}-${index}`}
                product={rec.product}
                explanation={rec.explanation || undefined}
                score={rec.score}
                algorithm={rec.algorithm}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={refreshRecommendations}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh Recommendations
            </button>
          </div>
        </>
      )}
    </div>
  );
}
