import { useRef, useEffect } from 'react';
import { Typography } from 'antd';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ProductDescription({ className, product, loading }) {
  const descriptionRef = useRef(null);

  console.log(product.description);

  return (
    <div className={className}>
      <Typography.Title
        level={3}
        className="mb-10!"
      >
        {loading ? (
          <div className="w-250">
            <Skeleton className="h-40" />
          </div>
        ) : (
          'Mô tả sản phẩm'
        )}
      </Typography.Title>
      {product.description ? (
        <p
          ref={descriptionRef}
          dangerouslySetInnerHTML={{ __html: product.description }}
          className="text-justify text-base leading-24 my-10"
        />
      ) : (
        <p>Sản phẩm không có mô tả</p>
      )}
    </div>
  );
}

export default ProductDescription;
