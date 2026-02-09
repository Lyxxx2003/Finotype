import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper to generate or retrieve session ID from cookie
function getOrCreateSessionId(request: NextRequest): string {
  const sessionId = request.cookies.get('finotype_session_id')?.value;
  if (sessionId) {
    return sessionId;
  }
  // Generate a new session ID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// POST: Save a finotype result
export async function POST(request: NextRequest) {
  try {
    const { finotype } = await request.json();
    
    if (!finotype || typeof finotype !== 'string') {
      return NextResponse.json(
        { error: 'Invalid finotype' },
        { status: 400 }
      );
    }

    const sessionId = getOrCreateSessionId(request);
    const supabase = await createClient();

    // Check if this session has already submitted
    const { data: existing, error: checkError } = await supabase
      .from('type')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new sessions
      console.error('Error checking existing session:', checkError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // If session already exists, update the finotype
    if (existing) {
      const { error: updateError } = await supabase
        .from('type')
        .update({ finotype })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating type:', updateError);
        return NextResponse.json(
          { error: 'Failed to update type' },
          { status: 500 }
        );
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('type')
        .insert({ session_id: sessionId, finotype });

      if (insertError) {
        console.error('Error saving type:', insertError);
        return NextResponse.json(
          { error: 'Failed to save type' },
          { status: 500 }
        );
      }
    }

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('finotype_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/type-stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Fetch statistics for a specific finotype
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const finotype = searchParams.get('finotype');

    if (!finotype || typeof finotype !== 'string') {
      return NextResponse.json(
        { error: 'Invalid finotype' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('type')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error getting total count:', totalError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Get count for this specific finotype
    const { count: typeCount, error: typeError } = await supabase
      .from('type')
      .select('*', { count: 'exact', head: true })
      .eq('finotype', finotype);

    if (typeError) {
      console.error('Error getting type count:', typeError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      total: totalCount || 0,
      typeCount: typeCount || 0,
      percentage: totalCount && totalCount > 0 
        ? Math.round((typeCount || 0) / totalCount * 100) 
        : 0,
    });
  } catch (error) {
    console.error('Error in GET /api/type-stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
