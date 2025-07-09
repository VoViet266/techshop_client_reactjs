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

import '@styles/order.css';
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

  const handlePayment = async (paymentInformation) => {
    try {
      message.loading('Đang xử lý');
      const productService = new Products();
      const response = await productService.payment(paymentInformation);
      if (response.status === 201) {
        window.location.href = response.data.data.payUrl;
        return;
      }
    } catch (error) {
      console.error('Đã có lỗi:', error);
    }
  };

  const handleOrder = async (order) => {
    let paymentInformation;
    try {
      message.loading('Đang xử lý');
      const productService = new Products();
      const response = await productService.order(order);
      if (response.status === 201) {
        paymentInformation = {
          order: response.data.data._id,
          amount: response.data.data.totalPrice,
          description: `Thanh toán đơn hàng ${response.data.data._id}`,
        };
        console.log('Order:', response.data.data);
        message.destroy();
        if (paymentMethod === 'Thanh toán khi nhận hàng') {
          message.success('Đặt hàng thành công');
          navigate('/');
          return;
        } else {
          console.log('Payment information:', paymentInformation);
          await handlePayment(paymentInformation);
          return;
        }
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
    <Flex gap={12} className="w-full! py-20!">
      <Flex vertical gap={12} className="w-[55%]!">
        <Card className="w-full! rounded-md border-none!">
          <Typography.Title level={5} className="m-0! mb-8!">
            {`Sản phẩm trong đơn (${cartItems.length})`}
          </Typography.Title>

          {cartItems.map((item, index) => {
            return (
              <Card key={index} className="rounded-xl! border-none!">
                <div className="flex gap-12 items-center">
                  <Image
                    width={64}
                    height={64}
                    preview={false}
                    src={item.variant.images[0]}
                    className="rounded-md! border! border-gray-300! flex! items-center! justify-center!"
                  />

                  <div className="flex-1">
                    <Typography.Text className="font-medium flex! gap-8 items-center! text-base leading-5">
                      {item.variant.name}
                      <Tag
                        color="red"
                        className="rounded-full! text-center!"
                      >{`-${item.product.discount}%`}</Tag>
                    </Typography.Text>
                    <Flex align="center">
                      <Tag color="default" className="mt-4!">
                        {`Màu: ${item.variant.color.name}`}
                      </Tag>
                      <Typography.Text type="secondary">{`x${item.quantity}`}</Typography.Text>
                    </Flex>
                  </div>

                  <div className="text-right">
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
        </Card>

        <Card className="w-full! rounded-md border-none!">
          <Typography.Title level={5} className="m-0! mb-8!">
            Thông tin người đặt hàng
          </Typography.Title>

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
            <Typography.Text strong className="mt-8!">
              Số điện thoại
            </Typography.Text>
            <Input value={userInfo?.phone} className="w-full! flex-1 py-8!" />
          </Flex>
        </Card>

        <Card className="w-full! rounded-md border-none!">
          <Typography.Title level={5} className="m-0! mb-8!">
            Thông tin nhận hàng
          </Typography.Title>

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
              <Typography.Text strong className="mt-8!">
                Địa chỉ
              </Typography.Text>
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
            <Typography.Text strong className="mt-8!">
              Phương thức thanh toán
            </Typography.Text>
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
        </Card>
      </Flex>
      <Flex vertical className="flex-1! items-start">
        <Card className="w-full! border-none!">
          <Typography.Title level={5} className="m-0! mb-16!">
            Thông tin đơn hàng
          </Typography.Title>

          <div className="flex flex-col gap-10">
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">Họ và tên</Typography.Text>
              <Typography.Text className="text-sm!">
                {user.name}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Số điện thoại
              </Typography.Text>
              <Typography.Text className="text-sm!">
                {userInfo.phone}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Hình thức nhận hàng
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="magenta">{shippingMethod}</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">Địa chỉ</Typography.Text>
              <Typography.Text className="text-sm!">
                {selectedAddress}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Phương thức thanh toán
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="volcano">{paymentMethod}</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">Tổng tiền</Typography.Text>
              <Typography.Text className="text-sm! text-primary! font-medium!">{`${formatCurrency(total)}đ`}</Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">Giảm giá</Typography.Text>
              <Typography.Text className="text-sm! flex! items-center! gap-8 text-primary! font-medium!">
                {`-${formatCurrency(discount)}đ`}
                <Tag color="blue">{-(discount / total) * 100}%</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Phí vận chuyển
              </Typography.Text>
              <Typography.Text className="text-sm!">
                <Tag color="green">Miễn phí</Tag>
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Cần thanh toán
              </Typography.Text>
              <Typography.Text className="text-sm! text-primary! font-medium!">{`${formatCurrency(total)}đ`}</Typography.Text>
            </Flex>

            <Button
              onClick={() => {
                handleOrder(order);
              }}
              type="primary"
              className="h-50! rounded-lg! mt-12!"
            >
              Đặt hàng
            </Button>
          </div>
          <Flex vertical align="center" className="text-sm! mt-12!">
            <Typography.Text className="text-gray-500!">
              Bằng việc tiến hành đặt mua hàng, bạn đồng ý với
            </Typography.Text>
            <Flex className="justify-center! gap-4">
              <Typography.Text className="underline font-medium! cursor-pointer! text-gray-500!">
                Điều khoản dịch vụ{' '}
              </Typography.Text>
              <Typography.Text className="text-gray-500!"> và </Typography.Text>
              <Typography.Text className="underline font-medium! cursor-pointer! text-gray-500!">
                Chính sách xử lý dữ liệu cá nhân
              </Typography.Text>
              <Typography.Text className="text-gray-500!">
                của TechShop
              </Typography.Text>
            </Flex>
          </Flex>
        </Card>
        <div className="-translate-y-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 403 28"
            fill="none"
            class="w-full"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 0H403V18.8171C403 21.7846 403 23.2683 402.487 24.4282C401.883 25.7925 400.792 26.8829 399.428 27.4867C398.268 28 396.785 28 393.817 28C391.534 28 390.392 28 389.652 27.808C388.208 27.4337 388.419 27.5431 387.28 26.579C386.696 26.0846 385.116 23.845 381.954 19.3656C379.649 16.0988 376.065 14 372.04 14C367.06 14 362.756 17.2133 360.712 21.8764C359.949 23.6168 359.568 24.487 359.531 24.5647C358.192 27.3971 357.411 27.9078 354.279 27.9975C354.193 28 353.845 28 353.15 28C352.454 28 352.107 28 352.021 27.9975C348.889 27.9078 348.107 27.3971 346.768 24.5647C346.731 24.487 346.35 23.6168 345.587 21.8765C343.544 17.2133 339.239 14 334.259 14C329.279 14 324.974 17.2133 322.931 21.8764C322.168 23.6168 321.787 24.487 321.75 24.5647C320.411 27.3971 319.629 27.9078 316.498 27.9975C316.412 28 316.064 28 315.368 28C314.673 28 314.325 28 314.239 27.9975C311.108 27.9078 310.326 27.3971 308.987 24.5647C308.95 24.487 308.569 23.6168 307.806 21.8765C305.763 17.2133 301.458 14 296.478 14C291.498 14 287.193 17.2133 285.15 21.8764C284.387 23.6168 284.005 24.487 283.969 24.5647C282.63 27.3971 281.848 27.9078 278.716 27.9975C278.63 28 278.283 28 277.587 28C276.892 28 276.544 28 276.458 27.9975C273.326 27.9078 272.545 27.3971 271.206 24.5647C271.169 24.487 270.788 23.6168 270.025 21.8765C267.981 17.2133 263.677 14 258.697 14C253.717 14 249.412 17.2133 247.368 21.8764C246.606 23.6168 246.224 24.487 246.188 24.5647C244.848 27.3971 244.067 27.9078 240.935 27.9975C240.849 28 240.501 28 239.806 28C239.111 28 238.763 28 238.677 27.9975C235.545 27.9078 234.764 27.3971 233.424 24.5647C233.388 24.487 233.006 23.6168 232.244 21.8765C230.2 17.2133 225.895 14 220.915 14C215.935 14 211.631 17.2133 209.587 21.8764C208.824 23.6168 208.443 24.487 208.406 24.5647C207.067 27.3971 206.286 27.9078 203.154 27.9975C203.068 28 202.72 28 202.025 28C201.329 28 200.982 28 200.896 27.9975C197.764 27.9078 196.982 27.3971 195.643 24.5647C195.606 24.487 195.225 23.6168 194.462 21.8765C192.419 17.2133 188.114 14 183.134 14C178.154 14 173.849 17.2133 171.806 21.8764C171.043 23.6168 170.662 24.487 170.625 24.5647C169.286 27.3971 168.504 27.9078 165.373 27.9975C165.287 28 164.939 28 164.243 28C163.548 28 163.2 28 163.114 27.9975C159.983 27.9078 159.201 27.3971 157.862 24.5647C157.825 24.487 157.444 23.6168 156.681 21.8765C154.638 17.2133 150.333 14 145.353 14C140.373 14 136.068 17.2133 134.025 21.8764C133.262 23.6168 132.881 24.487 132.844 24.5647C131.505 27.3971 130.723 27.9078 127.591 27.9975C127.505 28 127.158 28 126.462 28C125.767 28 125.419 28 125.333 27.9975C122.201 27.9078 121.42 27.3971 120.081 24.5647C120.044 24.487 119.663 23.6168 118.9 21.8764C116.856 17.2133 112.552 14 107.572 14C102.592 14 98.2868 17.2133 96.2433 21.8764C95.4806 23.6168 95.0993 24.487 95.0625 24.5647C93.7233 27.3971 92.9418 27.9078 89.8101 27.9975C89.7242 28 89.3765 28 88.681 28C87.9855 28 87.6378 28 87.5519 27.9975C84.4201 27.9078 83.6386 27.3971 82.2994 24.5647C82.2627 24.487 81.8814 23.6168 81.1187 21.8764C79.0752 17.2133 74.7703 14 69.7904 14C64.8104 14 60.5056 17.2133 58.462 21.8764C57.6993 23.6168 57.318 24.487 57.2813 24.5647C55.9421 27.3971 55.1606 27.9078 52.0289 27.9975C51.943 28 51.5952 28 50.8997 28C50.2043 28 49.8565 28 49.7706 27.9975C46.6389 27.9078 45.8574 27.3971 44.5182 24.5647C44.4815 24.487 44.1001 23.6168 43.3375 21.8764C41.2939 17.2133 36.9891 14 32.0091 14C28.1447 14 24.6868 15.9349 22.3767 18.9808C18.6745 23.8618 16.8235 26.3024 16.1428 26.81C15.1528 27.5482 15.4074 27.4217 14.2211 27.7644C13.4053 28 12.1727 28 9.70768 28C6.25895 28 4.53458 28 3.23415 27.3245C2.13829 26.7552 1.24477 25.8617 0.675519 24.7658C0 23.4654 0 21.7569 0 18.34V0Z"
              fill="white"
            ></path>
          </svg>
        </div>
      </Flex>
    </Flex>
  );
}

export default Order;
