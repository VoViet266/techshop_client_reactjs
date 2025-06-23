import { useAppContext } from '@/contexts';
import useMessage from '@/hooks/useMessage';
import {
  callCreateOrder,
  callFetchBranches,
  callFetchOrders,
  callFetchProducts,
  callUpdateOrder,
} from '@/services/apis';
import {
  EyeOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  SearchOutlined,
  ReloadOutlined,
  HomeOutlined,
  DollarOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Tag,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createForm] = Form.useForm();
  const { success, error, warning, contextHolder } = useMessage();
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAppContext();
  const [createOrderData, setCreateOrderData] = useState({
    phone: '',
    items: [],
    paymentMethod: 'cash',
    branch: user.branch,
  });
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await callFetchOrders();
      setOrders(res.data.data);
      setFilteredOrders(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await callFetchProducts();
      setProducts(res.data.data.result);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', color: 'orange' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'PROCESSING', label: 'Đang xử lý', color: 'cyan' },
    { value: 'SHIPPING', label: 'Đang giao hàng', color: 'purple' },
    { value: 'DELIVERED', label: 'Đã giao hàng', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
    { value: 'RETURNED', label: 'Đã trả hàng', color: 'gray' },
  ];

  const paymentStatusOptions = [
    { value: 'PENDING', label: 'Đang chờ thanh toán', color: 'orange' },
    { value: 'SUCCESS', label: 'Đã thanh toán', color: 'green' },
    { value: 'FAILED', label: 'Thanh toán thất bại', color: 'red' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'gray' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'blue' },
  ];

  const paymentMethods = [
    {
      value: 'cash',
      label: (
        <>
          <DollarOutlined style={{ marginRight: 6 }} />
          Thanh toán tiền mặt tại quầy
        </>
      ),
    },
    {
      value: 'online',
      label: (
        <>
          <CreditCardOutlined style={{ marginRight: 6 }} />
          Thanh toán online
        </>
      ),
    },
  ];

  const fetchBranches = async () => {
    try {
      const res = await callFetchBranches();
      setBranches(res.data.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    if (filters.branch) {
      filtered = filtered.filter(
        (order) => order.branch._id === filters.branch,
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order._id?.toLowerCase().includes(searchLower) ||
          order.createdBy.email?.toLowerCase().includes(searchLower) ||
          order.createdBy.name?.toLowerCase().includes(searchLower) ||
          order.shippingAddress.toLowerCase().includes(searchLower),
      );
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const getStatistics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const pendingOrders = orders.filter(
      (order) => order.status === 'PENDING',
    ).length;
    const unpaidOrders = orders.filter(
      (order) => order.paymentStatus === 'PENDING',
    ).length;

    return { totalOrders, totalRevenue, pendingOrders, unpaidOrders };
  };

  const stats = getStatistics();

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const addProductToCart = () => {
    if (!selectedProduct || !selectedVariant || quantity <= 0) {
      message.error('Vui lòng chọn đầy đủ thông tin sản phẩm');
      return;
    }

    const existingItemIndex = createOrderData.items.findIndex(
      (item) =>
        item.product === selectedProduct._id &&
        item.variant === selectedVariant._id,
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...createOrderData.items];
      newItems[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        product: selectedProduct._id,
        productName: selectedProduct.name,
        variant: selectedVariant._id,
        variantName: selectedVariant.name,
        quantity: quantity,
        price: selectedVariant.salePrice || selectedVariant.price, // Lấy giá bán
      };
      newItems = [...createOrderData.items, newItem];
    }

    setCreateOrderData({
      ...createOrderData,
      items: newItems,
    });

    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);

    message.success('Đã thêm sản phẩm vào đơn hàng');
  };

  const removeProductFromCart = (index) => {
    const newItems = createOrderData.items.filter((_, i) => i !== index);
    setCreateOrderData({
      ...createOrderData,
      items: newItems,
    });
  };

  const updateCartItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromCart(index);
      return;
    }

    const newItems = [...createOrderData.items];
    newItems[index].quantity = newQuantity;

    setCreateOrderData({
      ...createOrderData,
      items: newItems,
    });
  };

  const calculateTotal = () => {
    return createOrderData.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const handleCreateOrderSubmit = async () => {
    if (!createOrderData.phone) {
      message.error('Vui lòng nhập số điện thoại khách hàng');
      return;
    }

    if (createOrderData.items.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    if (
      createOrderData.items.some(
        (item) => item.quantity <= 0 || item.price <= 0,
      )
    ) {
      message.error('Vui lòng kiểm tra lại số lượng và giá sản phẩm');
      return;
    }

    setLoading(true);

    const orderData = {
      branch: createOrderData.branch,
      phone: createOrderData.phone,
      items: createOrderData.items.map((item) => ({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: createOrderData.paymentMethod,
    };
    try {
      await callCreateOrder(orderData);
      setIsCreateModalVisible(false);

      setCreateOrderData({
        phone: '',
        items: [],
        paymentMethod: 'cash',
        branch: user.branch,
      });
      success('Tạo đơn hàng thành công!');
      callFetchOrders();
    } catch (err) {
      if (err.response.status === 404) {
        error(
          'Số lượng tồn kho hiện tại của sản phẩm không đủ, vui lòng kiểm tra lại kho hàng!',
        );
      } else {
        error(err.response.data.message);
      }
      setLoading(false);
      return;
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      width: 140,
      render: (text) => (
        <Text code copyable={{ text }}>
          #{text.slice(-8)}
        </Text>
      ),
    },
    {
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.createdBy.name || 'Không có'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.createdBy.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      width: 120,
      render: (_, record) => <div>{record.branch.name || 'Không có'}</div>,
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 200,
      render: (_, record) => (
        <div>
          {record.items.map((item, index) => (
            <div
              key={index}
              style={{ marginBottom: index < record.items.length - 1 ? 4 : 0 }}
            >
              <div style={{ fontSize: '13px' }}>{item.product.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {item.variant.name} x {item.quantity}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusLabel =
          statusOptions.find((opt) => opt.value === status)?.label || status;
        const statusColor =
          statusOptions.find((opt) => opt.value === status)?.color || 'default';
        return <Tag color={statusColor}>{statusLabel}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(record)}
          ></Button>
        </Space>
      ),
    },
  ];

  const handleUpdateOrder = (orderId, data) => {
    try {
      setLoading(true);

      callUpdateOrder(orderId, data).then((res) => {
        setLoading(false);
        fetchOrders();
      });
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBranches();
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <Title level={2}>Quản lý đơn hàng</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn chờ xử lý"
              value={stats.pendingOrders}
              valueStyle={{ color: '#faad14' }}
              prefix={<Badge status="warning" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chưa thanh toán"
              value={stats.unpaidOrders}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<Badge status="error" />}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
            />
          </Col>

          <Col span={4}>
            <Select
              placeholder="Chi nhánh"
              style={{ width: '100%' }}
              value={filters.branch}
              onChange={(value) => setFilters({ ...filters, branch: value })}
              allowClear
            >
              <Option value="">All</Option>
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
          <Col span={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                setFilters({
                  status: '',
                  paymentStatus: '',
                  paymentMethod: '',
                  branch: '',
                  searchText: '',
                  dateRange: null,
                })
              }
            >
              Làm mới
            </Button>
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Tạo Đơn Hàng Tại Quầy
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
          loading={loading}
        />
      </Card>

      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?._id.slice(-8)}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={() => {
              handleUpdateOrder(selectedOrder._id, {
                status: selectedOrder.status,
                paymentStatus: selectedOrder.paymentStatus,
                paymentMethod: selectedOrder.paymentMethod,
                branch: selectedOrder.branch._id,
              });

              message.success('Cập nhật đơn hàng thành công!');
              setIsModalVisible(false);
            }}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text code copyable={{ text: selectedOrder._id }}>
                  {selectedOrder._id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                <div>
                  <div>{selectedOrder.createdBy.name}</div>
                  <div style={{ color: '#666' }}>
                    {selectedOrder.createdBy.email}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">
                {selectedOrder.branch.name}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán" span={2}>
                <Select
                  value={selectedOrder.paymentMethod}
                  style={{ width: '100%', border: 'none', minWidth: '230px' }}
                  onChange={(value) => {
                    setSelectedOrder({
                      ...selectedOrder,
                      paymentMethod: value,
                    });
                  }}
                >
                  {paymentMethods.map((method) => (
                    <Option key={method.value} value={method.value}>
                      <CreditCardOutlined /> {method.label}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn hàng">
                <Select
                  value={selectedOrder.status}
                  style={{ width: '100%', border: 'none', minWidth: '150px' }}
                  onChange={(value) => {
                    setSelectedOrder({ ...selectedOrder, status: value });
                  }}
                >
                  {statusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Text>{option.label}</Text>
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <Select
                  value={selectedOrder.paymentStatus}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setSelectedOrder({
                      ...selectedOrder,
                      paymentStatus: value,
                    });
                  }}
                >
                  {paymentStatusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Text>{option.label}</Text>
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                <Input.TextArea
                  value={selectedOrder.shippingAddress}
                  onChange={(e) => {
                    setSelectedOrder({
                      ...selectedOrder,
                      shippingAddress: e.target.value,
                    });
                  }}
                  rows={2}
                  prefix={<EnvironmentOutlined />}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(selectedOrder.updatedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Sản phẩm đặt hàng</Divider>

            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Sản phẩm',
                  render: (_, item) => (
                    <div>
                      <div>{item.product.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.variant.name}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  align: 'center',
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  render: (price) => formatCurrency(price),
                  align: 'right',
                },
                {
                  title: 'Thành tiền',
                  render: (_, item) =>
                    formatCurrency(item.price * item.quantity),
                  align: 'right',
                },
              ]}
            />

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Text strong style={{ fontSize: '16px' }}>
                Tổng cộng: {formatCurrency(selectedOrder.totalPrice)}
              </Text>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title="Tạo Đơn Hàng Tại Quầy"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setCreateOrderData({
            phone: '',
            items: [],
            paymentMethod: 'cash',
            branch: '665ab123456789abcdef0001',
          });
          setSelectedProduct(null);
          setSelectedVariant(null);
          setQuantity(1);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsCreateModalVisible(false);
              setCreateOrderData({
                phone: '',
                items: [],
                paymentMethod: 'cash',
                branch: '665ab123456789abcdef0001',
              });
              setSelectedProduct(null);
              setSelectedVariant(null);
              setQuantity(1);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleCreateOrderSubmit}
          >
            Tạo Đơn Hàng
          </Button>,
        ]}
        width={900}
      >
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Số điện thoại khách hàng</Text>
                <Text style={{ color: '#ff4d4f' }}> *</Text>
              </div>
              <Input
                placeholder="Nhập số điện thoại"
                value={createOrderData.phone}
                onChange={(e) =>
                  setCreateOrderData({
                    ...createOrderData,
                    phone: e.target.value,
                  })
                }
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Phương thức thanh toán</Text>
              </div>
              <Select
                style={{ width: '100%' }}
                value={createOrderData.paymentMethod}
                onChange={(value) =>
                  setCreateOrderData({
                    ...createOrderData,
                    paymentMethod: value,
                  })
                }
              >
                {paymentMethods.map((method) => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Divider>Chọn sản phẩm</Divider>

          <Card
            size="small"
            style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
          >
            <Row gutter={16} align="bottom">
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Sản phẩm</Text>
                  <Text style={{ color: '#ff4d4f' }}> *</Text>
                </div>
                <Select
                  showSearch
                  placeholder="Tìm và chọn sản phẩm"
                  style={{ width: '100%' }}
                  value={selectedProduct?._id}
                  onChange={(value) => {
                    const product = products.find((p) => p._id === value);
                    setSelectedProduct(product);
                    setSelectedVariant(null); // Reset variant khi đổi sản phẩm
                  }}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {products.map((product) => (
                    <Option key={product._id} value={product._id}>
                      {product.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={6}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Phân loại</Text>
                  <Text style={{ color: '#ff4d4f' }}> *</Text>
                </div>
                <Select
                  placeholder="Chọn phân loại"
                  style={{ width: '100%' }}
                  value={selectedVariant?._id}
                  onChange={(value) => {
                    const variant = selectedProduct?.variants.find(
                      (v) => v._id === value,
                    );
                    setSelectedVariant(variant);
                  }}
                  disabled={!selectedProduct}
                >
                  {selectedProduct?.variants?.map((variant) => (
                    <Option key={variant._id} value={variant._id}>
                      {variant.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={4}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Số lượng</Text>
                  <Text style={{ color: '#ff4d4f' }}> *</Text>
                </div>
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                />
              </Col>

              <Col span={4}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Giá bán</Text>
                </div>
                <Input
                  value={
                    selectedVariant
                      ? formatCurrency(
                          selectedVariant.salePrice || selectedVariant.price,
                        )
                      : ''
                  }
                  disabled
                  style={{ width: '100%' }}
                />
              </Col>

              <Col span={2}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addProductToCart}
                  disabled={!selectedProduct || !selectedVariant}
                  style={{ width: '100%', padding: '0 8px' }}
                ></Button>
              </Col>
            </Row>
          </Card>

          <Divider>Giỏ hàng ({createOrderData.items.length} sản phẩm)</Divider>

          {createOrderData.items.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}
            >
              <ShoppingCartOutlined
                style={{ fontSize: '48px', marginBottom: '16px' }}
              />
              <div>Chưa có sản phẩm nào trong giỏ hàng</div>
              <div>Vui lòng chọn sản phẩm ở trên để thêm vào đơn hàng</div>
            </div>
          ) : (
            <Table
              dataSource={createOrderData.items}
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                {
                  title: 'Sản phẩm',
                  render: (_, item) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.productName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.variantName}
                      </div>
                    </div>
                  ),
                  width: '40%',
                },
                {
                  title: 'Đơn giá',
                  render: (_, item) => formatCurrency(item.price),
                  align: 'right',
                  width: '20%',
                },
                {
                  title: 'Số lượng',
                  render: (_, item, index) => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(value) =>
                          updateCartItemQuantity(index, value || 1)
                        }
                        style={{ width: '60px', margin: '0 8px' }}
                      />
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity + 1)
                        }
                      />
                    </div>
                  ),
                  align: 'center',
                  width: '25%',
                },
                {
                  title: 'Thành tiền',
                  render: (_, item) => (
                    <Text strong style={{ color: '#1890ff' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  ),
                  align: 'right',
                  width: '20%',
                },
                {
                  title: '',
                  render: (_, item, index) => (
                    <Popconfirm
                      title="Bạn có chắc muốn xóa sản phẩm này?"
                      onConfirm={() => removeProductFromCart(index)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      />
                    </Popconfirm>
                  ),
                  width: '10%',
                },
              ]}
            />
          )}

          {createOrderData.items.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
                textAlign: 'right',
              }}
            >
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                Tổng cộng: {formatCurrency(calculateTotal())}
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
