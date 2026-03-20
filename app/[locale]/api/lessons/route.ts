import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function computeTotalScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + Number(value || 0), 0);
  return Math.round(sum / values.length);
}

function sanitizeLearningCurve(input: unknown): number[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (typeof item === 'number') return Math.round(item);
      if (item && typeof item === 'object') {
        const totalScore = (item as { totalScore?: unknown }).totalScore;
        if (typeof totalScore === 'number') return Math.round(totalScore);
      }
      return null;
    })
    .filter((item): item is number => typeof item === 'number');
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch lessons progress' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ progress: null }, { status: 404 });
    }

    return NextResponse.json({ progress: data });
  } catch (error) {
    console.error('GET /api/lessons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const answers = (body?.answers ?? {}) as Record<string, string>;
    const scores = (body?.scores ?? {}) as Record<string, number>;
    const modulesCompleted = (body?.modulesCompleted ?? []) as string[];
    const isFinished = Boolean(body?.isFinished);

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();
    const totalScore = computeTotalScore(scores);

    const { data: existing, error: readError } = await supabase
      .from('lessons')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: 'Failed to read existing progress' }, { status: 500 });
    }

    const currentCurve = sanitizeLearningCurve(existing?.learning_curve);
    const justFinished = !Boolean(existing?.is_finished) && isFinished;
    const nextCurve = justFinished
      ? [...currentCurve, totalScore].slice(-40)
      : currentCurve;

    const latestFinishedScores = isFinished ? scores : existing?.latest_finished_scores ?? null;
    const latestFinishedTotalScore = isFinished
      ? totalScore
      : existing?.latest_finished_total_score ?? null;
    const latestFinishedAt = isFinished ? now : existing?.latest_finished_at ?? null;

    if (existing) {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          answers,
          scores,
          modules_completed: modulesCompleted,
          is_finished: isFinished,
          total_score: totalScore,
          learning_curve: nextCurve,
          latest_finished_scores: latestFinishedScores,
          latest_finished_total_score: latestFinishedTotalScore,
          latest_finished_at: latestFinishedAt,
          updated_at: now,
        })
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
      }

      return NextResponse.json({ progress: data });
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        user_id: user.id,
        answers,
        scores,
        modules_completed: modulesCompleted,
        is_finished: isFinished,
        total_score: totalScore,
        learning_curve: isFinished ? [totalScore] : [],
        latest_finished_scores: isFinished ? scores : null,
        latest_finished_total_score: isFinished ? totalScore : null,
        latest_finished_at: isFinished ? now : null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
  } catch (error) {
    console.error('POST /api/lessons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
