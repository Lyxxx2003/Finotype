import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_FEEDBACK = new Set(['down', 'up', 'heart', 'skip']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow');

    const supabase = await createClient();

    if (flow === 'technical') {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('feedback')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
      }

      return NextResponse.json({ technicalFeedback: data?.feedback ?? null });
    }

    return NextResponse.json({ error: 'Invalid flow' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const flow = body?.flow;
    const feedback = body?.feedback;

    if (!VALID_FEEDBACK.has(feedback)) {
      return NextResponse.json({ error: 'Invalid feedback value' }, { status: 400 });
    }

    if (flow !== 'technical') {
      return NextResponse.json({ error: 'Invalid flow' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existing, error: readError } = await supabase
      .from('profiles')
      .select('feedback')
      .eq('id', user.id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    if (existing?.feedback) {
      return NextResponse.json({ technicalFeedback: existing.feedback });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ feedback })
      .eq('id', user.id)
      .select('feedback')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ technicalFeedback: data.feedback });
  } catch (error) {
    console.error('POST /api/feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
