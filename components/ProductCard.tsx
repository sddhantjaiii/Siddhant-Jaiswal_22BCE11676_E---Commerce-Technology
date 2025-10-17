import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
    ratingRate: number;
    ratingCount: number;
    category: string;
  };
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} onClick={onClick}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white h-full flex flex-col">
        <div className="relative w-full h-48 mb-4">
          <Image 
            src={product.image} 
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold line-clamp-2 mb-2 text-sm">
            {product.title}
          </h3>
          
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {product.category}
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.ratingRate}</span>
              <span className="text-gray-500">({product.ratingCount})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
