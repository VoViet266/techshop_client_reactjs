import { Link } from 'react-router-dom';
import { formatCurrency } from '@helpers';
import { useAppContext } from '@contexts';
import CartServices from '@services/carts';
import UserService from '@services/users';
import { useState, useEffect } from 'react';
import {
  Tag,
  Card,
  Flex,
  Spin,
  Image,
  Input,
  Radio,
  Select,
  Typography,
} from 'antd';

function Order() {
  const { message, user } = useAppContext();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log('search:', value);
  };

  const getCart = async () => {
    try {
      const cartServices = new CartServices();
      const response = await cartServices.get();
      if (response.status === 200) {
        setCartItems(response.data.data.items);
      }
    } catch (error) {
      message.error('Không thể lấy giỏ hàng');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  const getUser = async () => {
    try {
      const userService = new UserService();
      const response = await userService.get(user._id);
      if (response.status === 200) {
        setUserInfo(response.data.data);
        setLoading(false);
        return;
      }
      throw new Error('Lỗi khi lấy thông tin người dùng.');
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    getCart();
    if (user && user._id) {
      getUser();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Flex className="w-full! h-screen! px-50! py-20! mb-1000!">
      <Flex vertical gap={12} className="w-[50%]!">
        <div className="border w-full! rounded-md border-[#e5e7eb]">
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

        <div className="border w-full! rounded-md border-[#e5e7eb]">
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
              <Input value={userInfo.phone} className="w-full! flex-1 py-8!" />
            </Flex>
          </div>
        </div>

        <div className="border w-full! rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Thông tin nhận hàng
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
              <Typography.Text strong>Hình thức nhận hàng</Typography.Text>
              <Radio.Group
                name="radiogroup"
                defaultValue={1}
                options={[
                  { value: 1, label: 'Giao hàng tận nơi' },
                  { value: 2, label: 'Nhận tại cửa hàng' },
                ]}
              />
            </Flex>
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Địa chỉ</Typography.Text>
              {/* <Input
                value={
                  userInfo?.addresses?.filter(
                    (address) => address.default === true,
                  )[0]?.addressDetail
                }
                className="w-full! flex-1 py-8!"
              /> */}
              <Select
                showSearch
                className="w-full! flex-1!"
                placeholder="Select a person"
                optionFilterProp="label"
                onChange={onChange}
                defaultValue={
                  userInfo?.addresses?.filter(
                    (address) => address.default === true,
                  )[0]?.addressDetail
                }
                onSearch={onSearch}
                options={userInfo?.addresses?.map((address) => {
                  return {
                    value: address.addressDetail,
                    label: address.addressDetail,
                  };
                })}
              />
            </Flex>
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Chọn cửa hàng</Typography.Text>
              <Select
                showSearch
                className="w-full! flex-1!"
                placeholder="Select a person"
                optionFilterProp="label"
                onChange={onChange}
                onSearch={onSearch}
                options={[
                  {
                    value: 'jack',
                    label: 'Jack',
                  },
                  {
                    value: 'lucy',
                    label: 'Lucy',
                  },
                  {
                    value: 'tom',
                    label: 'Tom',
                  },
                ]}
              />
            </Flex>
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full!"
            >
              <Typography.Text strong>Phương thức thanh toán</Typography.Text>
              <Radio.Group
                name="radiogroup"
                defaultValue={1}
                options={[
                  { value: 1, label: 'Thanh toán khi nhận hàng' },
                  { value: 2, label: 'Thanh toán qua Momo' },
                ]}
              />
            </Flex>
          </div>
        </div>
      </Flex>
    </Flex>
  );
}

export default Order;
