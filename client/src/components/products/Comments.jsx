import React, { useState, useEffect } from 'react';
import {
  Button,
  message,
  Pagination,
  Input,
  Avatar,
  Typography,
  Rate,
  Tag,
} from 'antd';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  AiOutlineLike,
  AiOutlineRollback,
  AiOutlineMessage,
  AiOutlineUser,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import {
  callCreateReview,
  callFetchReviewByProduct,
  callReplyReview,
} from '@/services/apis';
import { useAppContext } from '@/contexts';

const { TextArea } = Input;
const { Text, Title } = Typography;

function Comments({ className, product, loading: initialLoading }) {
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [rating, setRating] = useState(5);
  const { user, message, setShowLogin } = useAppContext();

  useEffect(() => {
    if (!product?._id) return;
    setPage(1);
  }, [product?._id]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews(page);
    }
  }, [page, product?._id]);

  const fetchReviews = async (currentPage) => {
    setLoading(true);
    try {
      const response = await callFetchReviewByProduct(
        product._id,
        currentPage,
        pageSize,
      );

      const { comments = [], meta } = response.data.data.data;
      setTotal(meta.totalItems);
      setReviews(comments);
    } catch (error) {
      message.error('Không thể tải bình luận');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }
    if (!user) {
      message.warning('Vui lòng đăng nhập để đánh giá!!');
      setShowLogin(true);
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        productId: product._id,
        userId: user._id,
        userName: user.name,
        content: comment.trim(),
        rating: rating,
      };

      await callCreateReview(reviewData);
      message.success('Bình luận đã được thêm thành công');
      setComment('');
      setPage(1);
      fetchReviews(1);
    } catch (error) {
      message.error('Không thể thêm bình luận');
      console.error('Error creating review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId) => {
    const replyContent = replyInputs[commentId];
    if (!replyContent?.trim()) {
      message.warning('Vui lòng nhập nội dung trả lời');
      return;
    }

    setReplyLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const replyData = {
        userId: user._id,
        userName: user.name,
        content: replyContent.trim(),
      };

      await callReplyReview(commentId, replyData);
      message.success('Trả lời đã được thêm thành công');
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));

      fetchReviews(page);
    } catch (error) {
      message.error('Không thể thêm trả lời');
      console.error('Error adding reply:', error);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  const toggleReplyInput = (commentId) => {
    setShowReplyInput((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    console.log(showReplyInput);
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex! items-center gap-3!">
              <div className="flex! items-center space-x-4">
                <h3 className="text-xl! font-bold text-gray-800">
                  {loading ? (
                    <Skeleton width={200} height={24} />
                  ) : (
                    'Bình luận và đánh giá'
                  )}
                </h3>
                <p className="text-sm! text-gray-600">
                  {loading ? <Skeleton width={100} /> : `${total} bình luận`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <Avatar
              src={user?.avatar}
              size={48}
              className="border-2 border-white shadow-md"
              icon={<AiOutlineUser />}
            />
            <div className="flex-1">
              {loading ? (
                <Skeleton height={100} />
              ) : (
                <div className="space-y-4">
                  <TextArea
                    value={comment}
                    maxLength={1000}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                    rows={4}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Đánh giá:</span>
                      <Rate
                        value={rating}
                        allowHalf
                        onChange={(value) => {
                          setRating(value === 0 ? 1 : value);
                        }}
                        className="text-yellow-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setComment('')}
                        disabled={submitting}
                        className="border-gray-300 text-gray-600 hover:border-gray-400"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSubmitComment}
                        loading={submitting}
                        disabled={!comment.trim()}
                        className="bg-blue-500 hover:bg-blue-600 border-blue-500 px-6"
                      >
                        Gửi bình luận
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton circle width={48} height={48} />
                      <div>
                        <Skeleton width={120} height={16} />
                        <Skeleton width={80} height={12} />
                      </div>
                    </div>
                    <Skeleton count={2} />
                  </div>
                ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AiOutlineMessage className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có bình luận nào</p>
              <p className="text-gray-400 text-sm mt-2">
                Hãy là người đầu tiên chia sẻ nhận xét!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-100 rounded-lg p-5 "
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={review.userId?.avatar}
                      size={48}
                      className="border-2! border-gray-200!"
                      icon={<AiOutlineUser />}
                    />
                    <div className="flex-1!">
                      <div className="flex! items-center! gap-2! mb-1!">
                        <Text className="font-semibold! text-gray-800!">
                          {review.userId?.name || 'Người dùng'}
                        </Text>
                      </div>
                      <div className="flex! items-center! gap-3! text-sm! text-gray-500!">
                        <span className="flex items-center gap-1">
                          <AiOutlineClockCircle />
                          {formatTime(review.createdAt)}
                        </span>
                        <Rate
                          disabled
                          defaultValue={review.rating}
                          size="small"
                          className="text-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {review.content}
                  </div>
                  <div className="flex! items-center! gap-4! text-sm! text-gray-500! mb-4!">
                    <button className="flex! items-center! gap-2! hover:text-blue-500! transition-colors! px-3! py-1! rounded-full! hover:bg-blue-50!">
                      <AiOutlineLike />
                      Thích
                    </button>
                    <button
                      onClick={() => toggleReplyInput(review._id)}
                      className="flex! items-center! gap-2! hover:text-blue-500! transition-colors! px-3! py-1! rounded-full! hover:bg-blue-50!"
                    >
                      <AiOutlineRollback />
                      Trả lời
                    </button>
                  </div>
                  {review.replies && review.replies.length > 0 && (
                    <div className="ml-8! space-y-3! mb-4!">
                      {review.replies.map((reply, index) => (
                        <div
                          key={index}
                          className="bg-blue-50! border! border-blue-100! rounded-lg! p-4!"
                        >
                          <div className="flex! items-center! gap-2! mb-2!">
                            <Avatar
                              size={25}
                              src={reply?.userId?.avatar}
                              icon={<AiOutlineUser />}
                            />
                            <div>
                              <span className="font-medium text-sm text-gray-800">
                                {reply.userName}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatTime(reply.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showReplyInput[review._id] && (
                    <div className="ml-8 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex gap-3">
                        <Avatar
                          size={32}
                          src={user?.avatar}
                          icon={<AiOutlineUser />}
                        />
                        <div className="flex-1! space-y-3!">
                          <Input
                            placeholder="Nhập trả lời của bạn..."
                            value={replyInputs[review._id] || ''}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [review._id]: e.target.value,
                              }))
                            }
                            onPressEnter={() => handleReply(review._id)}
                            className="border-gray-300! p-3! focus:ring-2! focus:ring-blue-500! focus:border-transparent! my-8!"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="small"
                              onClick={() => toggleReplyInput(review._id)}
                              className="border-gray-300! text-gray-600! hover:border-gray-400!"
                            >
                              Hủy
                            </Button>
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => handleReply(review._id)}
                              loading={replyLoading[review._id]}
                              disabled={!replyInputs[review._id]?.trim()}
                              className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                            >
                              Gửi trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-center">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(page) => setPage(page)}
                showTotal={(total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} của ${total} bình luận`
                }
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;
