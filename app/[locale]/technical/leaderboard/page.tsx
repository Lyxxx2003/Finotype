'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

type PendingInvite = {
  id: string;
  requesterId: string;
  requesterDisplayName: string;
  inviteeEmail: string;
  createdAt: string;
};

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  highestScore: number;
  isCurrentUser: boolean;
};

export default function TechnicalLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('leaderboard');
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const messageClass = useMemo(() => {
    if (messageType === 'success') return 'alert-success';
    if (messageType === 'error') return 'alert-error';
    return 'alert-info';
  }, [messageType]);

  const loadData = useCallback(async () => {
    const [pendingResponse, leaderboardResponse] = await Promise.all([
      fetch(`/${locale}/api/friends/pending`, { cache: 'no-store' }),
      fetch(`/${locale}/api/leaderboard`, { cache: 'no-store' }),
    ]);

    if (pendingResponse.status === 401 || leaderboardResponse.status === 401) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!pendingResponse.ok || !leaderboardResponse.ok) {
      throw new Error(t('loadFailed'));
    }

    const pendingData = await pendingResponse.json();
    const leaderboardData = await leaderboardResponse.json();

    setPendingInvites((pendingData.invites ?? []) as PendingInvite[]);
    setLeaderboard((leaderboardData.leaderboard ?? []) as LeaderboardEntry[]);
  }, [locale, router, t]);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }

        await loadData();
      } catch (error) {
        console.error('Failed to load leaderboard page:', error);
        setMessageType('error');
        setMessage(t('loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadData, locale, router, supabase, t]);

  const handleInviteSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setInviting(true);
    setMessage('');

    try {
      const response = await fetch(`/${locale}/api/friends/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(String(data?.error ?? t('inviteFailed')));
      }

      setInviteEmail('');
      setMessageType('success');
      setMessage(t('inviteSent'));
      await loadData();
    } catch (error) {
      setMessageType('error');
      setMessage((error as Error).message || t('inviteFailed'));
    } finally {
      setInviting(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setAcceptingInviteId(inviteId);
    setMessage('');

    try {
      const response = await fetch(`/${locale}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(String(data?.error ?? t('acceptFailed')));
      }

      setMessageType('success');
      setMessage(t('inviteAccepted'));
      await loadData();
    } catch (error) {
      setMessageType('error');
      setMessage((error as Error).message || t('acceptFailed'));
    } finally {
      setAcceptingInviteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold"
            style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('title')}
          </h1>
          <Link href={`/${locale}/technical/question`} className="btn-professional-outline text-sm">
            ← {t('backToGame')}
          </Link>
        </div>

        <div className="card-professional p-8 space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t('inviteTitle')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('inviteDescription')}
          </p>

          <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder={t('inviteEmailPlaceholder')}
              className="input-professional flex-1"
              required
            />
            <button type="submit" className="btn-professional-primary" disabled={inviting}>
              {inviting ? t('sending') : t('sendInvite')}
            </button>
          </form>

          {message && <div className={messageClass}>{message}</div>}
        </div>

        <div className="card-professional p-8 space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t('pendingTitle')}
          </h2>

          {pendingInvites.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noPending')}</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-background)' }}
                >
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {invite.requesterDisplayName}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {t('invitedYou')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="btn-professional-primary text-sm"
                    disabled={acceptingInviteId === invite.id}
                  >
                    {acceptingInviteId === invite.id ? t('accepting') : t('acceptInvite')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-professional p-8 space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t('rankingTitle')}
          </h2>

          {leaderboard.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noFriendsYet')}</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="rounded-xl p-4 border flex items-center justify-between"
                  style={{
                    borderColor: entry.isCurrentUser ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                    backgroundColor: 'var(--color-background)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                    >
                      {index + 1}
                    </div>
                    <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {entry.displayName}
                    </div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    {entry.highestScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
