function formatCurrency(amount, locale = 'vi-VN', currency = 'VND') {
  return new Intl.NumberFormat(locale, {
    style: 'decimal', // hoặc 'currency' nếu bạn muốn hiển thị ký hiệu tiền tệ
    // currency: currency, // Chỉ dùng nếu style là 'currency'
    minimumFractionDigits: 0, // Đảm bảo không có số lẻ sau dấu phẩy
    maximumFractionDigits: 0, // Đảm bảo không có số lẻ sau dấu phẩy
  }).format(amount);
}

export default formatCurrency;