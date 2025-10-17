import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Smart Product Recommendations
              <span className="block text-yellow-300">Powered by AI</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover products you'll love with personalized recommendations
              and AI-powered explanations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-purple-600">
                <Link href="/dashboard">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Recommendations
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose Our Recommender?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-purple-600" />}
              title="AI-Powered Explanations"
              description="Understand why products are recommended with personalized AI-generated insights."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-blue-600" />}
              title="Smart Algorithms"
              description="Hybrid recommendation engine combining rule-based and collaborative filtering."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-pink-600" />}
              title="Personalized Experience"
              description="Recommendations that adapt to your browsing behavior and preferences."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start browsing to get personalized recommendations, or sign up for
            an enhanced experience with saved preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/products">Start Browsing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Link href="/auth/signin">Sign Up / Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Testing Section */}
      <section className="py-12 bg-yellow-50 border-t-4 border-yellow-400">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 text-yellow-900">
              🧪 Admin Testing Panel
            </h3>
            <p className="text-gray-700 mb-6">
              For evaluation purposes: Test the recommendation system with custom
              product catalog and user behavior inputs.
            </p>
            <Button asChild variant="outline" className="border-yellow-600 text-yellow-900 hover:bg-yellow-100">
              <Link href="/admin/test">
                Open Testing Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
