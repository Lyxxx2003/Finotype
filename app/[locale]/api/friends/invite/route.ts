import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = String(body?.email ?? '');
    const inviteeEmail = normalizeEmail(rawEmail);

    if (!inviteeEmail || !EMAIL_REGEX.test(inviteeEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const myEmail = normalizeEmail(user.email ?? '');
    if (myEmail && inviteeEmail === myEmail) {
      return NextResponse.json({ error: 'You cannot invite yourself.' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('friends')
      .select('id, status')
      .eq('requester_id', user.id)
      .eq('invitee_email', inviteeEmail)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: 'Failed to check existing invite.' }, { status: 500 });
    }

    if (existing?.status === 'pending') {
      return NextResponse.json({ error: 'Invite already sent.' }, { status: 409 });
    }

    if (existing?.status === 'accepted') {
      return NextResponse.json({ error: 'This friend is already connected.' }, { status: 409 });
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('friends')
        .update({
          status: 'pending',
          invitee_id: null,
          accepted_at: null,
        })
        .eq('id', existing.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to re-send invite.' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const { error: insertError } = await supabase.from('friends').insert({
      requester_id: user.id,
      invitee_email: inviteeEmail,
      status: 'pending',
    });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to send invite.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/friends/invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
