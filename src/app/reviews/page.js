'use client';

import React, { useEffect, useState } from 'react';
import { Search, Delete, Check, Block, Edit, Star, StarOutline, Visibility } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertDialog from '@/components/AlertDialog';
import { useAppContext } from '@/context/AppContext';
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function ReviewsPage() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('text');
  const [filterDestination, setFilterDestination] = useState('all');
  const [editReview, setEditReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    review_type: 'text',
    destination: ''
  });
  const [selectedEditFile, setSelectedEditFile] = useState(null);
  const [selectedEditThumbnail, setSelectedEditThumbnail] = useState(null);

  const [deleteReview, setDeleteReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [viewReview, setViewReview] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    destination: ''
  });
  const [reviewType, setReviewType] = useState('none');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { user } = useAppContext();

  useEffect(() => {
    document.title = "Reviews Management - Tripknock";
    fetchReviews();
    fetchDestinations();
  }, []);

  const fetchReviews = async () => {
    setLoading('fetchReviews', true, 'Loading reviews...');
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        showError('Admin authentication not found');
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch('http://localhost:5000/reviews/all', {
        headers: {
          'admin': adminData.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);

      } else {
        showError('Failed to fetch reviews');
      }
    } catch (error) {
      console.log('Error fetching reviews:', error);
      showError('An error occurred while fetching reviews');
    } finally {
      setLoading('fetchReviews', false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch("http://localhost:5000/package/load");
      const result = await response.json();

      if (result.destination) {
        let set = new Set(result.destination.map(dest => dest.name));
        setDestinations(Array.from(set));
      }
    } catch (error) {
      console.log('Error fetching destinations:', error);
      showError('Failed to load destinations');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleDestinationFilterChange = (e) => {
    setFilterDestination(e.target.value);
  };

  const handleEditClick = (review) => {
    setEditReview(review);
    setEditFormData({
      name: review.name,
      rating: review.rating,
      comment: review.comment || '',
      review_type: review.review_type || 'text',
      destination: review.destination || ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (e) => {
    setEditFormData(prev => ({
      ...prev,
      rating: e.target.value
    }));
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSelectedEditFile(files);
  };

  const handleEditThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedEditThumbnail(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading('editReview', true, 'Updating review...');

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        showError('Admin authentication not found');
        setLoading('editReview', false);
        return;
      }

      const adminData = JSON.parse(authCookie);

      // Check if we need to use the media endpoint
      const hasFileToUpload = (selectedEditFile !== null && selectedEditFile.length > 0) || selectedEditThumbnail !== null;
      let response;

      if (hasFileToUpload) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('id', editReview.id);
        formData.append('name', editFormData.name);
        formData.append('rating', editFormData.rating);
        formData.append('comment', editFormData.comment);
        formData.append('review_type', editFormData.review_type);
        formData.append('destination', editFormData.destination);

        // Append thumbnail image if selected (for video reviews)
        if (selectedEditThumbnail) {
          formData.append('thumbnail', selectedEditThumbnail);
        }

        // Append the multiple images for text reviews or video for video reviews
        if (selectedEditFile && selectedEditFile.length > 0) {
          if (editFormData.review_type === 'text') {
            selectedEditFile.forEach((file) => {
              formData.append('image', file);
            });
          } else {
            formData.append('video', selectedEditFile[0]); // Take first video file for video reviews
          }
        }

        response = await fetch('http://localhost:5000/reviews/edit-with-media', {
          method: 'POST',
          headers: {
            'admin': adminData.email
          },
          body: formData
        });
      } else {
        // Use JSON for text-only updates
        response = await fetch('http://localhost:5000/reviews/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'admin': adminData.email
          },
          body: JSON.stringify({
            id: editReview.id,
            name: editFormData.name,
            rating: editFormData.rating,
            comment: editFormData.comment,
            review_type: editFormData.review_type,
            destination: editFormData.destination
          })
        });
      }

      if (response.ok) {
        const result = await response.json();
        showSuccess('Review updated successfully');
        setEditReview(null);
        setSelectedEditFile(null);
        setSelectedEditThumbnail(null);
        fetchReviews();
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to update review');
      }
    } catch (error) {
      console.log('Error updating review:', error);
      showError('An error occurred while updating the review');
    } finally {
      setLoading('editReview', false);
    }
  };

  const handleViewClick = (review) => {
    setViewReview(review);
  };

  const handleDeleteClick = (review) => {
    setDeleteReview(review);
  };

  const confirmDelete = async () => {
    setLoading('deleteReview', true, 'Deleting review...');

    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        showError('Admin authentication not found');
        setLoading('deleteReview', false);
        return;
      }

      const adminData = JSON.parse(authCookie);
      const response = await fetch(`http://localhost:5000/reviews/delete/${deleteReview.id}`, {
        method: 'DELETE',
        headers: {
          'admin': adminData.email
        }
      });

      if (response.ok) {
        // Remove the review from the local state
        setReviews(prevReviews =>
          prevReviews.filter(r => r.id !== deleteReview.id)
        );
        showSuccess('Review deleted successfully');
        setDeleteReview(null);
      } else {
        showError('Failed to delete review');
      }
    } catch (error) {
      console.log('Error deleting review:', error);
      showError('An error occurred while deleting review');
    } finally {
      setLoading('deleteReview', false);
    }
  };

  const handleOpenSubmitForm = () => {
    console.log("Opening submit form");
    setShowSubmitForm(true);
    setFormData({
      name: '',
      rating: 5,
      comment: '',
      destination: ''
    });
    setReviewType('none');
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitLoading(false);
  };

  const handleCloseSubmitForm = () => {
    setShowSubmitForm(false);
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRatingChange = (e) => {
    setFormData(prev => ({
      ...prev,
      rating: e.target.value
    }));
  };

  const handleReviewTypeChange = (e) => {
    const newReviewType = e.target.value;
    setReviewType(newReviewType);
    setSelectedFile(null);
    setSelectedThumbnail(null);

    // Clear any existing errors when changing review type
    if (submitError && submitError.includes('review type')) {
      setSubmitError('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSelectedFile(files);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedThumbnail(file);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Validate review type selection
      if (!reviewType || reviewType === 'none') {
        setSubmitError('Please select a review type');
        setSubmitLoading(false);
        return;
      }

      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        setSubmitError('Admin authentication not found');
        setSubmitLoading(false);
        return;
      }

      const adminData = JSON.parse(authCookie);

      // Use FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('rating', formData.rating);
      submitFormData.append('comment', formData.comment);
      submitFormData.append('review_type', reviewType);
      submitFormData.append('destination', formData.destination);

      // For video reviews, append thumbnail if provided
      if (reviewType === 'video' && selectedThumbnail) {
        submitFormData.append('thumbnail', selectedThumbnail);
      }

      // Append files based on review type
      if (selectedFile && selectedFile.length > 0) {
        if (reviewType === 'text') {
          selectedFile.forEach((file) => {
            submitFormData.append('image', file);
          });
        } else {
          submitFormData.append('video', selectedFile[0]);
        }
      }

      const response = await fetch('http://localhost:5000/reviews/submit', {
        method: 'POST',
        headers: {
          'admin': adminData.email
        },
        body: submitFormData
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitSuccess(true);
        setSubmitError('');

        // Reset form
        setFormData({
          name: '',
          rating: 5,
          comment: '',
          destination: ''
        });
        setSelectedFile(null);
        setSelectedThumbnail(null);

        // Close form after a short delay
        setTimeout(() => {
          setShowSubmitForm(false);
          setSubmitSuccess(false);
          fetchReviews();
        }, 1500);

      } else {
        const errorData = await response.json();
        setSubmitError(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.log('Error submitting review:', error);
      setSubmitError('An error occurred while submitting the review');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter reviews based on search query, type filter, and destination filter
  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.designation && review.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all' ||
      review.review_type === filterType;

    const matchesDestination =
      filterDestination === 'all' ||
      review.destination == filterDestination ||
      review.destination === filterDestination ||
      String(review.destination) === String(filterDestination);

    return matchesSearch && matchesType && matchesDestination;
  });

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="text-yellow-500" />);
      } else {
        stars.push(<StarOutline key={i} className="text-gray-400" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  const handleCloseEditForm = () => {
    setEditReview(null);
    setSelectedEditFile(null);
    setSelectedEditThumbnail(null);
  };

  // Helper function to get destination name
  const getDestinationName = (destinationId) => {
    if (!destinationId || !destinations.length) return '-';

    // Find destination by ID (handle both string and number comparison)
    const destination = destinations.find(dest =>
      dest.id == destinationId || dest.id === destinationId ||
      String(dest.id) === String(destinationId)
    );

    return destination?.title || destinationId || '-';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Reviews Management</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">All Reviews</h2>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="all">All Types</option>
              <option value="text">Text Reviews</option>
              <option value="video">Video Reviews</option>
            </select>
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filterDestination}
              onChange={handleDestinationFilterChange}
            >
              <option value="all">All Destinations</option>
              {destinations.map((destination, index) => (
                <option key={index} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenSubmitForm()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Review
          </button>
        </div>

        {isLoading('fetchReviews') ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="mb-4">No reviews found matching your criteria.</p>
            <button
              onClick={() => handleOpenSubmitForm()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Your First Review
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{review.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{review.review_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getDestinationName(review.destination)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.date}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewClick(review)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Visibility />
                        </button>
                        <button
                          onClick={() => handleEditClick(review)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(review)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Review Details</h2>
                <button
                  onClick={() => setViewReview(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{viewReview.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Review Type</p>
                      <p className="text-base text-gray-900 capitalize">{viewReview.review_type || 'text'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-base text-gray-900">{new Date(viewReview.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Destination</p>
                      <p className="text-base text-gray-900">
                        {getDestinationName(viewReview.destination)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Image */}
                {viewReview.profile_image_url && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Image</h3>
                    <div className="mt-2">
                      <img
                        src={`http://localhost:5000${viewReview.profile_image_url}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Rating - only for text reviews */}
                {(!viewReview.review_type || viewReview.review_type === 'text') && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Rating</h3>
                    <div className="mt-2">
                      {renderStarRating(viewReview.rating)}
                    </div>
                  </div>
                )}

                {/* Comment - only for text reviews */}
                {(!viewReview.review_type || viewReview.review_type === 'text') && viewReview.comment && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Comment</h3>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{viewReview.comment}</p>
                    </div>
                  </div>
                )}

                {/* Review Images */}
                {viewReview.review_images && viewReview.review_images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Review Images</h3>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {viewReview.review_images.map((imageObj, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${imageObj.url || imageObj}`}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Media */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Media</h3>
                  <div className="mt-2">
                    {viewReview.image_url ? (
                      <div className="mt-4">
                        <img
                          src={`http://localhost:5000${viewReview.image_url}`}
                          alt="Review"
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    ) : viewReview.video_url ? (
                      <div className="mt-4">
                        <video
                          src={`http://localhost:5000${viewReview.video_url}`}
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          controls
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const errorMsg = document.createElement('p');
                            errorMsg.textContent = 'Video could not be loaded';
                            errorMsg.className = 'text-red-500 text-sm';
                            e.target.parentNode.appendChild(errorMsg);
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500">No media attached</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewReview(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Review</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={editFormData.rating}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Review Type
                  </label>
                  <select
                    name="review_type"
                    value={editFormData.review_type}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="text">Text Review</option>
                    <option value="video">Video Review</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Destination
                  </label>
                  <select
                    name="destination"
                    value={editFormData.destination}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest, index) => (
                      <option key={index} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
                {editFormData.review_type === 'text' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Comment
                    </label>
                    <textarea
                      name="comment"
                      value={editFormData.comment}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows="4"
                      required={editFormData.review_type === 'text'}
                    ></textarea>
                  </div>
                )}

                {/* Video Thumbnail Preview - Only for video reviews */}
                {editReview && editReview.review_type === 'video' && editReview.thumbnail_url && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Current Video Thumbnail
                    </label>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <img
                        src={`http://localhost:5000${editReview.thumbnail_url}`}
                        alt="Video Thumbnail"
                        className="w-32 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Review Images Preview */}
                {editReview && editReview.review_images && editReview.review_images.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Current Review Images
                    </label>
                    <div className="border rounded-lg p-2 bg-gray-50 grid grid-cols-3 gap-2">
                      {editReview.review_images.map((imageObj, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${imageObj.url || imageObj}`}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {editReview && editReview.video_url && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video Preview
                    </label>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <video
                        src={`http://localhost:5000${editReview.video_url}`}
                        className="max-w-xs max-h-40"
                        controls
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const errorMsg = document.createElement('p');
                          errorMsg.textContent = 'Video could not be loaded';
                          errorMsg.className = 'text-red-500 text-sm';
                          e.target.parentNode.appendChild(errorMsg);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Video Thumbnail Upload - Only for video reviews */}
                {editFormData.review_type === 'video' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video Thumbnail
                    </label>
                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleEditThumbnailChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a thumbnail image for the video review.
                    </p>
                  </div>
                )}

                {editFormData.review_type === 'text' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Review Images (Multiple)
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleEditFileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep the current images, or select new ones to replace them.
                    </p>
                  </div>
                )}
                {editFormData.review_type === 'video' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video (Optional)
                    </label>
                    <input
                      type="file"
                      name="video"
                      accept="video/*"
                      onChange={handleEditFileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep the current video, or select a new one to replace it.
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseEditForm}
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
        </div>
      )}

      {/* Submit Review Form */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Submit Review</h2>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Destination
                  </label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest, index) => (
                      <option key={index} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleSubmitRatingChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Review Type
                  </label>
                  <select
                    name="review_type"
                    value={reviewType}
                    onChange={handleReviewTypeChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="none">Select Review Type</option>
                    <option value="text">Text Review</option>
                    <option value="video">Video Review</option>
                  </select>
                  {reviewType === 'none' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Please select a review type to see additional fields
                    </p>
                  )}
                </div>
                {/* Video Thumbnail Upload - Only for video reviews */}
                {reviewType === 'video' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video Thumbnail
                    </label>
                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a thumbnail image for the video review.
                    </p>
                  </div>
                )}
                {reviewType === 'text' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Comment
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows="4"
                      required={reviewType === 'text'}
                    ></textarea>
                  </div>
                )}
                {reviewType === 'text' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Review Images (Multiple)
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
                {reviewType === 'video' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video
                    </label>
                    <input
                      type="file"
                      name="video"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                )}
                {submitError && (
                  <div className="mb-4">
                    <p className="text-red-500 text-sm">{submitError}</p>
                  </div>
                )}
                {submitSuccess && (
                  <div className="mb-4">
                    <p className="text-green-500 text-sm">Review submitted successfully!</p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseSubmitForm}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={submitLoading || reviewType === 'none'}
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel={isLoading('deleteReview') ? "Deleting..." : "Delete"}
        confirmVariant="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteReview(null)}
        disabled={isLoading('deleteReview')}
      />

      {/* Floating Action Button for adding review */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => handleOpenSubmitForm()}
          className="w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
          title="Add New Review"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
