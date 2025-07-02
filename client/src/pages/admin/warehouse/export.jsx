import React, { useState, useEffect } from 'react';
import useMessage from '@/hooks/useMessage';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Avatar,
  Input,
  DatePicker,
  Upload,
  Tooltip,
  Statistic,
  Badge,
  Popconfirm,
  Alert,
  Spin,
  Drawer,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileExcelOutlined,
  InboxOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
  CloseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  callExportInventory,
  callFetchBranches,
  callFetchDetailOutbound,
  callFetchInventories,
  callFetchOutboundHistory,
} from '@/services/apis';

import { useAppContext } from '@/contexts';
import InboundDetailDrawer from '@/components/admin/warehouse/InboundDetailDrawer';
import InboundSummary from '@/components/admin/warehouse/InboundSummary';
import InboundConfirmModal from '@/components/admin/warehouse/InboundConfirmModal';

const { Text } = Typography;
const { Option } = Select;

const WarehouseOutbound = () => {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
  });
  const { message } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [outboundItems, setOutboundItems] = useState([]);
  const [outboundHistory, setOutboundHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [productSearchVisible, setProductSearchVisible] = useState(false);
  const [selectedOutboundDetail, setSelectedOutboundDetail] = useState(null);
  const [productSearchText, setProductSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const { RangePicker } = DatePicker;
  const fetchInventories = async () => {
    try {
      const response = await callFetchInventories();
      setInventories(response.data.data);
      message.success('Lấy danh sách tồn kho thành công');
    } catch (err) {
      console.error('Error fetching inventories:', err);
      message.error('Không thể tải danh sách tồn kho');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      message.error('Không thể tải danh sách chi nhánh');
    }
  };

  const fetchOutboundHistory = async () => {
    try {
      const response = await callFetchOutboundHistory();
      setOutboundHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching outbound history:', error);
      message.error('Không thể tải lịch sử xuất kho');
    }
  };

  const fetchOutboundDetail = async (OutboundId) => {
    setDetailLoading(true);
    try {
      const response = await callFetchDetailOutbound(OutboundId);
      setSelectedOutboundDetail(response.data.data);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching outbound detail:', error);
      message.error('Không thể tải chi tiết phiếu xuất');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchInventories(),
          fetchBranches(),
          fetchOutboundHistory(),
        ]);
      } catch (error) {
        message.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setPageLoading(false);
      }
    };

    loadAllData();
  }, []);

  const getFilteredInventories = () => {
    if (!selectedBranch) return [];
    return inventories.filter((inv) => inv.branch._id === selectedBranch);
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setSelectedProduct(null);
    setSelectedInventory(null);
    form.setFieldsValue({
      productId: undefined,
      variantId: undefined,
    });
  };

  const handleProductChange = (productId) => {
    const inventory = getFilteredInventories().find(
      (inv) => inv.product._id === productId,
    );
    setSelectedInventory(inventory);
    setSelectedProduct(inventory?.product);
    form.setFieldsValue({
      variantId: undefined,
    });
  };

  const getVariantInfo = (variantId) => {
    if (!selectedInventory) return null;
    return selectedInventory.variants.find(
      (v) => v.variantId._id === variantId,
    );
  };

  const checkStockAvailability = (variantId, requestedQuantity) => {
    const variantInfo = getVariantInfo(variantId);
    if (!variantInfo) return false;
    return variantInfo.stock >= requestedQuantity;
  };

  const handleAddItem = () => {
    form
      .validateFields(['branchId', 'productId', 'variantId', 'quantity'])
      .then((values) => {
        const variantInfo = getVariantInfo(values.variantId);

        if (!variantInfo) {
          error('Không tìm thấy thông tin variant');
          return;
        }

        if (!checkStockAvailability(values.variantId, values.quantity)) {
          message.warning(
            `Số lượng tồn kho không đủ. Tồn kho hiện tại: ${variantInfo.stock}`,
          );
          return;
        }

        const existingItem = outboundItems.find(
          (item) =>
            item.productId === values.productId &&
            item.variantId === values.variantId,
        );

        if (existingItem) {
          // Kiểm tra tổng số lượng sau khi cộng thêm
          const totalQuantity = existingItem.quantity + values.quantity;
          if (!checkStockAvailability(values.variantId, totalQuantity)) {
            message.warning(
              `Tổng số lượng vượt quá tồn kho. Tồn kho hiện tại: ${variantInfo.stock}, Đã chọn: ${existingItem.quantity}`,
            );

            return;
          }

          setOutboundItems(
            outboundItems.map((item) =>
              item.productId === values.productId &&
              item.variantId === values.variantId
                ? {
                    ...item,
                    quantity: totalQuantity,
                    total: totalQuantity * item.cost,
                  }
                : item,
            ),
          );
          message.success('Đã cập nhật số lượng sản phẩm');
        } else {
          const newItem = {
            id: Date.now(),
            productId: values.productId,
            branchId: values.branchId,
            productName: selectedProduct.name,
            productCode: selectedProduct.code,
            variantName: variantInfo.variantId.name,
            variantId: values.variantId,
            variantSku: variantInfo.variantId.sku,
            quantity: values.quantity,
            cost: variantInfo.cost,
            total: values.quantity * variantInfo.cost,
            availableStock: variantInfo.stock,
          };

          setOutboundItems([...outboundItems, newItem]);
          message.success('Đã thêm sản phẩm vào danh sách xuất kho');
        }

        form.setFieldsValue({
          productId: undefined,
          variantId: undefined,
          quantity: undefined,
        });
        setSelectedProduct(null);
        setSelectedInventory(null);
      })
      .catch((errorInfo) => {
        message.error('Vui lòng điền đầy đủ thông tin');
      });
  };

  const handleRemoveItem = (id) => {
    setOutboundItems(outboundItems.filter((item) => item.id !== id));
    message.success('Đã xóa sản phẩm khỏi danh sách');
  };

  const handleUpdateQuantity = (id, quantity) => {
    const item = outboundItems.find((i) => i.id === id);
    if (!item) return;

    if (!checkStockAvailability(item.variantId, quantity)) {
      message.warning(
        `Số lượng vượt quá tồn kho. Tồn kho hiện tại: ${item.availableStock}`,
      );
      return;
    }

    setOutboundItems(
      outboundItems.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.cost }
          : item,
      ),
    );
  };

  const handleUpdateCost = (id, cost) => {
    setOutboundItems(
      outboundItems.map((item) =>
        item.id === id ? { ...item, cost, total: item.quantity * cost } : item,
      ),
    );
  };
  const filteredOutbound = outboundHistory.filter((outbound) => {
    let isMatch = true;

    if (filters.branch) {
      isMatch = isMatch && outbound.branchId._id === filters.branch;
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      console.log(outbound.productId?.name);
      isMatch =
        isMatch &&
        (outbound.productId?.name.toLowerCase().includes(searchLower) ||
          outbound.branchId?.name.toLowerCase().includes(searchLower) ||
          outbound.createdBy?.name.toLowerCase().includes(searchLower) ||
          outbound.createdBy?.email.toLowerCase().includes(searchLower));
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const createdAt = new Date(outbound.createdAt).getTime();
      const from = new Date(filters.dateRange[0]).getTime();
      const to = new Date(filters.dateRange[1]).getTime();
      isMatch = isMatch && createdAt >= from && createdAt <= to;
    }

    return isMatch;
  });
  const handleSubmitOutbound = () => {
    form
      .validateFields(['branchId'])
      .then((values) => {
        if (outboundItems.length === 0) {
          message.error('Vui lòng thêm ít nhất một sản phẩm');
          return;
        }

        const outboundData = {
          ...values,
          items: outboundItems,
          totalItems: outboundItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
          totalValue: outboundItems.reduce((sum, item) => sum + item.total, 0),
        };

        setPreviewData(outboundData);
        setIsModalVisible(true);
      })
      .catch(() => {
        message.error('Vui lòng chọn chi nhánh');
      });
  };

  const confirmOutbound = async () => {
    setLoading(true);
    try {
      const exportRequests = {};

      outboundItems.forEach((item) => {
        if (!exportRequests[item.productId]) {
          exportRequests[item.productId] = {
            branchId: previewData.branchId,
            productId: item.productId,
            variants: [],
          };
        }
        exportRequests[item.productId].variants.push({
          variantId: String(item.variantId),
          quantity: item.quantity,
          cost: item.cost,
        });
      });

      await Promise.all(
        Object.values(exportRequests).map((data) => callExportInventory(data)),
      );

      message.success('Xuất kho thành công!');
      setOutboundItems([]);
      form.resetFields();
      setSelectedBranch(null);
      setSelectedProduct(null);
      setSelectedInventory(null);
      setIsModalVisible(false);
      await Promise.all([fetchInventories(), fetchOutboundHistory()]); // Refresh cả inventory và history
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi xuất kho');
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
          <br />
          <Text type="success" style={{ fontSize: '10px' }}>
            Tồn kho: {record.availableStock}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <InputNumber
            min={1}
            max={record.availableStock}
            value={record.quantity}
            onChange={(value) => handleUpdateQuantity(record.id, value)}
            style={{ width: '100%' }}
          />
          {record.quantity > record.availableStock && (
            <Text type="danger" style={{ fontSize: '10px' }}>
              <WarningOutlined /> Vượt tồn kho
            </Text>
          )}
        </div>
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
          {record.total.toLocaleString('vi-VN')} ₫
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
      render: (_, record) => (
        <Space>
          <ShopOutlined style={{ color: '#52c41a' }} />
          <Text ellipsis>{record.branchId?.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng xuất',
      key: 'totalItems',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const total =
          record.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
        return <Badge count={total} style={{ backgroundColor: '#f5222d' }} />;
      },
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
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
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => fetchOutboundDetail(record._id)}
              loading={detailLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalQuantity = outboundItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalValue = outboundItems.reduce((sum, item) => sum + item.total, 0);

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
            title="Tạo phiếu xuất kho"
            extra={
              <Space>
                <Upload
                  name="file"
                  maxCount={1}
                  accept=".xlsx"
                  showUploadList={false}
                  onChange={() => console.log('Export Excel')}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />}>Export Excel</Button>
                </Upload>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Chi nhánh"
                    name="branchId"
                    rules={[
                      { required: true, message: 'Vui lòng chọn chi nhánh' },
                    ]}
                  >
                    <Select
                      placeholder="Chọn chi nhánh"
                      onChange={handleBranchChange}
                      size="large"
                    >
                      {branches.map((branch) => (
                        <Option key={branch._id} value={branch._id}>
                          <Space>
                            <ShopOutlined />
                            {branch.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Sản phẩm"
                      name="productId"
                      rules={[
                        { required: true, message: 'Vui lòng chọn sản phẩm' },
                      ]}
                    >
                      <Select
                        placeholder="Chọn sản phẩm"
                        onChange={handleProductChange}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {getFilteredInventories().map((inventory) => (
                          <Option
                            key={inventory.product._id}
                            value={inventory.product._id}
                          >
                            <Space>
                              <ProductOutlined />
                              {inventory.product.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Biến thể"
                      name="variantId"
                      rules={[
                        { required: true, message: 'Vui lòng chọn biến thể' },
                      ]}
                    >
                      <Select
                        placeholder="Chọn biến thể"
                        size="large"
                        disabled={!selectedInventory}
                      >
                        {selectedInventory?.variants
                          ?.filter((v) => !v.isDeleted && v.stock > 0)
                          .map((variant) => (
                            <Option
                              key={variant.variantId._id}
                              value={variant.variantId._id}
                            >
                              <div>
                                <Tooltip
                                  title={`${variant.variantId.name} - Tồn kho: ${variant.stock}`}
                                >
                                  <span>{variant.variantId.name}</span>
                                </Tooltip>
                              </div>
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng xuất"
                      name="quantity"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số lượng' },
                        {
                          type: 'number',
                          min: 1,
                          message: 'Số lượng phải lớn hơn 0',
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={
                          selectedInventory?.variants?.find(
                            (v) =>
                              v.variantId._id ===
                              form.getFieldValue('variantId'),
                          )?.stock
                        }
                        placeholder="Nhập số lượng"
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label=" ">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddItem}
                        size="large"
                        block
                      >
                        Thêm vào danh sách
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <InboundSummary
            inboundItems={outboundItems}
            totalQuantity={totalQuantity}
            totalValue={totalValue}
            handleSubmitInbound={handleSubmitOutbound}
            loading={loading}
            title="Tổng quan phiếu xuất"
            submitText="Xác nhận xuất kho"
          />

          <Card
            title="Danh sách sản phẩm xuất"
            style={{
              marginTop: '16px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {outboundItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Row justify="space-between" align="middle">
                    <Col span={18}>
                      <Text strong style={{ fontSize: '13px' }}>
                        {item.productName}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.variantName} × {item.quantity}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        SKU: {item.variantSku}
                      </Text>
                      <br />
                      <Text type="success" style={{ fontSize: '10px' }}>
                        Tồn kho: {item.availableStock}
                      </Text>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: '12px', color: '#fa8c16' }}>
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

      {outboundItems.length > 0 && (
        <Card
          title="Chi tiết sản phẩm xuất kho"
          style={{
            marginTop: '24px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Table
            columns={itemColumns}
            dataSource={outboundItems}
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
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
      <Card
        title="Lịch sử xuất kho"
        style={{
          marginTop: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Table
          columns={historyColumns}
          dataSource={filteredOutbound}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <InboundDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        selectedoutboundDetail={selectedOutboundDetail}
        title="Chi tiết phiếu xuất"
      />

      <InboundConfirmModal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={confirmOutbound}
        loading={loading}
        previewData={previewData}
        branches={branches}
        title="Xác nhận xuất kho"
        confirmText="Xác nhận xuất kho"
      />
    </div>
  );
};

export default WarehouseOutbound;
