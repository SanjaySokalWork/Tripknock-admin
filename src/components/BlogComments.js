'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Send } from '@mui/icons-material';

export default function BlogComments({ blogId, blogSlug }) {
  const { user, isLoggedIn } = useAppContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch comments for this blog post
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://data.tripknock.in/blog/comments/${blogId}`);
        const data = await response.json();
        setComments(data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching comments:', error);
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [blogId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('https://data.tripknock.in/blog/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          blogSlug,
          author: user?.name || 'Guest User',
          email: user?.email || '',
          content: newComment,
        }),
      });
      
      const result = await response.json();
      
      if (result.status) {
        // Add comment to UI with pending status
        const newCommentObj = {
          id: result.id,
          author: user?.name || 'Guest User',
          content: newComment,
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
        };
        
        setComments([...comments, newCommentObj]);
        setNewComment('');
        
        // Show success message or notification here
      } else {
        console.log('Error submitting comment:', result.message);
        // Show error message or notification here
      }
    } catch (error) {
      console.log('Error submitting comment:', error);
      // Show error message or notification here
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Comments ({comments.filter(c => c.status === 'approved').length})</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Comments List */}
          <div className="space-y-6 mb-8">
            {comments.filter(c => c.status === 'approved').length > 0 ? (
              comments
                .filter(c => c.status === 'approved')
                .map((comment) => (
                  <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium">{comment.author.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900">{comment.author}</h4>
                        <p className="text-xs text-secondary-500">{comment.date}</p>
                      </div>
                    </div>
                    <p className="text-secondary-700 pl-13">{comment.content}</p>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                No comments yet. Be the first to comment!
              </div>
            )}
            
            {/* Pending comment message */}
            {comments.some(c => c.status === 'pending') && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800 text-sm">
                Your comment has been submitted and is awaiting approval.
              </div>
            )}
          </div>
          
          {/* Comment Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">Leave a Comment</h3>
            
            {isLoggedIn ? (
              <form onSubmit={handleSubmitComment}>
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 text-secondary-600">
                Please <a href="/login" className="text-primary-600 hover:underline">log in</a> to leave a comment.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
