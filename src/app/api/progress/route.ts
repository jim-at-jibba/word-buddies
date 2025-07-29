import { NextResponse } from 'next/server';
import { getProgressStats, getWordsNeedingReview } from '@/lib/spelling-logic';

export async function GET() {
  try {
    const stats = await getProgressStats();
    const wordsNeedingReview = await getWordsNeedingReview();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        wordsNeedingReview: wordsNeedingReview.slice(0, 10), // Limit to first 10
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress data',
      },
      { status: 500 }
    );
  }
}