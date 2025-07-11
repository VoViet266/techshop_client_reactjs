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

const { Text } = Typography;

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
  const { message } = useAppContext();
  const { RangePicker } = DatePicker;

  const fetchProducts = async () => {
    try {
      const response = await callFetchProducts();
      const productsData = response.data.data.result;
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      message.error('Không thể tải danh sách chi nhánh');
    }
  };

  const fetchInboundHistory = async () => {
    try {
      const response = await callFetchInboundHistory();
      setInboundHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching inbound history:', error);
      message.error('Không thể tải lịch sử nhập kho');
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
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    message.success('Nhập kho');
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
    message.success('Đã xóa sản phẩm khỏi danh sách');
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
          message.error('Vui lòng thêm ít nhất một sản phẩm');
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
        message.error('Vui lòng chọn chi nhánh');
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
      message.error(error.message || 'Có lỗi xảy ra khi nhập kho');
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
      title: 'Mã phiếu xuất',
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
      title: 'Ngày xuất',
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
        padding: '24px',
        minHeight: '100vh',
        borderRadius: '8px',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }}
            title="Tạo phiếu nhập kho"
            extra={
              <Space>
                <Upload
                  name="file"
                  maxCount={1}
                  accept=".xlsx"
                  showUploadList={false}
                  onChange={() => console.log('Import Excel')}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />}>Import Excel</Button>
                </Upload>
              </Space>
            }
          >
            <InboundForm
              form={form}
              branches={branches}
              selectedProduct={selectedProduct}
              setProductSearchVisible={setProductSearchVisible}
              handleAddItem={handleAddItem}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10} style={{ marginBottom: '24px' }}>
          <InboundSummary
            inbound={inbound}
            inboundItems={inboundItems}
            totalQuantity={totalQuantity}
            totalValue={totalValue}
            handleSubmitInbound={handleSubmitInbound}
            loading={loading}
          />

          <Card title="Danh sách sản phẩm" style={{ marginTop: '16px' }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {inboundItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Row justify="space-between" align="middle">
                    <Col span={18}>
                      <Text strong style={{ fontSize: '12px' }}>
                        {item.productName}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {item.variantName} × {item.quantity}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        SKU: {item.variantSku}
                      </Text>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: '11px', color: '#fa8c16' }}>
                        {item.total.toLocaleString('vi-VN')}₫
                      </Text>
                      <br />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.id)}
                      />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {inboundItems.length > 0 && (
        <Card title="Chi tiết sản phẩm nhập kho" style={{ marginTop: '24px' }}>
          <Table
            columns={itemColumns}
            dataSource={filteredInbound}
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      )}
      <Card style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
            />
          </Col>

          <Col span={5}>
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
          <Col span={8}>
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
                  branch: '',
                  searchText: '',
                  dateRange: null,
                })
              }
            >
              Làm mới lọc
            </Button>
          </Col>
        </Row>
      </Card>
      <Card title="Lịch sử nhập kho" style={{ marginTop: '24px' }}>
        <Table
          columns={historyColumns}
          dataSource={filteredInbound}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

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
