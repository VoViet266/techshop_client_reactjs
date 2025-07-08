import { Link, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Space, Typography, Divider, Image } from 'antd';

function CardProduct({ product = {}, className, loading = false }) {
  function formatCurrency(amount, locale = 'vi-VN', currency = 'VND') {
    return new Intl.NumberFormat(locale, {
      style: 'decimal', // hoặc 'currency' nếu bạn muốn hiển thị ký hiệu tiền tệ
      // currency: currency, // Chỉ dùng nếu style là 'currency'
      minimumFractionDigits: 0, // Đảm bảo không có số lẻ sau dấu phẩy
      maximumFractionDigits: 0, // Đảm bảo không có số lẻ sau dấu phẩy
    }).format(amount);
  }

  const navigate = useNavigate();
  if (!loading)
    return (
      <Badge.Ribbon
        text={`${product.discount}%` || 'Mới'}
        color="red"
        className={`top-10! font-roboto! -right-6!`}
      >
        <Link to={`/product/${product._id}`}>
          <Card
            hoverable
            cover={
              <Image
                preview={false}
                alt="Product Image"
                className="object-fill! aspect-square! mx-auto! mt-20! w-[80%]!"
                src={
                  product?.variants?.[0]?.images?.[0] ||
                  'https://cdn.tgdd.vn/Products/Images/42/329138/iphone-16-plus-hong-thumb-1-600x600.jpg'
                }
              />
            }
            className={`${className} rounded-lg! overflow-hidden hover:shadow-md! hover:border-[rgb(245,239,239)]! border border-[rgb(245,239,239)]`}
          >
            <Divider className="my-0! mb-10!" />
            <Typography.Title
              level={4}
              className="line-clamp-1! mb-10! font-roboto! text-[16px]! leading-1.4!"
            >
              {product.name || 'Sản phẩm mới'}
            </Typography.Title>
            <div className="mb-10">
              <div className="flex flex-col items-start gap-1">
                <Typography.Text
                  delete
                  type="secondary"
                  className="text-sm! font-roboto!"
                >
                  {`${formatCurrency(product?.variants?.[0]?.price)}đ` || ''}
                </Typography.Text>
                <Typography.Text className="text-xl! font-bold! font-roboto! text-[#d32f2f]!">
                  {`${formatCurrency(product?.variants?.[0]?.price - product?.variants?.[0]?.price * (product?.discount / 100))}đ` ||
                    'Liên hệ'}
                </Typography.Text>
              </div>
            </div>

            <div className="mb-10">
              <Space direction="vertical" size={4}>
                <div className="flex items-center gap-8">
                  <Typography.Text className="text-xs! mb-10 font-roboto! text-[#52c41a]!">
                    Miễn phí vận chuyển
                  </Typography.Text>
                </div>
                <div className="flex items-center gap-8">
                  <Typography.Text className="text-xs! font-roboto! text-[#1890ff]!">
                    Trả góp 0% qua thẻ tín dụng
                  </Typography.Text>
                </div>
              </Space>
            </div>

            <Divider className="my-10!" />
            <Space direction="vertical" size={8} className="w-full!">
              <Button
                block
                size="large"
                type="primary"
                onClick={() => {
                  navigate(`/product/${product._id}`);
                }}
                className="h-[44]! rounded-[10]! font-roboto! font-medium! bg-primary!"
              >
                Mua ngay
              </Button>
            </Space>
          </Card>
        </Link>
      </Badge.Ribbon>
    );
}

export default CardProduct;
