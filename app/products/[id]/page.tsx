'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPrice, generateSessionId } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  ratingRate: number;
  ratingCount: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [viewStartTime] = useState(() => Date.now());

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
      trackView(parseInt(params.id as string));
    }

    // Track time spent on page when user leaves
    return () => {
      if (params.id) {
        trackTimeSpent(parseInt(params.id as string));
      }
    };
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (data.product) {
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (productId: number) => {
    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: 'view',
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackTimeSpent = async (productId: number) => {
    const timeSpent = Math.floor((Date.now() - viewStartTime) / 1000);
    
    if (timeSpent < 3) return; // Ignore very short visits

    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: 'time_spent',
          sessionId,
          metadata: { seconds: timeSpent },
        }),
      });
    } catch (error) {
      console.error('Error tracking time spent:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          action: 'add_to_cart',
          sessionId,
        }),
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">Product not found.</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/products')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square bg-white rounded-lg p-8 border">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-4"
            priority
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-sm bg-gray-100 rounded-full capitalize">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.ratingRate)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.ratingRate} ({product.ratingCount} reviews)
            </span>
          </div>

          <p className="text-4xl font-bold text-blue-600 mb-6">
            {formatPrice(product.price)}
          </p>

          <p className="text-gray-700 mb-8 leading-relaxed">
            {product.description}
          </p>

          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full md:w-auto"
            disabled={addedToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
