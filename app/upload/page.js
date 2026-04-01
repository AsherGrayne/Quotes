'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadQuote() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Education');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Quote text is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload quote');
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h2>Upload a New Quote</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="text">Quote Text</label>
            <textarea
              id="text"
              className="form-input textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              placeholder={'e.g. "Weeding out hatred..."'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Education">Education</option>
              <option value="Literature">Literature</option>
              <option value="Art">Art</option>
              <option value="Philosophy">Philosophy</option>
              <option value="History">History</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Quote'}
          </button>
        </form>
      </div>
    </div>
  );
}
