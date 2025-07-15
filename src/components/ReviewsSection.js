'use client';

import { useState, useEffect } from 'react';
import { Star, StarOutline, NavigateBefore, NavigateNext, Visibility } from '@mui/icons-material';
import Link from 'next/link';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewReview, setViewReview] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [reviewType, setReviewType] = useState('text');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://data.tripknock.in/reviews/approved');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.log('Failed to fetch reviews');
      }
    } catch (error) {
      console.log('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : reviews.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < reviews.length - 1 ? prevIndex + 1 : 0));
  };

  const handleViewClick = () => {
    setViewReview(reviews[currentIndex]);
  };

  const handleOpenSubmitForm = () => {
    setShowSubmitForm(true);
    setFormData({
      name: '',
      rating: 5,
      comment: '',
    });
    setReviewType('text');
    setSelectedFile(null);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleCloseSubmitForm = () => {
    setShowSubmitForm(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  const handleReviewTypeChange = (type) => {
    setReviewType(type);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    // Validate form
    if (!formData.name) {
      setSubmitError('Name is required');
      setSubmitLoading(false);
      return;
    }

    // For video reviews, ensure a video is uploaded
    if (reviewType === 'video' && !selectedFile) {
      setSubmitError('Please upload a video for your review');
      setSubmitLoading(false);
      return;
    }

    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('review_type', reviewType);
      let endpoint = '';

      if (reviewType === 'text') {
        // For text reviews, include rating and comment
        submitData.append('rating', formData.rating);
        submitData.append('comment', formData.comment);
        
        // Only append image if one is selected for text review
        if (selectedFile) {
          submitData.append('image', selectedFile);
        }
        endpoint = 'https://data.tripknock.in/reviews/add-with-image';
      } else {
        // For video review, no rating or comment needed
        submitData.append('video', selectedFile);
        endpoint = 'https://data.tripknock.in/reviews/add-with-video';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          rating: 5,
          comment: '',
        });
        setSelectedFile(null);
        
        // Refresh the reviews after successful submission
        setTimeout(() => {
          fetchReviews();
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.log('Error submitting review:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show the section if there are no reviews
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Read testimonials from our satisfied customers who have experienced our services.
          </p>
          <button
            onClick={handleOpenSubmitForm}
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-8"
          >
            Share Your Experience
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {reviews.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100"
                >
                  <NavigateBefore className="text-gray-600" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100"
                >
                  <NavigateNext className="text-gray-600" />
                </button>
              </>
            )}

            <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
              <div className="flex flex-col items-center">
                {reviews[currentIndex].image_url ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img
                      src={`https://data.tripknock.in${reviews[currentIndex].image_url}`}
                      alt={reviews[currentIndex].name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-avatar.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <span className="text-primary-600 text-2xl font-bold">
                      {reviews[currentIndex].name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <p className="font-bold text-gray-900">{reviews[currentIndex].name}</p>
                </div>

                {/* Rating - only for text reviews */}
                {(!reviews[currentIndex].review_type || reviews[currentIndex].review_type === 'text') && (
                  <div className="mb-4">
                    {renderStarRating(reviews[currentIndex].rating)}
                  </div>
                )}

                {/* Comment - only for text reviews */}
                {(!reviews[currentIndex].review_type || reviews[currentIndex].review_type === 'text') && reviews[currentIndex].comment && (
                  <blockquote className="text-center my-6">
                    <p className="text-lg text-gray-700 italic">"{reviews[currentIndex].comment}"</p>
                  </blockquote>
                )}

                {reviews[currentIndex].image_url && (
                  <div className="mt-4">
                    <img
                      src={`https://data.tripknock.in${reviews[currentIndex].image_url}`}
                      alt={`Review by ${reviews[currentIndex].name}`}
                      className="w-full max-w-md mx-auto max-h-60 object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                )}
                {reviews[currentIndex].video_url && (
                  <div className="mt-4">
                    <video
                      src={`https://data.tripknock.in${reviews[currentIndex].video_url}`}
                      className="w-full max-w-md mx-auto max-h-60 object-contain rounded-lg"
                      controls
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const errorMsg = document.createElement('p');
                        errorMsg.textContent = 'Video could not be loaded';
                        errorMsg.className = 'text-red-500 text-sm text-center';
                        e.target.parentNode.appendChild(errorMsg);
                      }}
                    />
                  </div>
                )}

                {/* View full review button */}
                <div className="mt-4">
                  <button
                    onClick={handleViewClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Visibility /> View Full Review
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {reviews.length > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  aria-label="Previous review"
                >
                  <NavigateBefore />
                </button>
                <button
                  onClick={handleOpenSubmitForm}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Submit Your Review
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  aria-label="Next review"
                >
                  <NavigateNext />
                </button>
              </div>
            )}

            {/* Pagination dots */}
            {reviews.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer</h3>
                  <div className="mt-2 flex items-center">
                    {viewReview.image_url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                        <img
                          src={`https://data.tripknock.in${viewReview.image_url}`}
                          alt={viewReview.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-avatar.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                        <span className="text-primary-600 text-2xl font-bold">
                          {viewReview.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-medium text-gray-900">{viewReview.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(viewReview.date).toLocaleDateString()} • {viewReview.review_type || 'text'} review
                      </p>
                    </div>
                  </div>
                </div>
                
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
                
                {/* Media */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Media</h3>
                  <div className="mt-2">
                    {viewReview.image_url ? (
                      <div className="mt-4">
                        <img 
                          src={`https://data.tripknock.in${viewReview.image_url}`} 
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
                          src={`https://data.tripknock.in${viewReview.video_url}`} 
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

      {/* Submit Review Form */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Submit Your Review</h2>
                <button
                  onClick={handleCloseSubmitForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-lg font-medium text-gray-900" htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="block w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>

                  {/* Review Type */}
                  <div>
                    <label className="text-lg font-medium text-gray-900" htmlFor="review-type">Review Type:</label>
                    <div className="flex gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() => handleReviewTypeChange('text')}
                        className={`px-4 py-2 rounded-lg ${reviewType === 'text' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      >
                        Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewTypeChange('video')}
                        className={`px-4 py-2 rounded-lg ${reviewType === 'video' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      >
                        Video
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  {reviewType === 'text' && (
                    <div>
                      <label className="text-lg font-medium text-gray-900" htmlFor="rating">Rating:</label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingChange(rating)}
                            className={`w-8 h-8 rounded-full ${formData.rating === rating ? 'bg-yellow-500' : 'bg-gray-300'}`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {reviewType === 'text' && (
                    <div>
                      <label className="text-lg font-medium text-gray-900" htmlFor="comment">Comment:</label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleFormChange}
                        className="block w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring focus:ring-primary-600 focus:border-primary-600"
                      />
                    </div>
                  )}

                  {/* Image/Video Upload */}
                  {(reviewType === 'text' && !selectedFile) || reviewType === 'video' ? (
                    <div>
                      <label className="text-lg font-medium text-gray-900" htmlFor="media">Upload Media:</label>
                      <input
                        type="file"
                        id="media"
                        onChange={handleFileChange}
                        className="block w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring focus:ring-primary-600 focus:border-primary-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-900">Selected File:</p>
                      <p className="text-gray-700">{selectedFile.name}</p>
                    </div>
                  )}
                </div>

                {submitError && (
                  <p className="text-red-500 text-sm">{submitError}</p>
                )}

                {submitSuccess && (
                  <p className="text-green-500 text-sm">Review submitted successfully!</p>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
