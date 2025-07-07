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
  Divider,
  Button,
} from 'antd';

import { formatCurrency } from '@helpers';
import { useAppContext } from '@contexts';
import { useNavigate } from 'react-router-dom';
import UserService from '@services/users';
import CartServices from '@services/carts';
import { useState, useEffect } from 'react';
import Products from '@/services/products';
import BranchService from '@services/branches';
import InventoryService from '@services/inventories';

function Order() {
  const navigate = useNavigate();
  const { message, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [inventories, setInventories] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(
    'Thanh toán khi nhận hàng',
  );
  const [shippingMethod, setShippingMethod] = useState('Giao hàng tận nơi');

  const total = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const discount = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity * (item.product.discount / 100);
  }, 0);

  const items = cartItems.map((item) => {
    return {
      product: item.product._id,
      variant: item.variant._id,
      quantity: item.quantity,
      price: item.price,
    };
  });

  const order = {
    user: user?._id,
    totalPrice: total,
    status: 'pending',
    branch: selectedBranch,
    shippingAddress: selectedAddress,
    paymentMethod:
      paymentMethod === 'Thanh toán khi nhận hàng' ? 'cash' : 'momo',
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

  const getAllInventories = async () => {
    try {
      const inventoryService = new InventoryService();
      const response = await inventoryService.getAll();
      if (response.status === 200) {
        setInventories(response.data.data);
        return;
      }
    } catch (error) {
      console.error('Không thể lấy danh sách kho hàng.');
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

  const getAllBranches = async () => {
    try {
      const branchService = new BranchService();
      const response = await branchService.getAll();
      if (response.status === 200) {
        setBranches(response.data.data);
        return;
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chi nhánh:', error);
    }
  };

  useEffect(() => {
    if (inventories) {
      // Lấy tất cả branchId duy nhất từ inventories
      const branchIds = [...new Set(inventories.map((inv) => inv.branch._id))];

      // Lọc ra các branch còn đủ hàng cho toàn bộ items
      const availableBranchIds = branchIds.filter((branchId) => {
        // Với mỗi item trong items, kiểm tra có inventory nào cùng branch, cùng product, cùng variant và đủ stock không
        return items.every((item) => {
          // Tìm inventory ứng với branch, product, variant
          const inv = inventories.find(
            (inv) =>
              inv.branch._id === branchId &&
              inv.product._id === item.product &&
              inv.variants.some(
                (v) =>
                  v.variantId._id === item.variant && v.stock >= item.quantity,
              ),
          );
          return !!inv;
        });
      });

      setSelectedBranch(availableBranchIds[0]);
    }
  }, [inventories]);

  const handleOrder = async () => {
    try {
      message.loading('Đang đặt hàng');
      const productService = new Products();
      const response = await productService.order(order);
      if (response.status === 201) {
        message.destroy();
        message.success('Đặt hàng thành công');
        navigate('/');
        return;
      }
      throw new Error('Đặt hàng thất bại');
    } catch (error) {
      message.destroy();
      message.error('Đặt hàng thất bại');
      console.error('Đặt hàng thất bại', error);
    }
  };

  useEffect(() => {
    getCart();
    getAllBranches();
    getAllInventories();
    if (user && user._id) {
      getUser();
    }
  }, [user]);

  useEffect(() => {
    if (userInfo) {
      const defaultAddress = userInfo.addresses?.find(
        (address) => address.default,
      );
      setSelectedAddress(defaultAddress.addressDetail);
    }
  }, [userInfo]);

  useEffect(() => {
    if (shippingMethod === 'Giao hàng tận nơi' && userInfo) {
      const defaultAddress = userInfo.addresses?.find(
        (address) => address.default,
      );
      setSelectedAddress(defaultAddress.addressDetail);
      return;
    }

    if (branches.length > 0) {
      const selectedAddress = branches[0].address;
      setSelectedAddress(selectedAddress);
    }
  }, [shippingMethod]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Flex gap={12} className="w-full! h-screen! px-50! py-20! mb-1000!">
      <Flex vertical gap={12} className="w-[50%]!">
        <div className="border w-full! rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Sản phẩm trong đơn
            </Typography.Title>
          </div>
          <div className="p-12 flex max-h-500 overflow-y-auto flex-col gap-10">
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
                      <Typography.Text className="font-medium flex! gap-8 items-center! text-base leading-5">
                        {item.variant.name}
                        <Tag color="red">{`-${item.product.discount}%`}</Tag>
                      </Typography.Text>
                      <Tag color="default" className="mt-4!">
                        {`Màu: ${item.variant.color.name}`}
                      </Tag>
                    </div>

                    <div className="text-right">
                      <Typography.Text type="secondary">{`x${item.quantity}`}</Typography.Text>
                      <div className="text-red-600 font-semibold text-lg">
                        {`${formatCurrency(item.price - item.price * (item.product.discount / 100))}đ`}
                      </div>
                      <div className="line-through text-gray-400 text-sm">
                        {`${formatCurrency(item.price)}đ`}
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
              <Input value={userInfo?.phone} className="w-full! flex-1 py-8!" />
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
                onChange={(event) => {
                  const shippingMethod = event.target.value;
                  setShippingMethod(shippingMethod);
                }}
                defaultValue="Giao hàng tận nơi"
                options={[
                  { value: 'Giao hàng tận nơi', label: 'Giao hàng tận nơi' },
                  { value: 'Nhận tại cửa hàng', label: 'Nhận tại cửa hàng' },
                ]}
              />
            </Flex>
            {shippingMethod === 'Giao hàng tận nơi' && (
              <Flex
                gap={4}
                vertical
                align="start"
                justify="center"
                className="w-full!"
              >
                <Typography.Text strong>Địa chỉ</Typography.Text>
                <Select
                  showSearch
                  className="w-full! flex-1!"
                  placeholder="Chọn địa chỉ"
                  onClick={(event) => {
                    const selectedAddress = event.target.textContent;
                    setSelectedAddress(selectedAddress);
                  }}
                  optionFilterProp="label"
                  defaultValue={
                    userInfo?.addresses?.filter(
                      (address) => address.default === true,
                    )[0]?.addressDetail
                  }
                  options={userInfo?.addresses?.map((address) => {
                    return {
                      value: address.addressDetail,
                      label: address.addressDetail,
                    };
                  })}
                />
              </Flex>
            )}

            {shippingMethod === 'Nhận tại cửa hàng' && (
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
                  onClick={(event) => {
                    const selectedAddress = event.target.textContent;
                    setSelectedAddress(selectedAddress);
                  }}
                  defaultValue={`${branches[0]?.name} - ${branches[0]?.address}`}
                  options={branches.map((branch) => {
                    return {
                      value: `${branch.name} - ${branch.address}`,
                      label: `${branch.name} - ${branch.address}`,
                    };
                  })}
                />
              </Flex>
            )}
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
                onChange={(event) => {
                  const paymentMethod = event.target.value;
                  setPaymentMethod(paymentMethod);
                }}
                defaultValue="Thanh toán khi nhận hàng"
                options={[
                  {
                    value: 'Thanh toán khi nhận hàng',
                    label: 'Thanh toán khi nhận hàng',
                  },
                  {
                    value: 'Thanh toán qua Momo',
                    label: 'Thanh toán qua Momo',
                  },
                ]}
              />
            </Flex>
          </div>
        </div>
      </Flex>
      <Flex className="w-[50%]! items-start">
        <div className="border w-full! rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Thông tin đơn hàng
            </Typography.Title>
          </div>
          <div className="p-12 flex flex-col gap-10">
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Họ và tên
              </Typography.Text>
              <Typography.Text className="text-sm!">
                {user.name}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Số điện thoại
              </Typography.Text>
              <Typography.Text className="text-sm!">
                {userInfo.phone}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Hình thức nhận hàng
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="magenta">{shippingMethod}</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Địa chỉ
              </Typography.Text>
              <Typography.Text className="text-sm!">
                {selectedAddress}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Phương thức thanh toán
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="volcano">{paymentMethod}</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Tổng tiền
              </Typography.Text>
              <Typography.Text className="text-sm! text-primary! font-medium!">{`${formatCurrency(total)}đ`}</Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Giảm giá
              </Typography.Text>
              <Typography.Text className="text-sm! flex! items-center! gap-8 text-primary! font-medium!">
                {`-${formatCurrency(discount)}đ`}
                <Tag color="blue">{-(discount / total) * 100}%</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Phí vận chuyển
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="green">Miễn phí</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!" strong>
                Cần thanh toán
              </Typography.Text>
              <Typography.Text className="text-sm! text-primary! font-medium!">{`${formatCurrency(total)}đ`}</Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Button
              onClick={() => {
                handleOrder(order);
              }}
              type="primary"
              className="h-40!"
            >
              Đặt hàng
            </Button>
          </div>
        </div>
      </Flex>
    </Flex>
  );
}

export default Order;
