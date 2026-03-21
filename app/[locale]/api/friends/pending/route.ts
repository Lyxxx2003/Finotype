import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type PendingInvite = {
  id: string;
  requesterId: string;
  requesterDisplayName: string;
  inviteeEmail: string;
  createdAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

    const userEmail = normalizeEmail(user.email ?? '');
    if (!userEmail) {
      return NextResponse.json({ invites: [] as PendingInvite[] });
    }

    const { data: rows, error } = await supabase
      .from('friends')
      .select('id, requester_id, invitee_email, created_at')
      .eq('status', 'pending')
      .eq('invitee_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to load pending invites.' }, { status: 500 });
    }

    const requesterIds = Array.from(new Set((rows ?? []).map((row) => row.requester_id))).filter(Boolean);

    let nameMap = new Map<string, string>();
    if (requesterIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', requesterIds);

      if (!profileError && profiles) {
        nameMap = new Map(profiles.map((profile) => [profile.id, profile.display_name?.trim() || 'Friend']));
      }
    }

    const invites: PendingInvite[] = (rows ?? []).map((row) => ({
      id: row.id,
      requesterId: row.requester_id,
      requesterDisplayName: nameMap.get(row.requester_id) || 'Friend',
      inviteeEmail: row.invitee_email,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('GET /api/friends/pending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
