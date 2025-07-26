import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  message,
  Pagination,
  Input,
  Row,
  Col,
  Avatar,
  Typography,
  Rate,
  Tag,
  Flex,
  Divider,
  Progress,
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
import { BsDot } from 'react-icons/bs';
import { AvatarDefault } from '../app';
import { StarFilled } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

function Comments({ className, product, loading: initialLoading, stats = {} }) {
  const [comment, setComment] = useState('');
  const commentInputRef = useRef(null);
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
  };

  function countRatings(obj) {
    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (obj && obj.ratings && Array.isArray(obj.ratings)) {
      obj.ratings.forEach((rating) => {
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      });
    }

    return ratingCounts;
  }

  return (
    <div className={className}>
      <div className="bg-white p-30 rounded-xl overflow-hidden">
        <Flex vertical align="" className="mb-8!" gap={0}>
          <Typography.Title level={2}>
            {loading ? (
              <Skeleton width={200} height={24} />
            ) : (
              'Bình luận và đánh giá'
            )}
          </Typography.Title>
          <Typography.Text className="text-sm! text-gray-600!">
            {/* {loading ? <Skeleton width={100} /> : `${total} bình luận`} */}
          </Typography.Text>
          <Row className="my-10!">
            <Col lg={8}>
              <Flex
                gap={8}
                vertical
                align="center"
                justify="center"
                className="mr-30!"
              >
                <Typography.Title level={1} className="mb-0!">
                  {stats?.averageRating?.toFixed(1)}
                </Typography.Title>
                <Typography.Text>
                  {stats?.totalComments} lượt đánh giá
                </Typography.Text>
                <Rate
                  value={stats?.averageRating?.toFixed(1)}
                  allowHalf
                  disabled
                  className="text-yellow-400!"
                />
                <Button
                  type="primary"
                  onClick={() => {
                    commentInputRef.current.focus();
                  }}
                  className="rounded-full! h-35! font-medium! w-3/4!"
                >
                  Đánh giá ngay
                </Button>
              </Flex>
            </Col>
            <Col lg={16}>
              {/* Rate row */}
              <Flex vertical gap={10}>
                {Array.from({ length: 5 }, (_, index) => {
                  return (
                    <Flex key={index} gap={8} align="center">
                      <Flex align="center">
                        <Typography.Text>{5 - index}</Typography.Text>
                        <StarFilled className="text-yellow-400! text-xl! ml-2!" />
                      </Flex>
                      <Progress
                        showInfo={false}
                        percent={
                          (countRatings(stats)[5 - index] /
                            stats.totalComments) *
                          100
                        }
                        className="flex-1!"
                        size={[, 12]}
                        strokeColor="#dc2626"
                      />
                      <Typography.Text>
                        {countRatings(stats)[5 - index]}
                      </Typography.Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Col>
          </Row>
        </Flex>

        <div className="p-6">
          <div className="flex items-start gap-8 mt-10">
            <div>
              <AvatarDefault width={40} height={40} />
            </div>

            <div className="flex-1">
              {loading ? (
                <Skeleton height={100} />
              ) : (
                <div className="space-y-4">
                  <TextArea
                    value={comment}
                    ref={commentInputRef}
                    maxLength={1000}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                    rows={6}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="w-full min-h-100! placeholder:text-base! placeholder:text-gray-500! border-gray-400 rounded-md!"
                  />
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-8">
                      <Typography.Text className="text-base! font-medium!">
                        Đánh giá:
                      </Typography.Text>
                      <Rate
                        value={rating}
                        allowHalf
                        onChange={(value) => {
                          setRating(value === 0 ? 1 : value);
                        }}
                        className="text-yellow-400!"
                      />
                    </div>
                    <div className="flex gap-8">
                      <Button
                        onClick={() => setComment('')}
                        disabled={submitting}
                        className="min-w-100! rounded-md! h-40!"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSubmitComment}
                        loading={submitting}
                        disabled={!comment.trim()}
                        className="min-w-100! rounded-md! font-medium! h-40!"
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
        <Divider />
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
            <div className="">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white flex items-start p-6 gap-12"
                >
                  <div className="flex items-center gap-8 mb-4">
                    <div>
                      <AvatarDefault width={40} height={40} />
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="mb-4 text-gray-700 w-full leading-relaxed rounded-lg">
                      <div className="flex-1!">
                        <div className="flex! items-center! gap-4! mb-1!">
                          <Text className="font-semibold! text-gray-800!">
                            {review.userId?.name || 'Người dùng'}
                          </Text>
                          <BsDot />
                          <Typography.Text className="flex! items-center! text-xs!">
                            {formatTime(review.createdAt)}
                          </Typography.Text>
                          <BsDot />
                          <div className="flex! items-center! gap-3! text-sm! text-gray-500!">
                            <Rate
                              allowHalf
                              disabled
                              defaultValue={review.rating}
                              size="small"
                              className="text-yellow-400! text-sm!"
                            />
                          </div>
                        </div>
                      </div>
                      <Typography.Text className="text-sm! text-black!">
                        {review.content}
                      </Typography.Text>
                      <div className="flex! items-center! gap-8! mt-4 text-sm! text-gray-500! mb-4!">
                        <button className="flex! items-center! gap-2! transition-colors! cursor-pointer! text-black! px-8! py-4! rounded-full! border border-gray-300!">
                          <AiOutlineLike />
                          Thích
                        </button>
                        <button
                          onClick={() => toggleReplyInput(review._id)}
                          className="flex! items-center! gap-2! transition-colors! px-8! cursor-pointer! text-black! py-4! rounded-full! border border-gray-300"
                        >
                          <AiOutlineRollback />
                          Trả lời
                        </button>
                      </div>
                    </div>
                    {review.replies && review.replies.length > 0 && (
                      <div className="-ml-30 mt-20 bg-gray-50 p-20 rounded-md w-full mb-4! flex flex-col gap-20">
                        {review.replies.map((reply, index) => (
                          <div
                            key={index}
                            className="rounded-md! w-full! flex items-start gap-8 p-4!"
                          >
                            <div className="flex! items-center! gap-2! mb-2!">
                              <div>
                                <AvatarDefault width={40} height={40} />
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              <div className="flex items-center">
                                <span className="font-medium text-sm text-gray-800">
                                  {reply.userName}
                                </span>
                                <BsDot />
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatTime(reply.createdAt)}
                                </span>
                              </div>
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {showReplyInput[review._id] && (
                      <div className="ml-8 mt-16 p-10 bg-gray-50 rounded-md min-w-500">
                        <div className="flex gap-8">
                          <div>
                            <AvatarDefault width={40} height={40} />
                          </div>

                          <div className="flex-1! space-y-3!">
                            <TextArea
                              rows={4}
                              placeholder="Nhập trả lời của bạn..."
                              value={replyInputs[review._id] || ''}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({
                                  ...prev,
                                  [review._id]: e.target.value,
                                }))
                              }
                              onPressEnter={() => handleReply(review._id)}
                              className="border-gray-300! focus:border-primary! p-6! my-8!"
                            />
                            <div className="flex gap-8 justify-end">
                              <Button
                                size="small"
                                onClick={() => toggleReplyInput(review._id)}
                                className="min-w-100! h-40! rounded-md!"
                              >
                                Hủy
                              </Button>
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => handleReply(review._id)}
                                loading={replyLoading[review._id]}
                                disabled={!replyInputs[review._id]?.trim()}
                                className="min-w-100! h-40! rounded-md!"
                              >
                                Gửi trả lời
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="px-6 py-4">
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
