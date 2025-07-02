import { Link } from 'react-router-dom';
import { formatCurrency } from '@helpers';
import { useAppContext } from '@contexts';
import CartServices from '@services/carts';
import { useState, useEffect } from 'react';
import { Typography, Flex, Card, Tag, Image, Spin, Input } from 'antd';

function Order() {
  const { message, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const getCart = async () => {
    try {
      const cartServices = new CartServices();
      const response = await cartServices.get();
      if (response.status === 200) {
        setCartItems(response.data.data.items);
        setLoading(false);
      }
    } catch (error) {
      message.error('Không thể lấy giỏ hàng');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      console.log('Giỏ hàng:', cartItems);
    }
    if (user) {
      console.log('Thông tin người dùng:', user);
    }
  }, [cartItems, user]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Flex className="w-full! h-screen! px-50! py-20!">
      <Flex vertical gap={12} className="w-[50%]!">
        <div className="border min-h-185 w-full! h-185 rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Sản phẩm trong đơn
            </Typography.Title>
          </div>
          <div className="p-12 flex flex-col gap-10">
            {cartItems.map((item, index) => {
              return (
                <Card key={index} className="rounded-xl">
                  <div className="flex gap-12 items-start">
                    <Image
                      width={64}
                      height={64}
                      preview={false}
                      src={item.variant.images[0]}
                      className="rounded-md border"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-base leading-5">
                        {item.variant.name}
                      </div>
                      <Tag color="default" className="mt-10!">
                        {`Màu: ${item.variant.color.name}`}
                      </Tag>
                    </div>

                    <div className="text-right">
                      <Typography.Text type="secondary">{`x${item.quantity}`}</Typography.Text>
                      <div className="text-red-600 font-semibold text-lg">
                        {`${formatCurrency(item.price)}đ`}
                      </div>
                      <div className="line-through text-gray-400 text-sm">
                        2.990.000 ₫
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="border min-h-185 w-full! rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Thông tin người đặt hàng
            </Typography.Title>
          </div>
          <div className="p-12 flex flex-col gap-10">
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Họ và tên</Typography.Text>
              <Input value={user.name} className="w-full! flex-1 py-8!" />
            </Flex>
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Số điện thoại</Typography.Text>
              <Input value={'0393266713'} className="w-full! flex-1 py-8!" />
            </Flex>
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Địa chỉ</Typography.Text>
              <Input
                value={'Tổ 1, Ấp Mỹ Hòa ...'}
                className="w-full! flex-1 py-8!"
              />
            </Flex>
          </div>
        </div>
      </Flex>
    </Flex>
  );
}

export default Order;
