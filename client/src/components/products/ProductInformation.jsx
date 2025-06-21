import { useState, useEffect, use } from 'react';
import { RiGiftFill } from 'react-icons/ri';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ProductInformation({ className, product, loading }) {
  const [price, setPrice] = useState('');
  const [colors, setColors] = useState([]);
  const [memories, setMemories] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  useEffect(() => {
    if (product.variants) {
      const variantMemories = product.variants.map((variant) => variant.memory);
      setMemories(variantMemories);

      const variantColors = product.variants
        .filter((variant) => variant.memory === variantMemories[0])
        .map((variant) => variant.color);

      setColors(variantColors);
      setSelectedColor(variantColors[0]);
      setSelectedMemory(variantMemories[0]);
    }
  }, [product.variants]);

  useEffect(() => {
    if (product.variants) {
      const variantColors = product.variants
        .filter((variant) => variant.memory === selectedMemory)
        .map((variant) => variant.color);
      setSelectedColor(variantColors[0]);
      setColors(variantColors);
    }
  }, [selectedMemory]);

  useEffect(() => {
    if (product.variants) {
      const variantPrice = product.variants.find(
        (variant) => variant.color === selectedColor && variant.memory === selectedMemory,
      );
      setPrice(variantPrice?.price || '');
    }
  }, [selectedColor, selectedMemory, product.variants]);

  return (
    <div className={className}>
      <h3 className="text-2xl font-medium">{product.name || <Skeleton className="h-40" />}</h3>
      <span className="text-lg font-bold text-primary">
        {`${price} VNĐ` || <Skeleton className="h-40" />}
      </span>

      {product.variants ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">Bộ nhớ</div>
          <div className="p-8 grid grid-cols-2 gap-8">
            {memories.map((memory, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedMemory(memory);
                  setSelectedColor(null);
                  const variants = product.variants.filter((variant) => {
                    return variant.memory === memory;
                  });
                  const colors = variants.map((variant) => variant.color);
                  setColors(colors);
                }}
                className={`flex cursor-pointer ${selectedMemory === memory && 'border-primary'} hover:border-primary flex-col gap-4 p-6 border border-[#e5e7eb] rounded-sm`}
              >
                <span className="font-medium">Ram {memory.ram}</span>
                <span className="font-medium">Bộ nhớ {memory.storage}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton className="h-100" />
      )}

      {product.variants ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">Màu</div>
          <div className="p-8 grid grid-cols-2 gap-8">
            {colors.map((color, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedColor(color);
                }}
                className={`flex ${selectedColor === color && 'border-primary'} hover:border-primary cursor-pointer items-center gap-4 p-6 border border-[#e5e7db] rounded-sm`}
              >
                <span className="font-medium">Màu {color.name}</span>
                <div className={`w-30 h-30 bg-[${color.hex}] rounded-full`}></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton className="h-100" />
      )}

      {/* {product.giftsAndOffers ? (
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
      )} */}

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
    </div>
  );
}

export default ProductInformation;
