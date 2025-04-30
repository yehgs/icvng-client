import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaUser,
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { formatDistanceToNow } from 'date-fns';
import ConfirmBox from './ConfirmBox';

const RatingReviewComponent = ({ productId, onRatingAdded }) => {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userExistingRating, setUserExistingRating] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Fetch ratings for this product
  const fetchRatings = async () => {
    try {
      setRatingLoading(true);
      const response = await Axios({
        ...SummaryApi.getRatings,
        params: { product: productId },
      });

      if (response.data.success) {
        setRatings(response.data.data);

        // Check if user has already rated
        if (isLoggedIn) {
          const userRatingExists = response.data.data.find(
            (rating) => rating.user._id === user._id
          );

          if (userRatingExists) {
            setUserHasRated(true);
            setUserExistingRating(userRatingExists);
            setUserRating(userRatingExists.rating);
            setReview(userRatingExists.review || '');
          } else {
            setUserHasRated(false);
            setUserExistingRating(null);
          }
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setRatingLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchRatings();
    }
  }, [productId, user]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please login to submit a review');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.addRating,
        data: {
          product: productId,
          rating: userRating,
          review: review,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserRating(0);
        setReview('');
        setShowReviewForm(false);
        fetchRatings();
        if (onRatingAdded) onRatingAdded();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = async (e) => {
    e.preventDefault();

    if (!userExistingRating) return;

    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.updateRating,
        data: {
          _id: userExistingRating._id,
          rating: userRating,
          review: review,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setIsEditing(false);
        fetchRatings();
        if (onRatingAdded) onRatingAdded();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingDelete = async () => {
    if (!userExistingRating) return;

    try {
      const response = await Axios({
        ...SummaryApi.deleteRating,
        data: {
          _id: userExistingRating._id,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserHasRated(false);
        setUserExistingRating(null);
        setUserRating(0);
        setReview('');
        setShowDeleteConfirm(false);
        fetchRatings();
        if (onRatingAdded) onRatingAdded();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const startNewReview = () => {
    setUserRating(0);
    setReview('');
    setShowReviewForm(true);
    setIsEditing(false);
  };

  const startEditReview = () => {
    setUserRating(userExistingRating.rating);
    setReview(userExistingRating.review || '');
    setShowReviewForm(true);
    setIsEditing(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }

    return stars;
  };

  const renderRatingStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-2xl focus:outline-none"
            onClick={() => setUserRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            {star <= (hoverRating || userRating) ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      {ratings.length > 0 && (
        <div className="flex items-center">
          <div className="text-5xl font-bold mr-4">
            {(
              ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
            ).toFixed(1)}
          </div>
          <div>
            <div className="flex">
              {renderStars(
                ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Based on {ratings.length}{' '}
              {ratings.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      {/* Review Form Toggle Button */}
      {isLoggedIn && !showReviewForm && (
        <div>
          {!userHasRated ? (
            <button
              onClick={startNewReview}
              className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded"
            >
              Write a Review
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <FaUser className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Your Review</p>
                      <div className="flex mt-1">
                        {renderStars(userExistingRating.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={startEditReview}
                      className="text-secondary-100 hover:text-secondary-200"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                {userExistingRating.review && (
                  <p className="text-gray-700 mt-2">
                    {userExistingRating.review}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {userExistingRating.updatedAt !== userExistingRating.createdAt
                    ? `Edited ${formatDistanceToNow(
                        new Date(userExistingRating.updatedAt)
                      )} ago`
                    : `Posted ${formatDistanceToNow(
                        new Date(userExistingRating.createdAt)
                      )} ago`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form
          onSubmit={isEditing ? handleRatingUpdate : handleRatingSubmit}
          className="bg-gray-50 p-6 rounded-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h3>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Your Rating
            </label>
            {renderRatingStars()}
          </div>

          <div className="mb-4">
            <label htmlFor="review" className="block mb-2 text-sm font-medium">
              Your Review (optional)
            </label>
            <textarea
              id="review"
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Share your experience with this product..."
            ></textarea>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || userRating === 0}
              className={`bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded flex items-center ${
                loading || userRating === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2"></span>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : isEditing ? (
                'Update Review'
              ) : (
                'Submit Review'
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Login Prompt */}
      {!isLoggedIn && !ratingLoading && (
        <div className="p-4 rounded-lg border bg-amber-100 text-amber-800">
          <p className="text-secondary-200">
            Please{' '}
            <a href="/login" className="font-medium underline">
              log in
            </a>{' '}
            to write a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">
          Customer Reviews
        </h3>

        {ratingLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No reviews yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map(
              (rating) =>
                // Skip the user's own review since we display it separately
                rating.user._id !== user?._id && (
                  <div key={rating._id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        {rating.user.avatar ? (
                          <img
                            src={rating.user.avatar}
                            alt={rating.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <FaUser className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{rating.user.name}</p>
                        <div className="flex mt-1">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                    </div>

                    {rating.review && (
                      <p className="text-gray-700 my-2">{rating.review}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      {rating.updatedAt !== rating.createdAt
                        ? `Edited ${formatDistanceToNow(
                            new Date(rating.updatedAt)
                          )} ago`
                        : `Posted ${formatDistanceToNow(
                            new Date(rating.createdAt)
                          )} ago`}
                    </p>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmBox
          title="Delete Review"
          message="Are you sure you want to delete your review? This action cannot be undone."
          close={() => setShowDeleteConfirm(false)}
          cancel={() => setShowDeleteConfirm(false)}
          confirm={handleRatingDelete}
        />
      )}
    </div>
  );
};

export default RatingReviewComponent;
