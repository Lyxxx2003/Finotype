'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

type BugReport = {
  id: string;
  locale: string;
  page_url: string;
  expected: string;
  actual: string;
  details: string | null;
  created_at: string;
};

export default function BugReportPage() {
  const t = useTranslations('bugReport');
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = String(params.locale ?? 'en');

  const [pageUrl, setPageUrl] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reports, setReports] = useState<BugReport[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sourceParam = searchParams.get('source');
      if (sourceParam) {
        if (sourceParam.startsWith('http://') || sourceParam.startsWith('https://')) {
          setPageUrl(sourceParam);
        } else {
          setPageUrl(new URL(sourceParam, window.location.origin).toString());
        }
      } else {
        setPageUrl(window.location.href);
      }
    } else {
      setPageUrl(pathname || '');
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/${locale}/api/bug-report`, { cache: 'no-store' });
        const data = await response.json();
        setReports(Array.isArray(data?.reports) ? data.reports : []);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [locale]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (!pageUrl.trim() || !expected.trim() || !actual.trim()) {
      setMessage(t('requiredError'));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/${locale}/api/bug-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          pageUrl,
          expected,
          actual,
          details,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || t('submitError'));
        return;
      }

      const created = data?.report as BugReport | undefined;
      if (created) {
        setReports((prev) => [created, ...prev].slice(0, 30));
      }
      setExpected('');
      setActual('');
      setDetails('');
      setMessage(t('submitSuccess'));
    } catch {
      setMessage(t('submitError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: 'var(--color-text)' }}
        >
          {t('title')}
        </h1>

        <p
          className="text-lg mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('subtitle')}
        </p>

        <div className="rounded-2xl p-6 border" style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-surface, rgba(255,255,255,0.65))' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('submitTitle')}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {t('pageUrl')}
              </label>
              <input
                className="input-professional w-full"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder={t('pageUrlPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {t('expected')}
              </label>
              <textarea
                className="input-professional w-full min-h-[110px]"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder={t('expectedPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {t('actual')}
              </label>
              <textarea
                className="input-professional w-full min-h-[110px]"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder={t('actualPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {t('details')}
              </label>
              <textarea
                className="input-professional w-full min-h-[110px]"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('detailsPlaceholder')}
              />
            </div>

            <button type="submit" disabled={saving} className="btn-professional-primary disabled:opacity-50">
              {saving ? t('submitting') : t('submitButton')}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {message}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
