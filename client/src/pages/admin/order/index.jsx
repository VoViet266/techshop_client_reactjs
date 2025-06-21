import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Select,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Typography,
  message,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
  Badge,
  Divider,
} from 'antd';
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
} from '@ant-design/icons';
import { callFetchBranches, callFetchOrders, callUpdateOrder } from '@/services/apis';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
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

  // Order status options
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
    { value: 'COD', label: 'Thanh toán khi nhận hàng' },
    // { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { value: 'credit_card', label: 'Thẻ tín dụng' },
    { value: 'e_wallet', label: 'Ví điện tử' },
  ];

  const fetchBranches = async () => {
    try {
      const res = await callFetchBranches();

      console.log(res.data.data);
      setBranches(res.data.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    if (filters.branch) {
      filtered = filtered.filter((order) => order.branch._id === filters.branch);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchLower) ||
          order.createdBy.email.toLowerCase().includes(searchLower) ||
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
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;
    const unpaidOrders = orders.filter((order) => order.paymentStatus === 'PENDING').length;

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
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.createdBy.name || 'Không có'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.createdBy.email}</div>
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
            <div key={index} style={{ marginBottom: index < record.items.length - 1 ? 4 : 0 }}>
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
        const statusLabel = statusOptions.find((opt) => opt.value === status)?.label || status;
        const statusColor = statusOptions.find((opt) => opt.value === status)?.color || 'default';
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
      console.log(orderId);
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
  }, []);
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý đơn hàng</Title>

      {/* Statistics */}
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

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            />
          </Col>

          <Col span={6}>
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
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
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
                  <div style={{ color: '#666' }}>{selectedOrder.createdBy.email}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">{selectedOrder.branch.name}</Descriptions.Item>
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
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.variant.name}</div>
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
                  render: (_, item) => formatCurrency(item.price * item.quantity),
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
    </div>
  );
};

export default OrderManagement;
