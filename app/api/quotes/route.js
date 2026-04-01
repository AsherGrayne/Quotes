import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Quote from '@/models/Quote';
import Comment from '@/models/Comment';

export async function GET() {
  try {
    await connectToDatabase();
    const quotes = await Quote.find().sort({ createdAt: -1 }).lean();
    const comments = await Comment.find().lean();
    
    // Attach comments to quotes manually
    const populatedQuotes = quotes.map(q => {
      q.comments = comments.filter(c => c.quoteId.toString() === q._id.toString());
      return q;
    });

    return NextResponse.json(populatedQuotes);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const username = request.headers.get('x-user-username');
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, category } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    await connectToDatabase();
    const newQuote = await Quote.create({
      text,
      author: username,
      category: category || 'Education',
    });

    return NextResponse.json(newQuote, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
