import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inviteId = String(body?.inviteId ?? '').trim();

    if (!inviteId) {
      return NextResponse.json({ error: 'inviteId is required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = normalizeEmail(user.email ?? '');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is missing.' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabase
      .from('friends')
      .select('id, requester_id, invitee_email, status')
      .eq('id', inviteId)
      .maybeSingle();

    if (inviteError) {
      return NextResponse.json({ error: 'Failed to read invite.' }, { status: 500 });
    }

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found.' }, { status: 404 });
    }

    if (normalizeEmail(invite.invitee_email) !== userEmail) {
      return NextResponse.json({ error: 'You cannot accept this invite.' }, { status: 403 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer pending.' }, { status: 409 });
    }

    if (invite.requester_id === user.id) {
      return NextResponse.json({ error: 'You cannot accept your own invite.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('friends')
      .update({
        status: 'accepted',
        invitee_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)
      .eq('status', 'pending');

    if (updateError) {
      return NextResponse.json({ error: 'Failed to accept invite.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/friends/accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
