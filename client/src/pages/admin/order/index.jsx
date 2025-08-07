import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts';
import { formatCurrency } from '@/helpers';

import {
  callCreateOrder,
  callFetchBranches,
  callFetchOrders,
  callFetchProducts,
  callUpdateOrder,
} from '@/services/apis';
import Inventory from '@/services/inventories';
import Products from '@/services/products';
import {
  EyeOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  ReloadOutlined,
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
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  Empty,
  notification,
} from 'antd';
import { BsCartCheck } from 'react-icons/bs';
import OrderDetailsModal from '@/components/admin/order/orderDetailModal';
import CreateOrderModal from '@/components/admin/order/orderCreateModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xử lý', color: 'orange' },
  { value: 'PROCESSING', label: 'Đang xử lý', color: 'cyan' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
  { value: 'SHIPPING', label: 'Đang giao hàng', color: 'purple' },
  { value: 'DELIVERED', label: 'Đã giao hàng', color: 'green' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
  { value: 'RETURNED', label: 'Đã trả hàng', color: 'gray' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Đang chờ thanh toán', color: 'orange' },
  { value: 'COMPLETED', label: 'Đã thanh toán', color: 'green' },
  { value: 'FAILED', label: 'Thanh toán thất bại', color: 'red' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'gray' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'blue' },
];

const useOrderData = () => {
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsInInventory, setProductsInInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await callFetchOrders();
      setOrders(res.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu đơn hàng',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Quản lý đơn hàng';
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await callFetchProducts();
      setProducts(res.data.data.result);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu sản phẩm',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
      console.error('Failed to fetch products:', error);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await callFetchBranches();
      setBranches(res.data.data);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu chi nhánh',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
      console.error('Failed to fetch branches:', error);
    }
  }, []);

  const fetchProductsInInventory = useCallback(async () => {
    try {
      const res = await Inventory.getAll();
      setProductsInInventory(res.data.data);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu sản phẩm',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
      console.error('Failed to fetch products:', error);
    }
  }, []);

  const reloadData = useCallback(async () => {
    await Promise.all([
      fetchOrders(),
      fetchProducts(),
      fetchBranches(),
      fetchProductsInInventory(),
    ]);
  }, [fetchOrders, fetchProducts, fetchBranches, fetchProductsInInventory]);

  return {
    orders,
    branches,
    products,
    productsInInventory,
    loading,
    setLoading,
    reloadData,
    fetchOrders,
  };
};

const useOrderFilters = (orders) => {
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
    status: '',
  });

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (filters.branch) {
      filtered = filtered.filter((order) =>
        order.items.some(
          (item) => item.branch && item.branch._id === filters.branch,
        ),
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.buyer?.name?.toLowerCase().includes(searchLower) ||
          order.buyer?.phone?.toLowerCase().includes(searchLower) ||
          order.createdBy?.email?.toLowerCase().includes(searchLower) ||
          order.createdBy?.name?.toLowerCase().includes(searchLower) ||
          order.items.some((item) =>
            item.product?.name?.toLowerCase().includes(searchLower),
          ),
      );
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (filters.status) {
      filtered = filtered.filter((order) =>
        order.status.toLowerCase().includes(filters.status.toLowerCase()),
      );
    }

    return filtered;
  }, [orders, filters]);

  return { filters, setFilters, filteredOrders };
};

// Components
const OrderStatistics = ({ orders, filters, branches }) => {
  const stats = useMemo(() => {
    // Lọc đơn hàng không bị hủy - KHÔNG áp dụng bộ lọc trạng thái ở đây
    const validOrders = orders.filter((order) => order.status !== 'CANCELLED');

    let totalOrders, totalRevenue, pendingOrders, unpaidOrders;

    if (filters.branch) {
      // Nếu có bộ lọc chi nhánh, chỉ tính các đơn hàng có sản phẩm từ chi nhánh đó
      const branchOrders = validOrders.filter((order) =>
        order.items.some(
          (item) => item.branch && item.branch._id === filters.branch,
        ),
      );

      totalOrders = branchOrders.length;
      totalRevenue = branchOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0,
      );
      pendingOrders = branchOrders.filter(
        (order) => order.status === 'PENDING',
      ).length;
      unpaidOrders = branchOrders.filter(
        (order) => order.paymentStatus === 'PENDING',
      ).length;
    } else {
      // Nếu không có bộ lọc chi nhánh, tính tất cả đơn hàng
      totalOrders = validOrders.length;
      totalRevenue = validOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0,
      );
      pendingOrders = validOrders.filter(
        (order) => order.status === 'PENDING',
      ).length;
      unpaidOrders = validOrders.filter(
        (order) => order.paymentStatus === 'PENDING',
      ).length;
    }

    // Tính doanh thu riêng theo chi nhánh nếu có bộ lọc chi nhánh
    let branchRevenue = null;
    let branchName = '';

    if (filters.branch) {
      const selectedBranch = branches.find((b) => b._id === filters.branch);
      branchName = selectedBranch?.name || '';

      // Tính tổng doanh thu từ các item thuộc chi nhánh được chọn
      branchRevenue = validOrders.reduce((sum, order) => {
        const branchItemsValue = order.items
          .filter((item) => item.branch && item.branch._id === filters.branch)
          .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);

        return sum + branchItemsValue;
      }, 0);
    }

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      unpaidOrders,
      branchRevenue,
      branchName,
    };
  }, [orders, filters.branch, branches]);

  return (
    <Row gutter={10} style={{ marginBottom: '10px' }}>
      <Col span={filters.branch ? 5 : 6}>
        <Card>
          <Statistic
            title={filters.branch ? 'Đơn hàng (Chi nhánh)' : 'Tổng đơn hàng'}
            value={stats.totalOrders}
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>
      <Col span={filters.branch ? 5 : 6}>
        <Card>
          <Statistic
            title={filters.branch ? 'Doanh thu (Chi nhánh)' : 'Tổng doanh thu'}
            value={stats.totalRevenue}
            formatter={(value) => formatCurrency(value)}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
      {filters.branch && stats.branchRevenue !== null && (
        <Col span={5}>
          <Card>
            <Statistic
              title={`Doanh thu ${stats.branchName}`}
              value={stats.branchRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      )}
      <Col span={filters.branch ? 5 : 6}>
        <Card>
          <Statistic
            title="Đơn chờ xử lý"
            value={stats.pendingOrders}
            valueStyle={{ color: '#faad14' }}
            prefix={<Badge status="warning" />}
          />
        </Card>
      </Col>
      <Col span={filters.branch ? 4 : 6}>
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
  );
};

const OrderFilters = ({ filters, setFilters, branches, onCreateOrder }) => (
  <Card style={{ marginBottom: '10px' }}>
    <Row gutter={16}>
      <Col span={6}>
        <Input
          placeholder="Tìm kiếm theo tên, SĐT, sản phẩm..."
          prefix={<SearchOutlined />}
          value={filters.searchText}
          onChange={(e) =>
            setFilters({ ...filters, searchText: e.target.value })
          }
        />
      </Col>
      <Col span={4}>
        <Select
          placeholder="Trạng thái"
          style={{ width: '100%' }}
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          allowClear
        >
          {STATUS_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Col>
      <Col span={4}>
        <Select
          placeholder="Chi nhánh"
          style={{ width: '100%' }}
          value={filters.branch}
          defaultValue={filters.branch}
          onChange={(value) => setFilters({ ...filters, branch: value })}
          allowClear
        >
          {branches.map((branch) => (
            <Option key={branch._id} value={branch._id}>
              {branch.name}
            </Option>
          ))}
        </Select>
      </Col>
      <Col span={4}>
        <RangePicker
          style={{ width: '100%' }}
          placeholder={['Từ ngày', 'Đến ngày']}
          value={filters.dateRange}
          onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
        />
      </Col>
      <Col span={2}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            setFilters({
              status: '',
              branch: '',
              searchText: '',
              dateRange: null,
            })
          }
        >
          Reset
        </Button>
      </Col>
      <Col span={4}>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateOrder}>
          Tạo Đơn Hàng Tại Quầy
        </Button>
      </Col>
    </Row>
  </Card>
);

// Main Component
const OrderManagement = () => {
  const { user } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const {
    orders,
    branches,
    products,
    productsInInventory,
    loading,
    setLoading,
    reloadData,
    fetchOrders,
  } = useOrderData();

  const { filters, setFilters, filteredOrders } = useOrderFilters(orders);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const showOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  }, []);

  const handleCreateOrderSubmit = async (orderData) => {
    setLoading(true);

    const submitData = {
      buyer: {
        name: orderData.name,
        phone: orderData.phone,
      },
      recipient: {
        name: orderData.name,
        phone: orderData.phone,
        address: `Nhận tại quầy, ${branches.find((b) => b._id === user?.branch)?.name || 'Chi nhánh'}`,
      },
      items: orderData.items.map((item) => ({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        branch: orderData.branch,
      })),
      paymentMethod: orderData.paymentMethod,
    };

    try {
      await callCreateOrder(submitData);
      setIsCreateModalVisible(false);

      const total = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      notification.success({
        message: 'Tạo đơn hàng thành công',
        description: `Đơn hàng đã được tạo thành công với tổng giá trị ${formatCurrency(total)}.`,
        duration: 4.5,
      });

      await fetchOrders();
    } catch (err) {
      console.error('Create order error:', err);

      if (err.response?.status === 404) {
        notification.error({
          message: 'Không đủ hàng trong kho',
          description:
            'Một hoặc nhiều sản phẩm trong đơn hàng không đủ số lượng tồn kho.',
          duration: 5,
        });
      } else {
        notification.error({
          message: 'Lỗi tạo đơn hàng',
          description:
            err.response?.data?.message ||
            'Đã xảy ra lỗi không xác định khi tạo đơn hàng.',
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId, data) => {
    try {
      setLoading(true);
      await callUpdateOrder(orderId, data);
      await fetchOrders();

      notification.success({
        message: 'Cập nhật đơn hàng thành công',
        description: 'Thông tin đơn hàng đã được cập nhật và lưu vào hệ thống.',
        duration: 4,
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      notification.error({
        message: 'Cập nhật đơn hàng thất bại',
        description:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi cập nhật đơn hàng.',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async (status) => {
    try {
      setLoading(true);
      await Products.confirmReturn(selectedOrder._id, status);
      await fetchOrders();

      notification.success({
        message: 'Cập nhật đơn hàng thành công',
        description: 'Thông tin đơn hàng đã được cập nhật và lưu vào hệ thống.',
        duration: 4,
      });
    } catch (error) {
      console.error('Failed to confirm return:', error);
      notification.error({
        message: 'Cập nhật đơn hàng thất bại',
        description:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi cập nhật đơn hàng.',
        duration: 4,
      });
    } finally {
      setLoading(false);
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
          #{text?.slice(-8) || ''}
        </Text>
      ),
    },
    {
      title: 'Người tạo đơn hàng',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.createdBy?.name || 'Không có'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.createdBy?.email || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'buyer',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.buyer?.name || 'Không có'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.buyer?.phone || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      width: 120,
      render: (_, record) => (
        <div>
          {record.items
            ?.map((item) => item.branch?.name || 'Không có')
            .filter((name, index, self) => self.indexOf(name) === index)
            .join(', ')}
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 200,
      render: (_, record) => (
        <div>
          {record.items?.map((item, index) => (
            <div
              key={`${item.product?._id}-${item.variant?._id}-${index}`}
              style={{ marginBottom: index < record.items.length - 1 ? 4 : 0 }}
            >
              <div style={{ fontSize: '13px' }}>
                {item.product?.name || 'Không có tên'}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {item.variant?.name || 'Không có phân loại'} x{' '}
                {item.quantity || 0}
              </div>
            </div>
          )) || 'Không có sản phẩm'}
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
          {formatCurrency(price || 0)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
        return (
          <Text color={statusOption?.color || 'default'}>
            {statusOption?.label || status}
          </Text>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (paymentStatus) => {
        const statusOption = PAYMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === paymentStatus,
        );
        return (
          <Text color={statusOption?.color || 'default'}>
            {statusOption?.label || paymentStatus}
          </Text>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(record)}
            title="Xem chi tiết"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Card className='mb-10!'>
        <Title
          level={3}
          style={{ margin: 0, display: 'flex', alignItems: 'center' }}
        >
          <BsCartCheck style={{ marginRight: '8px' }} />
          Quản lý đơn hàng
        </Title>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Quản lý các đơn hàng và thêm đơn hàng mới
        </p>
      </Card>

      <OrderStatistics orders={orders} filters={filters} branches={branches} />

      <OrderFilters
        filters={filters}
        setFilters={setFilters}
        branches={branches}
        onCreateOrder={() => setIsCreateModalVisible(true)}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy đơn hàng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <OrderDetailsModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        order={selectedOrder}
        onUpdate={handleUpdateOrder}
        onConfirmReturn={handleConfirmReturn}
        loading={loading}
      />

      <CreateOrderModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateOrderSubmit}
        loading={loading}
        branches={branches}
        productsInInventory={productsInInventory}
        user={user}
      />
    </div>
  );
};

export default OrderManagement;
