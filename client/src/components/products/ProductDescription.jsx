import { useRef, useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

function ProductDescription({ className, product = {}, loading = false }) {
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (descriptionRef.current && product.description) {
      // Kiểm tra nội dung có dài hơn 200px không
      setIsOverflow(descriptionRef.current.scrollHeight > 200);
    }
  }, [product.description]);

  return (
    <div className={`bg-white 0 p-6 ${className || ''}`}>
      <div className="flex items-center mb-6">
        <Typography.Title
          level={3}
          className="mb-0 text-gray-800 font-semibold"
          style={{ margin: 0 }}
        >
          {loading ? (
            <div className="w-64">
              <Skeleton height={32} />
            </div>
          ) : (
            'Mô tả sản phẩm'
          )}
        </Typography.Title>
      </div>

      {/* Content */}
      <div className="relative">
        {loading ? (
          <div className="space-y-3">
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} width="80%" />
          </div>
        ) : product.description ? (
          <>
            <div className="relative">
              <div
                ref={descriptionRef}
                dangerouslySetInnerHTML={{ __html: product.description }}
                className={`
                  text-gray-700  
                  transition-all duration-500 ease-in-out
                  ${expanded ? '' : 'overflow-hidden'}
                `}
                style={{
                  maxHeight: expanded ? 'none' : '200px',
                }}
              />

              {/* Gradient overlay khi collapsed */}
              {isOverflow && !expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>

            {isOverflow && (
              <div className="flex justify-center mt-4">
                <Button
                  type="primary"
                  onClick={() => setExpanded(!expanded)}
                  className=" w-full!
                    bg-[#f3f4f6]! hover:bg-[#e3e5e9]!
                    
                    text-black! font-medium! px-6! py-2! 
                    rounded-lg! transition-all! duration-200!
                    flex! items-center! justify-center! gap-4!
                  
                    
                  "
                >
                  {expanded ? (
                    <>
                      <UpOutlined />
                      <Typography.Text className=" font-medium!">
                        Thu gọn
                      </Typography.Text>
                    </>
                  ) : (
                    <>
                      <DownOutlined />
                      <Typography.Text className=" font-medium!">
                        Xem thêm
                      </Typography.Text>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Sản phẩm chưa có mô tả</p>
            <p className="text-gray-400 text-sm mt-1">
              Thông tin mô tả sẽ được cập nhật sớm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProductDescription;
