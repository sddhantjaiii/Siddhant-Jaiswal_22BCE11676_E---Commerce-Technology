import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  product: any;
  explanation?: string;
  score: number;
  algorithm?: string;
}

export function RecommendationCard({ 
  product, 
  explanation, 
  score,
  algorithm 
}: RecommendationCardProps) {
  return (
    <div className="relative">
      <ProductCard product={product} />
      
      {explanation && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>Match: {(score * 100).toFixed(0)}%</span>
        {algorithm && <span className="capitalize">{algorithm}</span>}
      </div>
    </div>
  );
}
