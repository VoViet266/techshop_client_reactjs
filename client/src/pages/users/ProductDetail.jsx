import { useState, useEffect } from "react";
import Products from "@services/products";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ImagesSlider } from "@components/app";
import { Comments } from "@components/products";
import "react-loading-skeleton/dist/skeleton.css";
import { ProductInformation, ProductDescription } from "@components/products";

function ProductDetail() {
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const product = await Products.get(id);
        setProduct(product);
      } catch (error) {
        console.error("Đã có lỗi xảy ra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, []);

  return (
    <div className="w-full xl:px-50 mt-30">
      <div className="flex">
        <div className="w-[60%] relative">
          <div className="py-20 px-40">
            {product.images ? <ImagesSlider /> : <Skeleton className="h-500" />}
          </div>
        </div>
        <ProductInformation
          product={product}
          loading={loading}
          className="flex-1 flex-col flex p-20 gap-10"
        />
      </div>

      <ProductDescription
        product={product}
        loading={loading}
        className="w-[60%]"
      />

      <Comments
        product={product}
        loading={loading}
        comment={comment}
        setComment={setComment}
        className="w-[60%] mt-20 flex flex-col gap-16 mb-150"
      />
    </div>
  );
}

export default ProductDetail;
