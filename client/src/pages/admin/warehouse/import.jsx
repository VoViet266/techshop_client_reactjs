import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Avatar,
  Upload,
  Tooltip,
  Badge,
  Popconfirm,
  Spin,
  DatePicker,
  Input,
  Select,
  Divider,
} from 'antd';
import {
  DeleteOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  InboxOutlined,
  HistoryOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import {
  callFetchBranches,
  callFetchDetailInbound,
  callFetchInboundHistory,
  callFetchProducts,
  callImportInventory,
} from '@/services/apis';

import ModalSearchProduct from '../../../components/admin/warehouse/modalSearchProduct';
import InboundConfirmModal from '@/components/admin/warehouse/InboundConfirmModal';
import InboundForm from '@/components/admin/warehouse/InboundForm';
import InboundSummary from '@/components/admin/warehouse/InboundSummary';
import InboundDetailDrawer from '@/components/admin/warehouse/InboundDetailDrawer';
import { useAppContext } from '@/contexts';
import { hasPermission } from '@/helpers';
import { Actions, Subjects } from '@/constants/permissions';

const { Text, Title } = Typography;
const { Option } = Select;

const WarehouseInbound = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inboundItems, setInboundItems] = useState([]);
  const [inboundHistory, setInboundHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [productSearchVisible, setProductSearchVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedInboundDetail, setSelectedInboundDetail] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const inbound = useState(true);
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
  });
  const { message, notification, permissions } = useAppContext();
  const { RangePicker } = DatePicker;

  const fetchProducts = async () => {
    try {
      const response = await callFetchProducts();
      const productsData = response.data.data.result;
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu sản phẩm',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu chi nhánh',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    }
  };

  const fetchInboundHistory = async () => {
    try {
      const response = await callFetchInboundHistory();
      setInboundHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching inbound history:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu lịch sử nhập kho',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    }
  };

  const fetchInboundDetail = async (inboundId) => {
    setDetailLoading(true);
    try {
      const response = await callFetchDetailInbound(inboundId);
      setSelectedInboundDetail(response.data.data);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching inbound detail:', error);
      message.error('Không thể tải chi tiết phiếu nhập');
    } finally {
      setDetailLoading(false);
    }
  };

  const loadAllData = async () => {
    setPageLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBranches(),
        fetchInboundHistory(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const filteredInbound = inboundHistory.filter((inbound) => {
    let isMatch = true;

    if (filters.branch) {
      isMatch = isMatch && inbound.branchId._id === filters.branch;
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      console.log(inbound.productId?.name);
      isMatch =
        isMatch &&
        (inbound.productId?.name.toLowerCase().includes(searchLower) ||
          inbound.branchId?.name.toLowerCase().includes(searchLower) ||
          inbound.createdBy?.name.toLowerCase().includes(searchLower) ||
          inbound.createdBy?.email.toLowerCase().includes(searchLower));
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const createdAt = new Date(inbound.createdAt).getTime();
      const from = new Date(filters.dateRange[0]).getTime();
      const to = new Date(filters.dateRange[1]).getTime();
      isMatch = isMatch && createdAt >= from && createdAt <= to;
    }

    return isMatch;
  });

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);

    form.setFieldsValue({
      productId: product._id,
      variantId: undefined,
    });
    setProductSearchVisible(false);
    message.success(`Đã chọn sản phẩm: ${product.name}`);
  };

  const handleAddItem = () => {
    form
      .validateFields(['productId', 'variantId', 'quantity', 'cost'])
      .then((values) => {
        const product = products.find((p) => p._id === values.productId);
        const variant = product.variants.find(
          (v) => v._id === values.variantId,
        );
        const existingItem = inboundItems.find(
          (item) =>
            item.productId === values.productId &&
            item.variantId === values.variantId,
        );

        if (existingItem) {
          message.warning(
            'Sản phẩm này đã có trong danh sách. Vui lòng chỉnh sửa số lượng.',
          );
          return;
        }

        const newItem = {
          id: Date.now(),
          productId: values.productId,
          branchId: values.branchId,
          productName: product.name,
          productCode: product.code,
          variantName: variant.name,
          variantId: values.variantId,
          variantSku: variant.sku,
          quantity: values.quantity,
          cost: values.cost || variant.cost,
          total: values.quantity * (values.cost || variant.cost),
        };

        setInboundItems([...inboundItems, newItem]);
        form.setFieldsValue({
          productId: undefined,
          variantId: undefined,
          quantity: undefined,
          cost: undefined,
        });
        setSelectedProduct(null);
        message.success('Đã thêm sản phẩm vào danh sách nhập kho');
      })
      .catch((errorInfo) => {
        message.error('Vui lòng điền đầy đủ thông tin');
      });
  };

  const handleRemoveItem = (id) => {
    setInboundItems(inboundItems.filter((item) => item.id !== id));
    notification.success({ message: 'Xóa sản phẩm trong danh sách nhập kho' });
  };

  const handleUpdateQuantity = (id, quantity) => {
    setInboundItems(
      inboundItems.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.cost }
          : item,
      ),
    );
  };

  const handleUpdateCost = (id, cost) => {
    setInboundItems(
      inboundItems.map((item) =>
        item.id === id ? { ...item, cost, total: item.quantity * cost } : item,
      ),
    );
  };

  const handleSubmitInbound = () => {
    form
      .validateFields(['branchId'])
      .then((values) => {
        if (inboundItems.length === 0) {
          notification.warning({
            message: 'Vui lòng chọn sản phẩm trên danh sách',
          });
          return;
        }

        const inboundData = {
          ...values,
          items: inboundItems,
          totalItems: inboundItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
          totalValue: inboundItems.reduce((sum, item) => sum + item.total, 0),
        };

        setPreviewData(inboundData);
        setIsModalVisible(true);
      })
      .catch(() => {
        notification.warning({ message: 'Vui lòng chọn chi nhánh' });
      });
  };

  const confirmInbound = async () => {
    setLoading(true);
    try {
      const importRequests = {};

      inboundItems.forEach((item) => {
        if (!importRequests[item.productId]) {
          importRequests[item.productId] = {
            branchId: previewData.branchId,
            productId: item.productId,
            variants: [],
          };
        }
        importRequests[item.productId].variants.push({
          variantId: String(item.variantId),
          quantity: item.quantity,
          cost: item.cost,
        });
      });

      await Promise.all(
        Object.values(importRequests).map((data) => callImportInventory(data)),
      );

      message.success('Nhập kho thành công!');
      setInboundItems([]);
      form.resetFields();
      setIsModalVisible(false);
      await fetchInboundHistory();
    } catch (error) {
      console.error('Error importing inventory:', error);
      notification.error({
        message: 'Lỗi nhập kho',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<ProductOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Text strong>{record.productName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.productCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Biến thể',
      key: 'variant',
      width: 200,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.variantName}</Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            SKU: {record.variantSku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleUpdateQuantity(record.id, value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giá vốn',
      key: 'cost',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.cost}
          onChange={(value) => handleUpdateCost(record.id, value)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          addonAfter="₫"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (_, record) => (
        <Text strong style={{ color: '#fa8c16' }}>
          {record.total?.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Mã phiếu nhập',
      dataIndex: '_id',
      key: 'code',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <Text strong copyable={{ text: text }}>
            {text.slice(-8)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 200,
      sorter: (a, b) => a.productId?.name.localeCompare(b.productId?.name),
      render: (_, record) => (
        <Space>
          <ProductOutlined style={{ color: '#1890ff' }} />
          <Text ellipsis>{record.productId?.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.branchId?.name.localeCompare(b.branchId?.name),
      render: (_, record) => (
        <Space>
          <ShopOutlined style={{ color: '#52c41a' }} />
          <Text ellipsis>{record.branchId?.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      key: 'totalItems',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.totalItems - b.totalItems,
      render: (_, record) => {
        const total =
          record.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
        return <Badge count={total} style={{ backgroundColor: '#52c41a' }} />;
      },
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text ellipsis>{new Date(date).toLocaleDateString('vi-VN')}</Text>
        </Space>
      ),
    },
    {
      title: 'Người tạo',
      key: 'createdBy',
      width: 150,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text ellipsis>{record.createdBy?.name}</Text>
        </Space>
      ),
    },
    {
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => fetchInboundDetail(record._id)}
              loading={detailLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalQuantity = inboundItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalValue = inboundItems.reduce((sum, item) => sum + item.total, 0);

  if (pageLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '24px 32px',
          borderRadius: '12px',
          marginBottom: '10px',
        }}
      >
        <Space align="center" size="large">
          <Avatar size={48} icon={<InboxOutlined />} />
          <div>
            <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
              Quản lý nhập kho
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Tạo phiếu nhập kho và quản lý lịch sử nhập hàng
            </Text>
          </div>
        </Space>
      </div>

      <Row gutter={[10, 10]}>
        <Col xs={24} lg={14}>
          <Card
            className="h-full!"
            title={
              <Space className="py-5!">
                <ImportOutlined />
                <Text strong className="text-[16px]!">Tạo phiếu nhập kho</Text>
              </Space>
            }
          >
            <InboundForm
              permissions={permissions}
              form={form}
              inbound={inbound}
              branches={branches}
              selectedProduct={selectedProduct}
              setProductSearchVisible={setProductSearchVisible}
              handleAddItem={handleAddItem}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <InboundSummary
            inbound={inbound}
            inboundItems={inboundItems}
            totalQuantity={totalQuantity}
            totalValue={totalValue}
            handleSubmitInbound={handleSubmitInbound}
            loading={loading}
          />

          <Card
            className="mt-10!"
            title={
              <Space className="py-5!">
                <ProductOutlined style={{ color: '#52c41a' }} />
                <span>Danh sách sản phẩm</span>
              </Space>
            }
          >
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {inboundItems.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '40px 20px',
                    color: '#999',
                  }}
                >
                  <InboxOutlined
                    style={{ fontSize: '48px', marginBottom: '16px' }}
                  />
                  <Text type="secondary">Chưa có sản phẩm nào được thêm</Text>
                </div>
              ) : (
                inboundItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col span={18}>
                        <Text
                          strong
                          style={{ fontSize: '13px', color: '#2c3e50' }}
                        >
                          {item.productName}
                        </Text>
                        <br />
                        <Tag
                          color="blue"
                          size="small"
                          style={{ marginTop: '4px' }}
                        >
                          {item.variantName}
                        </Tag>
                        <Text
                          type="secondary"
                          style={{ fontSize: '11px', marginLeft: '8px' }}
                        >
                          × {item.quantity}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          SKU: {item.variantSku}
                        </Text>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Text
                          strong
                          style={{ fontSize: '12px', color: '#fa8c16' }}
                        >
                          {item.total.toLocaleString('vi-VN')}₫
                        </Text>
                        <br />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ marginTop: '4px' }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {inboundItems.length > 0 && (
        <Card
          title={
            <Space>
              <ProductOutlined style={{ color: '#722ed1' }} />
              <span>Chi tiết sản phẩm nhập kho</span>
            </Space>
          }
          style={{
            borderRadius: '12px',
            margin: '10px 0',
          }}
        >
          <Table
            columns={itemColumns}
            dataSource={inboundItems}
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      {hasPermission(permissions, Subjects.Inventory, Actions.Read) && (
        <Card
          style={{
            borderRadius: '12px',
            margin: '10px 0',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Input
                size="large"
                placeholder="Tìm kiếm theo tên sản phẩm, chi nhánh, người tạo..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
                style={{ borderRadius: '8px' }}
              />
            </Col>

            <Col span={5}>
              <Select
                size="large"
                placeholder="Chọn chi nhánh"
                style={{ width: '100%' }}
                value={filters.branch}
                onChange={(value) => setFilters({ ...filters, branch: value })}
                allowClear
              >
                <Option value="">Tất cả chi nhánh</Option>
                {branches.map((branch) => (
                  <Option key={branch._id} value={branch._id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={8}>
              <RangePicker
                size="large"
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={(dates) =>
                  setFilters({ ...filters, dateRange: dates })
                }
              />
            </Col>

            <Col span={3}>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() =>
                  setFilters({
                    branch: '',
                    searchText: '',
                    dateRange: null,
                  })
                }
                style={{ width: '100%' }}
              >
                Làm mới
              </Button>
            </Col>
            <Divider />
            <Col span={24}>
              <Card
                title={
                  <Space className="py-5!">
                    <HistoryOutlined style={{ color: '#fa8c16' }} />
                    <span>Lịch sử nhập kho</span>
                  </Space>
                }
              >
                <Table
                  columns={historyColumns}
                  dataSource={filteredInbound}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} bản ghi`,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      <ModalSearchProduct
        inbound={inbound}
        setProductSearchVisible={setProductSearchVisible}
        productSearchVisible={productSearchVisible}
        handleSelectProduct={handleSelectProduct}
        filteredProducts={filteredProducts}
        setFilteredProducts={setFilteredProducts}
        products={products}
        setProducts={setProducts}
      />
      <InboundDetailDrawer
        inbound={inbound}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        selectedInboundDetail={selectedInboundDetail}
      />
      <InboundConfirmModal
        inbound={inbound}
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={confirmInbound}
        loading={loading}
        previewData={previewData}
        branches={branches}
      />
    </div>
  );
};

export default WarehouseInbound;
