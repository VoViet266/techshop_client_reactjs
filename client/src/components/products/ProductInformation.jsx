import { useAppContext } from '@/contexts';
import { useState, useEffect } from 'react';
import CartServices from '@services/carts';
import 'react-loading-skeleton/dist/skeleton.css';
import { Button, Typography, Tag, Image, Flex, Skeleton } from 'antd';

function ProductInformation({ className, product, loading }) {
  const { user, message } = useAppContext();
  const [currentVariant, setCurrentVariant] = useState(0);

  function formatCurrency(amount, locale = 'vi-VN', currency = 'VND') {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const handleAddItemsToCart = async (items) => {
    const cartServices = new CartServices();
    try {
      message.loading('Đang thêm sản phẩm vào giỏ hàng...');
      const response = await cartServices.add(items);
      if (response.status === 201) {
        message.destroy();
        message.success('Thêm sản phẩm vào giỏ hàng thành công');
        return;
      }
      throw new Error('Thêm sản phẩm vào giỏ hàng thất bại');
    } catch (error) {
      message.destroy();
      console.error('Error adding items to cart:', error);
      message.error('Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  };

  return (
    <div className={className}>
      <Typography.Title level={3} className="text-2xl! mb-0! font-medium!">
        <Flex gap={10} align="center">
          {product.name || <Skeleton.Input className="h-40!" />}
          <Tag color="red" className="py-2! px-12! rounded-sm!">
            {' '}
            -{product.discount}%
          </Tag>
        </Flex>
      </Typography.Title>
      <Flex gap={8} align="center">
        <Typography.Text className="text-lg! font-bold! text-primary!">
          {!loading ? (
            `${formatCurrency(product?.variants?.[currentVariant]?.price - product?.variants?.[currentVariant]?.price * (product?.discount / 100))}đ`
          ) : (
            <Skeleton.Input className="h-40!" />
          )}
        </Typography.Text>
        <Typography.Text
          delete
          type="secondary"
          className="text-lg! font-inter!"
        >
          {!loading ? (
            `${formatCurrency(product?.variants?.[currentVariant]?.price)}đ`
          ) : (
            <Skeleton.Input className="h-40!" />
          )}
        </Typography.Text>
      </Flex>

      {product.variants?.length > 0 ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            Phiên bản
          </div>
          <div className="p-8 flex gap-12">
            {product.variants.map((variant, index) => (
              <div
                key={index}
                onClick={() => setCurrentVariant(index)}
                className={`flex ${index === currentVariant && 'border-primary border-2'} cursor-pointer h-auto! w-150! hover:border-primary hover:border-2 flex-col gap-4 py-8 px-10 border border-[#e5e7eb] rounded-sm`}
              >
                <Typography.Text className="font-medium">
                  {variant?.name}
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton.Input className="h-100! w-full!" />
      )}

      {product.variants?.length > 0 ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            Màu sắc
          </div>
          <div className="p-8">
            <div
              className={`flex h-auto w-150! cursor-pointer items-center gap-4 p-6 border-2 border-primary rounded-sm`}
            >
              <Flex gap={10} align="center" justify="center">
                <Flex className="w-[30%]">
                  <Image
                    preview={false}
                    src={product?.variants?.[currentVariant]?.images?.[0]}
                    className="aspect-square!"
                  />
                </Flex>

                <Flex vertical>
                  <Typography.Text className="font-medium!">
                    {product?.variants?.[currentVariant]?.color?.name}
                  </Typography.Text>
                  <Typography.Text className="">
                    {`${formatCurrency(product?.variants?.[currentVariant]?.price)}đ`}
                  </Typography.Text>
                </Flex>
              </Flex>
            </div>
          </div>
        </div>
      ) : (
        <Skeleton.Input className="h-100! w-full!" />
      )}

      <div className="flex gap-10 mt-16">
        {loading ? (
          <div className="w-[50%]">
            <Skeleton.Input className="h-40! w-full!" />
          </div>
        ) : (
          <Button
            onClick={async () => {
              if (!user) {
                message.warning(
                  'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                );
                return;
              }
              await handleAddItemsToCart([
                {
                  product: product._id,
                  variant: product.variants[currentVariant]._id,
                  quantity: 1,
                },
              ]);
            }}
            className="w-[50%] font-medium h-40! text-md hover:opacity-90 bg-gray-200 cursor-pointer rounded-md!"
          >
            Thêm vào giỏ hàng
          </Button>
        )}

        {loading ? (
          <div className="w-[50%]">
            <Skeleton.Input className="h-40! w-full!" />
          </div>
        ) : (
          <Button
            type="primary"
            className="w-[50%] font-medium h-40! text-md hover:opacity-80 text-white rounded-md! cursor-pointer bg-primary"
          >
            Mua ngay
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductInformation;
