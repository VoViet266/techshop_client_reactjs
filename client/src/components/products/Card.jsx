function Card() {
  return (
    <div className="border cursor-pointer border-gray-300 rounded-md p-12 flex flex-col justify-start">
      <img
        alt=""
        className="w-[80%] object-cover mx-auto rounded-md"
        src="https://cdn.tgdd.vn/Products/Images/42/329138/iphone-16-plus-hong-thumb-1-600x600.jpg"
      />
      <span className="mt-8 leading-18 font-medium text-justify">
        iPhone 16 Pro Max 256GB | Chính hãng VN/A
      </span>
      <span className="text-left mt-4 font-bold text-primary">
        30.000.000 VNĐ
      </span>
      <p className="leading-18 mt-4 text-gray-500 text-justify">
        Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
      </p>
      <button className="bg-primary text-white rounded-sm py-4 mt-12 cursor-pointer hover:opacity-80 transition-all duration-200">
        Mua ngay
      </button>
    </div>
  );
}

export default Card;
