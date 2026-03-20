import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type BugReportPayload = {
  locale?: string;
  pageUrl?: string;
  expected?: string;
  actual?: string;
  details?: string;
};

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bug_report')
      .select('id, locale, page_url, expected, actual, details, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 });
    }

    return NextResponse.json({ reports: data ?? [] });
  } catch (error) {
    console.error('GET /api/bug-report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BugReportPayload;

    const locale = normalize(body.locale).slice(0, 10);
    const pageUrl = normalize(body.pageUrl).slice(0, 500);
    const expected = normalize(body.expected).slice(0, 2000);
    const actual = normalize(body.actual).slice(0, 2000);
    const details = normalize(body.details).slice(0, 4000);

    if (!locale || !pageUrl || !expected || !actual) {
      return NextResponse.json(
        { error: 'Missing required fields: locale, pageUrl, expected, actual' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bug_report')
      .insert({
        locale,
        page_url: pageUrl,
        expected,
        actual,
        details: details || null,
      })
      .select('id, locale, page_url, expected, actual, details, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save bug report' }, { status: 500 });
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bug-report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
