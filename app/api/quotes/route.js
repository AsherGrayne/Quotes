import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Quote from '@/models/Quote';
import Comment from '@/models/Comment';
import Like from '@/models/Like';

export async function GET() {
  try {
    await connectToDatabase();
    const quotes = await Quote.find().sort({ createdAt: -1 }).lean();
    const comments = await Comment.find().lean();
    const allLikes = await Like.find().lean();
    
    // Attach comments and likes to quotes manually
    const populatedQuotes = quotes.map(q => {
      q.comments = comments.filter(c => c.quoteId.toString() === q._id.toString());
      // Instead of relying on q.likes (which might be Old Data), fetch from Like collection
      const quoteLikes = allLikes.filter(l => l.quoteId.toString() === q._id.toString());
      // We also merge existing likes array from Quote model to migrate smoothly, or just use the Like collection.
      // To strictly use the "likes" collection:
      const usernamesSet = new Set(quoteLikes.map(l => l.username));
      
      // Optionally merge quote.likes if they exist during migration:
      if (q.likes && Array.isArray(q.likes)) {
        q.likes.forEach(u => usernamesSet.add(u));
      }
      
      q.likes = Array.from(usernamesSet);
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
