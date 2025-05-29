import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { RiGiftFill } from "react-icons/ri";

function ProductInformation({ className, product, loading }) {
  return (
    <div className={className}>
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
              <span className="font-medium">iPhone 16 Pro Max 12GB 256GB</span>
              <span className="font-medium text-primary">30.000.000 VNĐ</span>
            </div>
            <div className="flex flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm">
              <span className="font-medium">iPhone 16 Pro Max 12GB 256GB</span>
              <span className="font-medium text-primary">30.000.000 VNĐ</span>
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
              <span className="font-medium text-primary">30.000.000 VNĐ</span>
            </div>
            <div className="flex flex-col gap-4 p-6 border border-[#e5e7db] rounded-sm">
              <span className="font-medium">iPhone 16 Pro Max Vàng</span>
              <span className="font-medium text-primary">30.000.000 VNĐ</span>
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
  );
}

export default ProductInformation;
