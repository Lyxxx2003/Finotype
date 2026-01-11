import { NextResponse } from 'next/server';
import { analyzeBehavior } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { events } = await req.json();
    const result = await analyzeBehavior(events);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
