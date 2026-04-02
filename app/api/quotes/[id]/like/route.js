import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Quote from '@/models/Quote';
import Like from '@/models/Like';

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

    // Process using Like collection
    const existingLike = await Like.findOne({ quoteId: id, username });

    if (existingLike) {
      // User already liked it, so unlike
      await Like.deleteOne({ _id: existingLike._id });
      
      // Also clean up from old quote.likes if it exists
      const likeIndex = quote.likes.indexOf(username);
      if (likeIndex > -1) {
        quote.likes.splice(likeIndex, 1);
        await quote.save();
      }
    } else {
      // Add like
      await Like.create({ quoteId: id, username });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}
