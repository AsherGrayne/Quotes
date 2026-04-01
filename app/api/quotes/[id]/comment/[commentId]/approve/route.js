import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Comment from '@/models/Comment';

export async function PUT(request, { params }) {
  try {
    const username = request.headers.get('x-user-username');
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only these two can approve
    const isAdmin = username === 'Fathema Begum' || username === 'Pratick Choudhury';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { commentId } = await params;

    await connectToDatabase();
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    comment.approved = true;
    await comment.save();

    return NextResponse.json(comment, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 });
  }
}
