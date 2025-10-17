import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateExpiryDate } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, action, sessionId, metadata } = body;

    if (!productId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, action' },
        { status: 400 }
      );
    }

    // Get user if logged in
    const user = await getCurrentUser();
    const userId = user?.id || null;

    // Normalize action to match ActionType enum (uppercase)
    const normalizedAction = action.toUpperCase();

    // Create behavior record
    const behavior = await prisma.userBehavior.create({
      data: {
        userId,
        sessionId: sessionId || 'unknown',
        productId: parseInt(productId),
        action: normalizedAction,
        metadata: metadata || null,
        expiresAt: calculateExpiryDate(30),
      },
    });

    return NextResponse.json({ 
      success: true, 
      behaviorId: behavior.id,
      userId: userId || 'guest'
    });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}
