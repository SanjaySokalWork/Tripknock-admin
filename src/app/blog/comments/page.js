'use client';

import React, { useEffect, useState } from 'react';
import { Search, Delete, Check, Block, Edit } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertDialog from '@/components/AlertDialog';
import { useAppContext } from '@/context/AppContext';
import Cookies from 'js-cookie';

export default function CommentsPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editComment, setEditComment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    author: '',
    email: '',
    phone: '',
    content: '',
    status: ''
  });
  const [deleteComment, setDeleteComment] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

  const { user } = useAppContext();

  // Sample data - replace with actual API call
  const [comments, setComments] = useState([]);

  useEffect(() => {
    document.title = "Blog Comments - Tripknock";
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        console.warn('Admin authentication not found');
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch('https://data.tripknock.in/blog/comments/all', {
        headers: {
          'admin': adminData.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.log('Failed to fetch comments');
      }
    } catch (error) {
      console.log('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleEditClick = (comment) => {
    setEditComment(comment);
    setEditFormData({
      author: comment.author,
      email: comment.email,
      phone: comment.phone || '',
      content: comment.content,
      status: comment.status
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        console.warn('Admin authentication not found');
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch('https://data.tripknock.in/blog/comments/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminData.email
        },
        body: JSON.stringify({
          id: editComment.id,
          ...editFormData
        })
      });

      if (response.ok) {
        // Update the comment in the local state
        setComments(prevComments =>
          prevComments.map(c => {
            if (c.id === editComment.id) {
              return { ...c, ...editFormData };
            } else if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(reply =>
                  reply.id === editComment.id ? { ...reply, ...editFormData } : reply
                )
              };
            }
            return c;
          })
        );
        setEditComment(null);
      } else {
        console.log('Failed to update comment');
      }
    } catch (error) {
      console.log('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (comment) => {
    setDeleteComment(comment);
  };

  const confirmDelete = async () => {
    setLoading(true);

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        console.warn('Admin authentication not found');
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch(`https://data.tripknock.in/blog/comments/delete/${deleteComment.id}`, {
        method: 'DELETE',
        headers: {
          'admin': adminData.email
        }
      });

      if (response.ok) {
        // Remove the comment from the local state
        if (deleteComment.parent_id) {
          // If it's a reply, remove it from its parent's replies
          setComments(prevComments =>
            prevComments.map(c => {
              if (c.id === deleteComment.parent_id) {
                return {
                  ...c,
                  replies: c.replies.filter(reply => reply.id !== deleteComment.id)
                };
              }
              return c;
            })
          );
        } else {
          // If it's a root comment, remove it completely
          setComments(prevComments =>
            prevComments.filter(c => c.id !== deleteComment.id)
          );
        }
        setDeleteComment(null);
      } else {
        console.log('Failed to delete comment');
      }
    } catch (error) {
      console.log('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (comment, newStatus) => {
    setLoading(true);

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        console.warn('Admin authentication not found');
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch(`https://data.tripknock.in/blog/comments/moderate/${comment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminData.email
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        // Update the comment status in the local state
        setComments(prevComments =>
          prevComments.map(c => {
            if (c.id === comment.id) {
              return { ...c, status: newStatus };
            } else if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(reply =>
                  reply.id === comment.id ? { ...reply, status: newStatus } : reply
                )
              };
            }
            return c;
          })
        );
      } else {
        console.log('Failed to update comment status');
      }
    } catch (error) {
      console.log('Error updating comment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (comment) => {
    setReplyToComment(comment);
    setReplyContent('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setLoading(true);

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        console.warn('Admin authentication not found');
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch('https://data.tripknock.in/blog/comments/admin-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminData.email
        },
        body: JSON.stringify({
          blogId: replyToComment.blog_id,
          content: replyContent,
          parentId: replyToComment.id
        })
      });

      if (response.ok) {
        // Refresh comments to get the new reply
        fetchComments();
        setReplyToComment(null);
      } else {
        console.log('Failed to add reply');
      }
    } catch (error) {
      console.log('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Filter comments based on search query and status filter
  const filteredComments = comments.filter(comment => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      comment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Comments</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search comments..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredComments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No comments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <React.Fragment key={comment.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{comment.author}</div>
                            <div className="text-sm text-gray-500">{comment.email}</div>
                            <div className="text-sm text-gray-500">{comment.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md break-words">{comment.content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comment.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : comment.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {comment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {comment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {comment.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(comment, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check />
                              </button>
                            )}
                            {comment.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(comment, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <Block />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditClick(comment)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(comment)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Delete />
                            </button>
                            <button
                              onClick={() => handleReplyClick(comment)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs border border-blue-600 rounded"
                            >
                              Reply
                            </button>
                            {comment.replies && comment.replies.length > 0 && (
                              <button
                                onClick={() => toggleReplies(comment.id)}
                                className="text-gray-600 hover:text-gray-900 px-2 py-1 text-xs border border-gray-300 rounded"
                              >
                                {expandedComments[comment.id] ? 'Hide Replies' : `Show Replies (${comment.replies.length})`}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Replies section */}
                      {comment.replies && expandedComments[comment.id] && (
                        <>
                          {comment.replies.map(reply => (
                            <tr key={reply.id} className="bg-gray-50">
                              <td className="px-6 py-4 pl-12 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <div className="text-sm font-medium text-gray-900 flex items-center">
                                    {reply.author}
                                    {reply.is_admin_reply && (
                                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{reply.email}</div>
                                  <div className="text-sm text-gray-500">{reply.phone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-md break-words">
                                  <span className="text-gray-400 mr-2">↪</span>
                                  {reply.content}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reply.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : reply.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                  {reply.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {reply.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  {!reply.is_admin_reply && reply.status !== 'approved' && (
                                    <button
                                      onClick={() => handleStatusChange(reply, 'approved')}
                                      className="text-green-600 hover:text-green-900"
                                      title="Approve"
                                    >
                                      <Check />
                                    </button>
                                  )}
                                  {!reply.is_admin_reply && reply.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleStatusChange(reply, 'rejected')}
                                      className="text-red-600 hover:text-red-900"
                                      title="Reject"
                                    >
                                      <Block />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleEditClick(reply)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit"
                                  >
                                    <Edit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(reply)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <Delete />
                                  </button>
                                  {/* <button
                                    onClick={() => handleReplyClick(reply)}
                                    className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs border border-blue-600 rounded"
                                  >
                                    Reply
                                  </button> */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Comment Modal */}
      {editComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Comment</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={editFormData.author}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={editFormData.content}
                  onChange={handleEditFormChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditComment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyToComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reply to Comment</h2>
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{replyToComment.author}:</p>
              <p className="text-sm text-gray-600">{replyToComment.content}</p>
            </div>
            <form onSubmit={handleReplySubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your reply here..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReplyToComment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deleteComment}
        title="Delete Comment"
        message={`Are you sure you want to delete this comment${deleteComment?.replies?.length > 0 ? ' and all its replies' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteComment(null)}
      />
    </div>
  );
}
