import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const products = await prisma.product.findMany({
      where: category ? { category } : {},
      orderBy: [
        { ratingRate: 'desc' },
        { ratingCount: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
