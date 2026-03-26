import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  highestScore: number;
  isCurrentUser: boolean;
};

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

    const { data: relations, error: relationError } = await supabase
      .from('friends')
      .select('requester_id, invitee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},invitee_id.eq.${user.id}`);

    if (relationError) {
      return NextResponse.json({ error: 'Failed to load friend connections.' }, { status: 500 });
    }

    const friendIdSet = new Set<string>();

    for (const relation of relations ?? []) {
      const requesterId = relation.requester_id;
      const inviteeId = relation.invitee_id;

      if (requesterId === user.id && inviteeId) {
        friendIdSet.add(inviteeId);
      }

      if (inviteeId === user.id && requesterId) {
        friendIdSet.add(requesterId);
      }
    }

    friendIdSet.add(user.id);
    const friendIds = Array.from(friendIdSet);

    const [{ data: profiles, error: profileError }, { data: lessons, error: lessonError }] = await Promise.all([
      supabase.from('profiles').select('id, display_name').in('id', friendIds),
      supabase.from('lessons').select('user_id, highest_total_score').in('user_id', friendIds),
    ]);

    if (profileError || lessonError) {
      return NextResponse.json({ error: 'Failed to load leaderboard data.' }, { status: 500 });
    }

    const lessonMap = new Map<string, number>();
    for (const row of lessons ?? []) {
      lessonMap.set(
        row.user_id,
        typeof row.highest_total_score === 'number' ? Math.round(row.highest_total_score) : 0
      );
    }

    const leaderboard: LeaderboardEntry[] = (profiles ?? []).map((profile) => {
      return {
        userId: profile.id,
        displayName: profile.display_name?.trim() || 'Friend',
        highestScore: lessonMap.get(profile.id) ?? 0,
        isCurrentUser: profile.id === user.id,
      };
    });

    leaderboard.sort((a, b) => b.highestScore - a.highestScore || a.displayName.localeCompare(b.displayName));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('GET /api/leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
