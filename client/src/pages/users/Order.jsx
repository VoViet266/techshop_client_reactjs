import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'antd';

import '@styles/order.css';
import { formatCurrency } from '@helpers';
import { useAppContext } from '@contexts';
import { useNavigate } from 'react-router-dom';
import UserService from '@services/users';
import CartServices from '@services/carts';
import Products from '@/services/products';
import BranchService from '@services/branches';
import Address from '@/services/address';
import MapPickerModal from '@/components/app/MapPickerModal';

function Order() {
  const navigate = useNavigate();
  const { message, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState(user?.name || '');
  const [canChooseAddress, setCanChooseAddress] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [branches, setBranches] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [userTypeAddress, setUserTypeAddress] = useState({
    specificAddress: '',
    addressDetail: '',
  });

  // [THÊM] State để lưu ID chi nhánh đã chọn
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [selectedAddress, setSelectedAddress] = useState(null); // State này giờ chỉ dùng để lưu địa chỉ (giao hàng) hoặc (chuỗi text chi nhánh)
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingMethod, setShippingMethod] = useState('Giao hàng tận nơi');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);

  const total = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  useEffect(() => {
    document.title = 'Đặt hàng';
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProvinces(),
          getCart(),
          getAllBranches(),
          getUserInfo(),
        ]);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  const fetchProvinces = async () => {
    try {
      const provincesData = await Address.getAllProvinces();
      setProvinces(provincesData);
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const getCart = async () => {
    try {
      const response = await CartServices.get();
      if (response.status === 200) {
        setCartItems(response.data.data.items);
      }
    } catch (error) {
      message.error('Không thể lấy giỏ hàng');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  const getUserInfo = async () => {
    if (!user || !user._id) {
    }
    try {
      const response = await UserService.get(user._id);
      if (response.status === 200) {
        setUserInfo(response.data.data);
        setPhone(response.data.data.phone || '');
        const defaultAddress = response.data.data.addresses?.find(
          (addr) => addr.default === true,
        );
        if (defaultAddress) {
          const fullAddress = `${defaultAddress.addressDetail}, ${defaultAddress.specificAddress}`;
          setSelectedAddress(fullAddress);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await BranchService.getAll();
      if (response.status === 200) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chi nhánh:', error);
    }
  };

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince.code);
    }
    setSelectedDistrict(null);
    setSelectedWard(null);
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict.code);
    }
    setSelectedWard(null);
  }, [selectedDistrict]);

  const fetchDistricts = async (provinceCode) => {
    try {
      const districtsData = await Address.getDistricts(provinceCode);
      setDistricts(districtsData);
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const wardsData = await Address.getWards(districtCode);
      setWards(wardsData);
    } catch (error) {
      message.error('Không thể tải danh sách xã/phường');
    }
  };

  const handleLocationSelect = ({ coordinates, address }) => {
    setSelectedCoords(coordinates);
    setUserTypeAddress({
      specificAddress: address,
      addressDetail: '',
    });
    setCanChooseAddress(true);
    setShippingMethod('Giao hàng tận nơi');
    setMapModalOpen(false); // Đóng modal
  };

  // --- Logic Xây Dựng Object `Order` ---
  useEffect(() => {
    if (cartItems.length === 0) return;

    let finalAddress = '';
    if (shippingMethod === 'Giao hàng tận nơi') {
      if (canChooseAddress) {
        finalAddress = `${userTypeAddress.specificAddress}${
          userTypeAddress.addressDetail
            ? ', ' + userTypeAddress.addressDetail
            : ''
        }`;
      } else {
        finalAddress = selectedAddress || '';
      }
    } else {
      // Nhận tại cửa hàng
      finalAddress = selectedAddress || ''; // (selectedAddress lúc này là địa chỉ chi nhánh)
    }

    // [SỬA] Bỏ 'branch' ra khỏi items, vì nó sẽ nằm ở cấp cao nhất của order
    const items = cartItems.map((item) => ({
      product: item.product._id,
      variant: item.variant._id,
      quantity: item.quantity,
      price: item.price,
      branch: item.branch,
    }));

    setOrder({
      user: user?._id,
      totalPrice: total,
      status: 'pending',
      recipient: {
        name: fullName,
        phone: phone || userInfo?.phone,
        address: finalAddress, // Đây là địa chỉ giao hàng, hoặc chuỗi text của chi nhánh
      },
      buyer: {
        name: userInfo?.name || fullName,
        phone: userInfo?.phone || phone,
      },
      items: items,
      paymentMethod: paymentMethod,
      source: 'ONLINE',
      paymentStatus: 'PENDING',
      recipientLocation: selectedCoords,
    });
  }, [
    cartItems,
    fullName,
    phone,
    userInfo,
    shippingMethod,
    canChooseAddress,
    userTypeAddress,
    selectedAddress,
    selectedCoords,
    paymentMethod,
    total,
    user,
    selectedBranch, // [THÊM] Thêm dependency
  ]);

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
      message.error('Tạo thanh toán thất bại');
    }
  };

  const handleOrder = async () => {
    if (!canOrder) {
      message.warning('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    let paymentInformation;
    try {
      message.loading('Đang xử lý');
      const productService = new Products();

      console.log('Gửi Order lên server:', order); // KIỂM TRA DỮ LIỆU GỬI ĐI

      const response = await productService.order(order);

      if (response.status === 201) {
        paymentInformation = {
          order: response.data.data._id,
          amount: response.data.data.totalPrice,
          description: `Thanh toán đơn hàng ${response.data.data._id}`,
        };

        message.destroy();
        if (paymentMethod === 'cash') {
          message.success('Đặt hàng thành công');
          navigate('/');
          return;
        } else {
          await handlePayment(paymentInformation);
          return;
        }
      }
      throw new Error('Đặt hàng thất bại');
    } catch (error) {
      message.destroy();
      message.error(error.response?.data?.message || 'Đặt hàng thất bại');
      console.error('Đặt hàng thất bại', error);
    }
  };

  const canOrder =
    order?.recipient?.name &&
    order?.recipient?.phone &&
    order?.recipient?.address;

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Flex gap={12} className="w-full! py-20!">
      <Flex vertical gap={12} className="print:hidden! w-[55%]!">
        {/* Card 1: Sản phẩm */}
        <Card className="w-full! rounded-md border-none!">
          <Typography.Title level={5} className="m-0! mb-8!">
            {`Sản phẩm trong đơn (${cartItems.length})`}
          </Typography.Title>
          {cartItems.map((item, index) => {
            const color = item.variant.color?.find(
              (c) => c.colorName === item.color,
            );
            const imageUrl =
              color?.images?.[0] ||
              item.product?.images?.[0] ||
              'placeholder.png';

            return (
              <Card key={index} className="rounded-xl! border-none!">
                <div className="flex gap-12 items-center">
                  <Image
                    width={70}
                    height={70}
                    preview={false}
                    src={imageUrl}
                    className=" ! flex! items-center! justify-center!"
                  />
                  <div className="flex-1">
                    <Typography.Text className="font-bold  text-[12px] flex! gap-8 items-center! text-base leading-5">
                      {item.variant.name}
                    </Typography.Text>
                    <Flex
                      align="start"
                      className="mt-4 flex! flex-col!"
                      gap={4}
                    >
                      <Typography.Text type="secondary">
                        Số lượng: {item?.quantity}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {`Màu sắc: ${item.color}`}
                      </Typography.Text>
                      {item.variant.memory && (
                        <Typography.Text type="secondary">
                          {`Biến thể: ${item.variant.memory.ram}, ${item.variant.memory.storage}`}
                        </Typography.Text>
                      )}
                    </Flex>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold text-lg">
                      {`${formatCurrency(item.price * item?.quantity)}đ`}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </Card>

        {/* Card 2: Thông tin người nhận */}
        <Card className="w-full! rounded-md border-none!">
          <Typography.Title level={5} className="m-0! mb-8!">
            Thông tin người nhận hàng
          </Typography.Title>
          <Flex
            gap={4}
            vertical
            align="start"
            justify="center"
            className="w-full!"
          >
            <Typography.Text strong>Họ và tên</Typography.Text>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full! flex-1 py-8!"
            />
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
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full! flex-1 py-8!"
            />
          </Flex>
          <Flex vertical>
            <Flex
              align="center"
              justify="space-between"
              gap={8}
              className="w-full! mt-20!"
            >
              <Typography.Text strong>Địa chỉ</Typography.Text>
              <Button
                type="link"
                onClick={() => {
                  setShippingMethod('Giao hàng tận nơi');
                  setMapModalOpen(true);
                }}
              >
                Chọn trên bản đồ
              </Button>
              <Switch
                checked={canChooseAddress}
                onChange={(checked) => {
                  setCanChooseAddress(checked);
                  if (checked) {
                    setShippingMethod('Giao hàng tận nơi');
                  }
                }}
                size="default"
              />
            </Flex>
            <Flex gap={4} vertical justify="center" className="w-full! mt-4!">
              <Flex gap={8}>
                <Flex vertical className="w-1/3!">
                  <Typography.Text strong className="mb-4">
                    Tỉnh/Thành phố
                  </Typography.Text>
                  <Select
                    disabled={!canChooseAddress}
                    className="w-full!"
                    value={selectedProvince?.code}
                    placeholder="Chọn Tỉnh/Thành phố"
                    options={provinces.map((province) => ({
                      label: province.name,
                      value: province.code,
                    }))}
                    onChange={(value) => {
                      const province = provinces.find((p) => p.code === value);
                      setSelectedProvince(province);
                      setUserTypeAddress({
                        ...userTypeAddress,
                        addressDetail: province.name,
                      });
                    }}
                  />
                </Flex>
                <Flex vertical className="w-1/3!">
                  <Typography.Text strong className="mb-4">
                    Quận/Huyện
                  </Typography.Text>
                  <Select
                    disabled={!canChooseAddress || !selectedProvince}
                    className="w-full!"
                    value={selectedDistrict?.code}
                    placeholder="Chọn Quận/Huyện"
                    options={districts.map((district) => ({
                      label: district.name,
                      value: district.code,
                    }))}
                    onChange={(value) => {
                      const district = districts.find((d) => d.code === value);
                      setSelectedDistrict(district);
                      setUserTypeAddress({
                        ...userTypeAddress,
                        addressDetail: `${selectedProvince.name}, ${district.name}`,
                      });
                    }}
                  />
                </Flex>
                <Flex vertical className="flex-1!">
                  <Typography.Text strong className="mb-4">
                    Xã/Phường
                  </Typography.Text>
                  <Select
                    disabled={!canChooseAddress || !selectedDistrict}
                    value={selectedWard?.code}
                    placeholder="Chọn Xã/Phường"
                    options={wards.map((ward) => ({
                      label: ward.name,
                      value: ward.code,
                    }))}
                    onChange={(value) => {
                      const ward = wards.find((w) => w.code === value);
                      setSelectedWard(ward);
                      setUserTypeAddress({
                        ...userTypeAddress,
                        addressDetail: `${selectedProvince.name}, ${selectedDistrict.name}, ${ward.name}`,
                      });
                    }}
                  />
                </Flex>
              </Flex>
              <Flex vertical className="mt-8! w-full!">
                <Typography.Text strong className="mb-4">
                  Địa chỉ chi tiết (Số nhà, tên đường)
                </Typography.Text>
                <Input.TextArea
                  disabled={!canChooseAddress}
                  placeholder="Nhập địa chỉ chi tiết"
                  value={userTypeAddress.specificAddress}
                  onChange={(event) => {
                    setUserTypeAddress({
                      ...userTypeAddress,
                      specificAddress: event.target.value,
                    });
                  }}
                  className="min-h-70!"
                ></Input.TextArea>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        {/* Card 3: Hình thức nhận hàng & Thanh toán */}
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
            {/* [SỬA] Logic onChange của Radio Group */}
            <Radio.Group
              name="radiogroup"
              onChange={(event) => {
                const method = event.target.value;
                setShippingMethod(method);
                if (method === 'Nhận tại cửa hàng') {
                  setCanChooseAddress(false);
                  setSelectedCoords(null); // Xóa tọa độ nếu có
                  // Tự động chọn chi nhánh đầu tiên
                  if (branches.length > 0) {
                    const firstBranch = branches[0];
                    setSelectedBranch(firstBranch._id); // [SỬA] Lưu ID
                    setSelectedAddress(
                      `${firstBranch.name} - ${firstBranch.address}`, // [SỬA] Lưu chuỗi text
                    );
                  }
                } else {
                  // Giao hàng tận nơi
                  setSelectedBranch(null); // [SỬA] Xóa ID chi nhánh
                  // Tự động chọn địa chỉ mặc định
                  const defaultAddress = userInfo?.addresses?.find(
                    (a) => a.default,
                  );
                  if (defaultAddress) {
                    setSelectedAddress(
                      `${defaultAddress.addressDetail}, ${defaultAddress.specificAddress}`,
                    );
                  } else {
                    setSelectedAddress(null);
                  }
                }
              }}
              value={shippingMethod}
              options={[
                { value: 'Giao hàng tận nơi', label: 'Giao hàng tận nơi' },
                { value: 'Nhận tại cửa hàng', label: 'Nhận tại cửa hàng' },
              ]}
            />
          </Flex>

          {/* Select Địa chỉ có sẵn (Không đổi) */}
          {shippingMethod === 'Giao hàng tận nơi' && (
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full! mt-8!"
            >
              <Typography.Text strong>Địa chỉ</Typography.Text>
              <Select
                disabled={canChooseAddress}
                showSearch
                className="w-full! flex-1!"
                placeholder="Chọn địa chỉ đã lưu"
                value={selectedAddress}
                onChange={(value) => setSelectedAddress(value)}
                optionFilterProp="label"
                options={userInfo?.addresses?.map((address) => {
                  const fullAddress = `${address?.addressDetail}, ${address?.specificAddress}`;
                  return {
                    value: fullAddress,
                    label: fullAddress,
                  };
                })}
              />
            </Flex>
          )}

          {/* [SỬA] Select Nhận tại cửa hàng (lưu ID) */}
          {shippingMethod === 'Nhận tại cửa hàng' && (
            <Flex
              gap={4}
              vertical
              align="start"
              justify="center"
              className="w-full! mt-8!"
            >
              <Typography.Text strong>Chọn cửa hàng</Typography.Text>
              <Select
                showSearch
                className="w-full! flex-1!"
                placeholder="Chọn cửa hàng"
                optionFilterProp="label"
                value={selectedBranch} // [SỬA] Value là ID
                onChange={(value) => {
                  // value bây giờ là ID
                  const branch = branches.find((b) => b._id === value);
                  if (branch) {
                    setSelectedBranch(branch._id); // Lưu ID
                    setSelectedAddress(`${branch.name} - ${branch.address}`); // Lưu chuỗi text
                  }
                }}
                // [SỬA] Gán value là branch._id
                options={branches.map((branch) => {
                  return {
                    value: branch._id,
                    label: `${branch.name} - ${branch.address}`,
                  };
                })}
              />
            </Flex>
          )}

          {/* Phương thức thanh toán (Không đổi) */}
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
              onChange={(event) => setPaymentMethod(event.target.value)}
              value={paymentMethod}
              options={[
                { value: 'cash', label: 'Thanh toán khi nhận hàng' },
                { value: 'momo', label: 'Thanh toán qua Momo' },
              ]}
            />
          </Flex>
        </Card>
      </Flex>

      {/* Cột phải: Thông tin đơn hàng (Không đổi) */}
      <Flex vertical className="flex-1! items-start">
        <Card className="print:p-0! w-full! border-none!">
          <Typography.Title level={5} className="m-0! mb-16!">
            Thông tin đơn hàng
          </Typography.Title>
          <div className="flex flex-col gap-10">
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">Họ và tên</Typography.Text>
              <Typography.Text className="text-sm!">
                {fullName || user.name}
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Flex justify="space-between">
              <Typography.Text className="text-sm!">
                Số điện thoại
              </Typography.Text>
              <Typography.Text className="text-sm!">
                {phone || userInfo?.phone || 'Chưa có'}
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
              <Typography.Text className="text-sm! w-[20%]!">
                Địa chỉ
              </Typography.Text>
              <Typography.Text className="text-sm! text-right! flex-1!">
                {shippingMethod === 'Giao hàng tận nơi'
                  ? canChooseAddress
                    ? `${userTypeAddress.specificAddress}${
                        userTypeAddress.addressDetail
                          ? ', ' + userTypeAddress.addressDetail
                          : ''
                      }`
                    : selectedAddress || 'Chưa chọn địa chỉ'
                  : selectedAddress || 'Chưa chọn cửa hàng'}
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
              <Typography.Text className="text-sm!">
                Giá tạm tính
              </Typography.Text>
              <Typography.Text className="text-sm! text-primary! font-medium!">{`${formatCurrency(
                total,
              )}đ`}</Typography.Text>
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
            <Flex className="w-full!" justify="end" align="center" gap={8}>
              <Button
                disabled={!canOrder}
                onClick={handleOrder}
                type="primary"
                className="print:hidden! h-40! rounded-md!"
              >
                Đặt hàng
              </Button>
            </Flex>
          </div>
        </Card>
      </Flex>

      {isMapModalOpen && (
        <MapPickerModal
          open={isMapModalOpen}
          onClose={() => setMapModalOpen(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}
    </Flex>
  );
}

export default Order;
