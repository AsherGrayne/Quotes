'use client';

import { useState, useEffect } from 'react';
import { Quote, User, Calendar, Heart, MessageSquare, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (quoteId) => {
    try {
      setQuotes((currentQuotes) =>
        currentQuotes.map((q) => {
          if (q._id === quoteId) {
            const hasLiked = currentUser && q.likes.includes(currentUser);
            let newLikes = [...q.likes];
            if (hasLiked) {
              newLikes = newLikes.filter((u) => u !== currentUser);
            } else if (currentUser) {
              newLikes.push(currentUser);
            }
            return { ...q, likes: newLikes };
          }
          return q;
        })
      );

      const res = await fetch(`/api/quotes/${quoteId}/like`, { method: 'POST' });
      if (!res.ok) fetchQuotes();
    } catch (err) {
      console.error(err);
      fetchQuotes();
    }
  };

  const handleCommentSubmit = async (quoteId) => {
    const text = commentInputs[quoteId];
    if (!text || text.trim() === '') return;

    try {
      const res = await fetch(`/api/quotes/${quoteId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setCommentInputs({ ...commentInputs, [quoteId]: '' });
        fetchQuotes();
      } else {
        const errorData = await res.json();
        alert(errorData.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveComment = async (quoteId, commentId) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/comment/${commentId}/approve`, {
        method: 'PUT',
      });
      if (res.ok) fetchQuotes();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (quoteId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [quoteId]: !prev[quoteId]
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isAdmin = currentUser === 'Fathema Begum' || currentUser === 'Pratick Choudhury';

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading wisdom...</div>;
  }

  return (
    <>
      <h1 className="page-title">Timeless Thoughts</h1>
      <div className="quotes-list">
        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>No quotes yet. Be the first to upload!</div>
        ) : (
          quotes.map((quote) => {
            const hasLiked = currentUser && quote.likes.includes(currentUser);
            const visibleComments = quote.comments?.filter(c => c.approved || isAdmin || c.author === currentUser) || [];
            const isQuoteFromAdmin = quote.author === 'Fathema Begum' || quote.author === 'Pratick Choudhury';
            const isExpanded = expandedComments[quote._id];

            return (
              <div key={quote._id} className="quote-card">
                <div className="quote-icon-wrapper">
                  <Quote size={24} fill="#0b1021" />
                </div>
                
                <p className="quote-text">"{quote.text}"</p>
                
                <div className="quote-meta">
                  <div className="meta-row">
                    <User className="meta-icon" />
                    <span>{quote.author}</span>
                  </div>
                  <div className="meta-row">
                    <Calendar className="meta-icon" />
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                </div>

                <div className="quote-footer" style={{ borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: isExpanded ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="tag-badge">{quote.category}</div>
                    <button 
                      onClick={() => toggleComments(quote._id)}
                      style={{ 
                        background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.5rem' 
                      }}
                    >
                      <MessageSquare size={16} /> {visibleComments.length} {visibleComments.length === 1 ? 'Comment' : 'Comments'}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  
                  <button 
                    className={`like-button ${hasLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(quote._id)}
                    aria-label="Like quote"
                  >
                    <Heart className="heart-icon" />
                  </button>
                </div>

                {/* Animated Expanding Comments Section */}
                {isExpanded && (
                  <div className="comments-section" style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
                    
                    {visibleComments.length === 0 && <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textAlign: 'center' }}>No comments displayed.</p>}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {visibleComments.map(c => (
                        <div key={c._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderLeft: c.approved ? '3px solid transparent' : '3px solid #f59e0b', borderRadius: '8px', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.author} <span style={{color: 'var(--text-secondary)', fontWeight: '400', fontSize: '0.8rem', marginLeft: '0.5rem'}}>{formatDate(c.createdAt)}</span></span>
                          </div>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--accent)' }}>{c.text}</p>
                          
                          {!c.approved && (
                            <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>(Pending Approval)</span>
                              {isAdmin && (
                                <button 
                                  onClick={() => handleApproveComment(quote._id, c._id)}
                                  style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.color = '#10b981'; }}
                                >
                                  <CheckCircle size={14} /> Approve
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {currentUser && isQuoteFromAdmin ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="Add a comment..."
                          className="form-input"
                          style={{ borderRadius: '100px' }}
                          value={commentInputs[quote._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [quote._id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(quote._id);
                          }}
                        />
                        <button 
                          className="submit-btn" 
                          style={{ width: 'auto', padding: '0.5rem 1.5rem', borderRadius: '100px' }}
                          onClick={() => handleCommentSubmit(quote._id)}
                        >
                          Post
                        </button>
                      </div>
                    ) : (currentUser ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                        Comments are disabled for quotes not from specific authors.
                      </p>
                    ) : null)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </>
  );
}
