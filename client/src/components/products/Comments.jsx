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
  Flex,
  Divider,
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Flex align="center" gap={8}>
          <Typography.Title
            level={3}
            className="text-xl! font-bold! text-gray-800"
          >
            {loading ? (
              <Skeleton width={200} height={24} />
            ) : (
              'Bình luận và đánh giá'
            )}
          </Typography.Title>
          <Typography.Text className="text-sm! text-gray-600!">
            {loading ? <Skeleton width={100} /> : `${total} bình luận`}
          </Typography.Text>
        </Flex>

        <div className="p-6">
          <div className="flex items-start gap-8">
            {!user.avatar ? (
              <div>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="mb:hidden"
                >
                  <rect width="44" height="44" rx="22" fill="#FECAB5"></rect>
                  <path
                    d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.95"
                    d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                    fill="#13001E"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                    fill="#F37021"
                  ></path>
                </svg>
              </div>
            ) : (
              <Avatar
                src={user?.avatar}
                size={40}
                className="border-2 border-white shadow-md"
                icon={<AiOutlineUser />}
              />
            )}
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
                    rows={6}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="w-full min-h-100! border-gray-200 rounded-md! focus:border-transparent"
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
                        className="min-w-100! rounded-md! h-40!"
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
                    {!user.avatar ? (
                      <div>
                        <svg
                          width="44"
                          height="44"
                          viewBox="0 0 44 44"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="mb:hidden"
                        >
                          <rect
                            width="44"
                            height="44"
                            rx="22"
                            fill="#FECAB5"
                          ></rect>
                          <path
                            d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                            fill="#F37021"
                          ></path>
                          <path
                            opacity="0.95"
                            d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                            fill="#13001E"
                          ></path>
                          <path
                            opacity="0.3"
                            d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                            fill="#F37021"
                          ></path>
                          <path
                            opacity="0.3"
                            d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                            fill="#F37021"
                          ></path>
                          <path
                            opacity="0.3"
                            d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                            fill="#F37021"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <Avatar
                        src={user?.avatar}
                        size={40}
                        className="border-2 border-white shadow-md"
                        icon={<AiOutlineUser />}
                      />
                    )}
                  </div>

                  <div>
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
                      <div className="-ml-10 mt-20 mb-4! flex flex-col gap-12">
                        {review.replies.map((reply, index) => (
                          <div
                            key={index}
                            className="rounded-md! flex items-start gap-8 p-4!"
                          >
                            <div className="flex! items-center! gap-2! mb-2!">
                              {!user.avatar ? (
                                <div>
                                  <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 44 44"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="mb:hidden"
                                  >
                                    <rect
                                      width="44"
                                      height="44"
                                      rx="22"
                                      fill="#FECAB5"
                                    ></rect>
                                    <path
                                      d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                                      fill="#F37021"
                                    ></path>
                                    <path
                                      opacity="0.95"
                                      d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                                      fill="#13001E"
                                    ></path>
                                    <path
                                      opacity="0.3"
                                      d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                                      fill="#F37021"
                                    ></path>
                                    <path
                                      opacity="0.3"
                                      d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                                      fill="#F37021"
                                    ></path>
                                    <path
                                      opacity="0.3"
                                      d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                                      fill="#F37021"
                                    ></path>
                                  </svg>
                                </div>
                              ) : (
                                <Avatar
                                  src={user?.avatar}
                                  size={30}
                                  className="border-2 border-white shadow-md"
                                  icon={<AiOutlineUser />}
                                />
                              )}
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              <div className='flex items-center'>
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
                          {!user.avatar ? (
                            <div>
                              <svg
                                width="44"
                                height="44"
                                viewBox="0 0 44 44"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                class="mb:hidden"
                              >
                                <rect
                                  width="44"
                                  height="44"
                                  rx="22"
                                  fill="#FECAB5"
                                ></rect>
                                <path
                                  d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                                  fill="#F37021"
                                ></path>
                                <path
                                  opacity="0.95"
                                  d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                                  fill="#13001E"
                                ></path>
                                <path
                                  opacity="0.3"
                                  d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                                  fill="#F37021"
                                ></path>
                                <path
                                  opacity="0.3"
                                  d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                                  fill="#F37021"
                                ></path>
                                <path
                                  opacity="0.3"
                                  d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                                  fill="#F37021"
                                ></path>
                              </svg>
                            </div>
                          ) : (
                            <Avatar
                              src={user?.avatar}
                              size={40}
                              className="border-2 border-white shadow-md"
                              icon={<AiOutlineUser />}
                            />
                          )}
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
