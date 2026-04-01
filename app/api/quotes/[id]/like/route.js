import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Quote from '@/models/Quote';

export async function POST(request, { params }) {
  try {
    const username = request.headers.get('x-user-username');
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();
    const quote = await Quote.findById(id);

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const likeIndex = quote.likes.indexOf(username);
    if (likeIndex > -1) {
      // User already liked it, so unlike
      quote.likes.splice(likeIndex, 1);
    } else {
      // Add like
      quote.likes.push(username);
    }

    await quote.save();

    return NextResponse.json(quote, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}
