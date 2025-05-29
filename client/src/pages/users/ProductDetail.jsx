import { useState } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ImagesSlider } from "@components/app";
import { Comments } from "@components/products";
import "react-loading-skeleton/dist/skeleton.css";
import { AiOutlineLike, AiOutlineRollback } from "react-icons/ai";
import { ProductInformation, ProductDescription } from "@components/products";

function ProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  const product = {
    name: "Apple Pro Display XDR",
    description: "Màn hình đẹp của Apple",
    price: "30.000.000 VNĐ",
    introduction: `Contrary to popular belief, Lorem Ipsum is not simply random text. It
          has roots in a piece of classical Latin literature from 45 BC, making
          it over 2000 years old. Richard McClintock, a Latin professor at
          Hampden-Sydney College in Virginia, looked up one of the more obscure
          Latin words, consectetur, from a Lorem Ipsum passage, and going
          through the cites of the word in classical literature, discovered the
          undoubtable source. Lorem Ipsum comes from sections 1.10.32 and
          1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and
          Evil) by Cicero, written in 45 BC. This book is a treatise on the
          theory of ethics, very popular during the Renaissance. The first line
          of Lorem Ipsum, comes from a line in
          section 1.10.32.`,
    comments: [],
    images: [],
    variants: [],
    giftsAndOffers: [],
  };

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
