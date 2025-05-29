import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ProductDescription({ className, product, loading }) {
  return (
    <div className="w-[60%]">
      <span className="font-bold text-primary text-xl uppercase">
        {loading ? (
          <div className="w-250">
            <Skeleton className="h-40" />
          </div>
        ) : (
          "Mô tả sản phẩm"
        )}
      </span>
      <p className="text-justify text-lg leading-24 my-10">
        {product.introduction || <Skeleton className="h-300" />}
      </p>
    </div>
  );
}

export default ProductDescription;
