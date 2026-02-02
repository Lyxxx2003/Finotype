import { NextRequest, NextResponse } from 'next/server';

// Simple share link API that generates a shareable URL
// In a real app, you might want to store share metadata in a database
export async function POST(request: NextRequest) {
  try {
    const { resultId, type, locale } = await request.json();
    
    if (!resultId || !type || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate the share URL based on type (pro or standard)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://finotype.vercel.app';
    const shareUrl = `${baseUrl}/${locale}/${type}/results?id=${resultId}`;

    // In a production app, you might want to:
    // 1. Generate a short URL using a service
    // 2. Store share analytics
    // 3. Generate Open Graph preview images
    
    return NextResponse.json({
      success: true,
      shareUrl,
      shortUrl: shareUrl, // Would be shortened in production
    });
  } catch (error) {
    console.error('Share link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
