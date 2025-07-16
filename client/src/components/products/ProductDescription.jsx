import { useRef, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ProductDescription({ className, product, loading }) {
  const descriptionRef = useRef(null);

  console.log(product.description);

  return (
    <div className={className}>
      <span className="font-bold text-primary text-xl uppercase">
        {loading ? (
          <div className="w-250">
            <Skeleton className="h-40" />
          </div>
        ) : (
          'Mô tả sản phẩm'
        )}
      </span>
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
