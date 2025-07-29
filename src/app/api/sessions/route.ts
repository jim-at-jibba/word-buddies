import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/spelling-logic';
import { db } from '@/lib/db';
import { sessions, wordAttempts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attempts, duration } = body;

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Attempts array is required and must not be empty',
        },
        { status: 400 }
      );
    }

    // Validate attempt structure
    for (const attempt of attempts) {
      if (!attempt.word || typeof attempt.userSpelling !== 'string' || typeof attempt.isCorrect !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            error: 'Each attempt must have word, userSpelling, and isCorrect fields',
          },
          { status: 400 }
        );
      }
    }

    const sessionResult = await createSession(attempts);

    // Update session duration if provided
    if (typeof duration === 'number' && duration > 0) {
      const database = db();
      await database
        .update(sessions)
        .set({ duration })
        .where(eq(sessions.id, sessionResult.sessionId));
      
      sessionResult.duration = duration;
    }

    return NextResponse.json({
      success: true,
      data: sessionResult,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID is required',
        },
        { status: 400 }
      );
    }

    // Get session details
    const database = db();
    const sessionData = await database
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    // Get word attempts for this session
    const attempts = await database
      .select()
      .from(wordAttempts)
      .where(eq(wordAttempts.sessionId, sessionId));

    const session = sessionData[0];
    let celebrationLevel: 'great' | 'good' | 'keep-trying';
    
    if (session.score >= 80) {
      celebrationLevel = 'great';
    } else if (session.score >= 60) {
      celebrationLevel = 'good';
    } else {
      celebrationLevel = 'keep-trying';
    }

    const result = {
      sessionId: session.id,
      score: session.score,
      totalWords: session.wordsAttempted,
      correctWords: session.correctWords,
      duration: session.duration,
      attempts: attempts.map(a => ({
        word: a.word,
        userSpelling: a.userSpelling,
        isCorrect: a.isCorrect,
        attempts: a.attempts,
      })),
      celebrationLevel,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch session',
      },
      { status: 500 }
    );
  }
}