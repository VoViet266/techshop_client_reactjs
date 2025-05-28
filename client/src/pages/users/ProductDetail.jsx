import { RiGiftFill } from "react-icons/ri";
import { AiOutlineLike, AiOutlineRollback } from "react-icons/ai";
import { ImagesSlider } from "@components/app";
import { useParams } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams();

  return (
    <div className="w-full xl:px-50 mt-30">
      <div className="flex">
        <div className="w-[60%] relative">
          <div className="py-20 px-40">
            <ImagesSlider />
          </div>
          <div className="mt-150">
            <span className="font-bold text-primary text-xl uppercase">
              Mô tả sản phẩm
            </span>
            <p className="text-justify text-lg leading-24 my-10">
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC,
              making it over 2000 years old. Richard McClintock, a Latin
              professor at Hampden-Sydney College in Virginia, looked up one of
              the more obscure Latin words, consectetur, from a Lorem Ipsum
              passage, and going through the cites of the word in classical
              literature, discovered the undoubtable source. Lorem Ipsum comes
              from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et
              Malorum" (The Extremes of Good and Evil) by Cicero, written in 45
              BC. This book is a treatise on the theory of ethics, very popular
              during the Renaissance. The first line of Lorem Ipsum, "Lorem
              ipsum dolor sit amet..", comes from a line in section 1.10.32.
            </p>
            <div>
              <img
                src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/pro-display-og-image?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1573689238241"
                alt=""
              />
            </div>
          </div>
          <div className="mt-20 flex flex-col gap-16 mb-150">
            <div className="flex itcems-center gap-10">
              <span className="font-bold text-primary text-xl uppercase">
                Bình luận và đánh giá
              </span>
              <span className="flex items-center text-sm text-gray-500">
                10 bình luận
              </span>
            </div>
            <div>
              <textarea
                id=""
                name=""
                placeholder="Nhập bình luận"
                className="w-full rounded-md border-gray-300 border p-8"
              ></textarea>
              <div className="flex items-center justify-end mt-10">
                <button className="px-8 cursor-pointer hover:opacity-80 bg-gray-200 rounded-sm py-6 min-w-100 mr-10">
                  Hủy
                </button>
                <button className="px-8 cursor-pointer hover:opacity-80 bg-primary text-white rounded-sm py-6 min-w-100">
                  Bình luận
                </button>
              </div>
            </div>
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
                  <span className="text-sm flex items-center">
                    2 phút trước
                  </span>
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
          </div>
        </div>
        <div className="flex-1 flex-col flex p-20 gap-10">
          <h3 className="text-2xl font-medium">Apple Pro Display XDR</h3>
          <p>Màn hình đẹp của Apple</p>
          <span className="text-lg font-bold text-primary">30.000.000 VNĐ</span>
          <div className="border rounded-md border-[#e5e7eb]">
            <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
              Bộ nhớ
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm">
                <span className="font-medium">
                  iPhone 16 Pro Max 12GB 256GB
                </span>
                <span className="font-medium text-primary">30.000.000 VNĐ</span>
              </div>
              <div className="flex flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm">
                <span className="font-medium">
                  iPhone 16 Pro Max 12GB 256GB
                </span>
                <span className="font-medium text-primary">30.000.000 VNĐ</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md border-[#e5e7eb]">
            <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
              Màu
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 p-6 border border-[#e5e7db] rounded-sm">
                <span className="font-medium">iPhone 16 Pro Max Đen</span>
                <span className="font-medium text-primary">30.000.000 VNĐ</span>
              </div>
              <div className="flex flex-col gap-4 p-6 border border-[#e5e7db] rounded-sm">
                <span className="font-medium">iPhone 16 Pro Max Vàng</span>
                <span className="font-medium text-primary">30.000.000 VNĐ</span>
              </div>
            </div>
          </div>

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

          <div className="flex gap-10 mt-16">
            <button className="w-[50%] py-8 text-md hover:opacity-90 bg-gray-200 cursor-pointer rounded-sm">
              Thêm vào giỏ hàng
            </button>
            <button className="w-[50%] py-8 text-md hover:opacity-80 text-white rounded-sm cursor-pointer bg-primary">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
