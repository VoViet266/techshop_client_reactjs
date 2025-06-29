import { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Button, Typography, Tag, Image, Flex } from 'antd';

function ProductInformation({ className, product, loading }) {
  const [currentVariant, setCurrentVariant] = useState(0);

  function formatCurrency(amount, locale = 'vi-VN', currency = 'VND') {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return (
    <div className={className}>
      <Typography.Title level={3} className="text-2xl! mb-0! font-medium!">
        <Flex gap={10} align="center">
          {product.name || <Skeleton className="h-40" />}
          <Tag color="red" className="py-2! px-12! rounded-sm!">
            {' '}
            -{product.discount}%
          </Tag>
        </Flex>
      </Typography.Title>
      <Flex gap={8} align="center">
        <Typography.Text className="text-lg! font-bold! text-primary!">
          {`${formatCurrency(product.variants[currentVariant].price - product.variants[currentVariant].price * (product?.discount / 100))}đ` || (
            <Skeleton className="h-40" />
          )}
        </Typography.Text>
        <Typography.Text
          delete
          type="secondary"
          className="text-lg! font-roboto!"
        >
          {`${formatCurrency(product.variants[currentVariant].price)}đ` || (
            <Skeleton className="h-40" />
          )}
        </Typography.Text>
      </Flex>

      {product.variants ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            Phiên bản
          </div>
          <div className="p-8">
            {product.variants.map((variant, index) => (
              <div
                key={index}
                className={`flex cursor-pointer h-auto! w-150! hover:border-primary hover:border-2 flex-col gap-4 py-8 px-10 border border-[#e5e7eb] rounded-sm`}
              >
                <Typography.Text className="font-medium">
                  {variant?.name}
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton className="h-100" />
      )}

      {product.variants ? (
        <div className="border rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            Màu sắc
          </div>
          <div className="p-8">
            {product.variants.map((variant, index) => (
              <div
                key={index}
                className={`flex hover:border-primary h-auto w-150! cursor-pointer items-center gap-4 p-6 border border-[#e5e7db] rounded-sm`}
              >
                <Flex gap={10} align="center" justify="center">
                  <Flex className="w-[30%]">
                    <Image
                      preview={false}
                      src={variant?.images?.[0]}
                      className="aspect-square!"
                    />
                  </Flex>

                  <Flex vertical>
                    <Typography.Text className="font-medium!">
                      {variant.color.name}
                    </Typography.Text>
                    <Typography.Text className="">
                      {`${formatCurrency(variant.price)}đ`}
                    </Typography.Text>
                  </Flex>
                </Flex>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton className="h-100" />
      )}

      <div className="flex gap-10 mt-16">
        {loading ? (
          <div className="w-[50%]">
            <Skeleton className="h-40" />
          </div>
        ) : (
          <Button className="w-[50%] font-medium h-40! text-md hover:opacity-90 bg-gray-200 cursor-pointer rounded-md!">
            Thêm vào giỏ hàng
          </Button>
        )}

        {loading ? (
          <div className="w-[50%]">
            <Skeleton className="h-40" />
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
