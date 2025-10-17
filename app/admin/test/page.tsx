'use client';

import { useState } from 'react';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

interface TestResult {
  recommendations: Recommendation[];
  behaviorsCreated: number;
  sessionId: string;
  testData: any;
}

export default function AdminTestPage() {
  const [userId, setUserId] = useState('');
  const [behaviors, setBehaviors] = useState(`[
  {
    "productId": 9,
    "action": "view",
    "metadata": { "note": "WD 2TB Elements Portable - electronics" }
  },
  {
    "productId": 11,
    "action": "view",
    "metadata": { "note": "Silicon Power 256GB SSD - electronics" }
  },
  {
    "productId": 12,
    "action": "view",
    "metadata": { "note": "WD 4TB Gaming Drive - electronics" }
  },
  {
    "productId": 9,
    "action": "add_to_cart"
  },
  {
    "productId": 13,
    "action": "view",
    "metadata": { "note": "Acer SB220Q monitor - electronics" }
  }
]`);
  const [limit, setLimit] = useState(6);
  const [generateExplanations, setGenerateExplanations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    setError('');
    setResult(null);

    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    let parsedBehaviors;
    try {
      parsedBehaviors = JSON.parse(behaviors);
      if (!Array.isArray(parsedBehaviors)) {
        setError('Behaviors must be an array');
        return;
      }
    } catch (e) {
      setError('Invalid JSON format for behaviors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/test/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          behaviors: parsedBehaviors,
          limit,
          generateExplanations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to run test');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error occurred');
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Testing Panel</h1>
        <p className="text-gray-600">
          Test the recommendation engine with custom user behaviors
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Configure test parameters and user behaviors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID or test ID"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Behaviors (JSON Array) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={behaviors}
                  onChange={(e) => setBehaviors(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='[{"productId": 1, "action": "view"}]'
                />
                <p className="mt-1 text-xs text-gray-500">
                  Actions: view, add_to_cart, purchase, search, time_spent
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Limit
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Generate Explanations
                  </label>
                  <select
                    value={generateExplanations ? 'true' : 'false'}
                    onChange={(e) => setGenerateExplanations(e.target.value === 'true')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={runTest}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Running Test...' : 'Run Test'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div>
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {result.behaviorsCreated} behaviors created • Session: {result.sessionId.slice(0, 12)}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.recommendations.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No recommendations generated
                  </p>
                ) : (
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-gray-400">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {rec.product.title}
                            </h3>
                            <div className="text-sm text-gray-600 mb-2">
                              Score: {rec.score.toFixed(2)} • Algorithm: {rec.algorithm}
                            </div>
                            {rec.explanation && (
                              <div className="text-sm bg-blue-50 p-2 rounded">
                                {rec.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!result && !loading && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Run a test to see results here
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Running test...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Example Scenarios */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Example Test Scenarios</CardTitle>
          <CardDescription>
            Click to copy these example behaviors for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setBehaviors(`[
  {"productId": 1, "action": "view"},
  {"productId": 2, "action": "view"},
  {"productId": 1, "action": "add_to_cart"}
]`)}
              className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold mb-1">Cold Start (New User)</div>
              <div className="text-sm text-gray-600">
                2-3 views, minimal interaction
              </div>
            </button>

            <button
              onClick={() => setBehaviors(`[
  {"productId": 1, "action": "view"},
  {"productId": 2, "action": "view"},
  {"productId": 3, "action": "view"},
  {"productId": 1, "action": "add_to_cart"},
  {"productId": 2, "action": "add_to_cart"},
  {"productId": 1, "action": "purchase"}
]`)}
              className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold mb-1">Warm Start (Active User)</div>
              <div className="text-sm text-gray-600">
                5-8 interactions with purchases
              </div>
            </button>

            <button
              onClick={() => setBehaviors(`[
  {"productId": 1, "action": "view"},
  {"productId": 2, "action": "view"},
  {"productId": 3, "action": "view"},
  {"productId": 4, "action": "view"},
  {"productId": 5, "action": "view"},
  {"productId": 1, "action": "add_to_cart"},
  {"productId": 2, "action": "add_to_cart"},
  {"productId": 3, "action": "add_to_cart"},
  {"productId": 1, "action": "purchase"},
  {"productId": 2, "action": "purchase"},
  {"productId": 6, "action": "view"},
  {"productId": 7, "action": "view"}
]`)}
              className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold mb-1">Hot Start (Power User)</div>
              <div className="text-sm text-gray-600">
                10+ interactions, multiple purchases
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
