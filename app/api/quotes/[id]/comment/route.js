import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Quote from '@/models/Quote';
import Comment from '@/models/Comment';

export async function POST(request, { params }) {
  try {
    const username = request.headers.get('x-user-username');
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    await connectToDatabase();
    const quote = await Quote.findById(id);

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const isQuoteFromAdmin = quote.author === 'Fathema Begum' || quote.author === 'Pratick Choudhury';
    if (!isQuoteFromAdmin) {
      return NextResponse.json({ error: 'You can only comment on quotes from Fathema Begum or Pratick Choudhury' }, { status: 403 });
    }

    const isAdmin = username === 'Fathema Begum' || username === 'Pratick Choudhury';

    const newComment = await Comment.create({
      quoteId: id,
      text,
      author: username,
      approved: isAdmin,
    });

    return NextResponse.json(newComment, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add comment: ' + err.message }, { status: 500 });
  }
}
