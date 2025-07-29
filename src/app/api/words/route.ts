import { NextRequest, NextResponse } from 'next/server';
import { getRandomWord, updateWordStats } from '@/lib/spelling-logic';
import { initializeDatabase } from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;

export async function GET() {
  try {
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    const word = await getRandomWord();
    return NextResponse.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch word',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, userSpelling, isCorrect } = body;

    if (!word || typeof userSpelling !== 'string' || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: word, userSpelling, isCorrect',
        },
        { status: 400 }
      );
    }

    await updateWordStats(word, isCorrect);

    return NextResponse.json({
      success: true,
      data: {
        word,
        userSpelling,
        isCorrect,
        message: isCorrect ? 'Correct!' : 'Try again!',
      },
    });
  } catch (error) {
    console.error('Error updating word stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update word statistics',
      },
      { status: 500 }
    );
  }
}