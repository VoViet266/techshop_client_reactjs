import { useState } from "react";
import { RiGiftFill } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { ImagesSlider } from "@components/app";
import "react-loading-skeleton/dist/skeleton.css";
import { AiOutlineLike, AiOutlineRollback } from "react-icons/ai";

function ProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

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
        <div className="flex-1 flex-col flex p-20 gap-10">
          <h3 className="text-2xl font-medium">
            {product.name || <Skeleton className="h-40" />}
          </h3>
          <p>{product.description || <Skeleton className="h-50" />}</p>
          <span className="text-lg font-bold text-primary">
            {product.price || <Skeleton className="h-40" />}
          </span>

          {product.variants ? (
            <div className="border rounded-md border-[#e5e7eb]">
              <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
                Bộ nhớ
              </div>
              <div className="p-8 grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm">
                  <span className="font-medium">
                    iPhone 16 Pro Max 12GB 256GB
                  </span>
                  <span className="font-medium text-primary">
                    30.000.000 VNĐ
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm">
                  <span className="font-medium">
                    iPhone 16 Pro Max 12GB 256GB
                  </span>
                  <span className="font-medium text-primary">
                    30.000.000 VNĐ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-100" />
          )}

          {product.variants ? (
            <div className="border rounded-md border-[#e5e7eb]">
              <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
                Màu
              </div>
              <div className="p-8 grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4 p-6 border border-[#e5e7db] rounded-sm">
                  <span className="font-medium">iPhone 16 Pro Max Đen</span>
                  <span className="font-medium text-primary">
                    30.000.000 VNĐ
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-6 border border-[#e5e7db] rounded-sm">
                  <span className="font-medium">iPhone 16 Pro Max Vàng</span>
                  <span className="font-medium text-primary">
                    30.000.000 VNĐ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-100" />
          )}

          {/* Gifts and offers */}
          {product.giftsAndOffers ? (
            <div className="border rounded-md border-[#e5e7eb]">
              <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
                Quà tặng và ưu đãi khác
              </div>
              <div className="p-8 flex flex-col gap-4">
                <div className="flex items-center gap-8">
                  <RiGiftFill className="text-[#8a7d71] text-lg" />
                  <span>Tặng phiếu mua hàng 50,000đ khi mua sim kèm máy</span>
                </div>
                <div className="flex items-center gap-8">
                  <RiGiftFill className="text-[#8a7d71] text-lg" />
                  <span>Tặng phiếu mua hàng 150,000đ khi mua ốp kèm máy</span>
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-100" />
          )}
          {/* Gifts and offers */}

          {/* Buttons */}
          <div className="flex gap-10 mt-16">
            {loading ? (
              <div className="w-[50%]">
                <Skeleton className="h-40" />
              </div>
            ) : (
              <button className="w-[50%] font-medium py-8 text-md hover:opacity-90 bg-gray-200 cursor-pointer rounded-sm">
                Thêm vào giỏ hàng
              </button>
            )}

            {loading ? (
              <div className="w-[50%]">
                <Skeleton className="h-40" />
              </div>
            ) : (
              <button className="w-[50%] font-medium py-8 text-md hover:opacity-80 text-white rounded-sm cursor-pointer bg-primary">
                Mua ngay
              </button>
            )}
          </div>
          {/* Buttons */}
        </div>
      </div>

      {/* Product description */}
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
      {/* Product description */}

      <div className="w-[60%] mt-20 flex flex-col gap-16 mb-150">
        <div className="flex itcems-center gap-10">
          <span className="font-bold text-primary text-xl uppercase">
            {loading ? (
              <div className="w-250">
                <Skeleton className="h-30" />
              </div>
            ) : (
              "Bình luận và đánh giá"
            )}
          </span>
          <span className="flex items-center text-sm text-gray-500">
            {loading ? <Skeleton className="h-20" /> : "10 bình luận"}
          </span>
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-70" />
          ) : (
            <textarea
              id=""
              name=""
              placeholder="Nhập bình luận"
              className="w-full rounded-md border-gray-300 border p-8"
            ></textarea>
          )}
          <div className="flex items-center justify-end mt-10">
            {loading ? (
              <div className="w-100 mr-10">
                <Skeleton className="h-36" />
              </div>
            ) : (
              <button className="px-8 cursor-pointer hover:opacity-80 bg-gray-200 rounded-sm py-6 min-w-100 mr-10">
                Hủy
              </button>
            )}

            {loading ? (
              <div className="w-100">
                <Skeleton className="h-36" />
              </div>
            ) : (
              <button className="px-8 cursor-pointer hover:opacity-80 bg-primary text-white rounded-sm py-6 min-w-100">
                Bình luận
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        {!product.comments ? (
          <Skeleton className="h-90" />
        ) : (
          <div className="flex gap-10 justify-start">
            <div className="w-40 h-40 mt-4 rounded-full">
              <img
                alt=""
                className="rounded-full"
                src="https://yt3.googleusercontent.com/F6YRXcBbkvTCIDvHrXqWfnht_stmrhSRvVVtTybO4JyBXFeyAOjMIWM-PlOq_8UTaPSGtXAyMA=s900-c-k-c0x00ffffff-no-rj"
              />
            </div>

            <div className="flex flex-col justify-center gap-6">
              <div className="flex items-center gap-12">
                <span className="font-medium">Nguyễn Văn A</span>
                <span className="text-sm flex items-center">2 phút trước</span>
              </div>
              <span>Tuyệt vời quá mấy em ơi!!!</span>
              <div className="flex items-center gap-8">
                <button className="border flex items-center gap-4 cursor-pointer min-w-80 justify-center px-8 py-4 rounded-full border-gray-300 text-sm">
                  <AiOutlineLike />
                  <span>Thích</span>
                </button>
                <button className="border flex items-center gap-4 cursor-pointer min-w-80 justify-center px-8 py-4 rounded-full border-gray-300 text-sm">
                  <AiOutlineRollback />
                  <span>Trả lời</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Comments */}
      </div>
    </div>
  );
}

export default ProductDetail;
