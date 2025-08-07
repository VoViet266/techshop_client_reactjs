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
  Tooltip,
  Badge,
  Popconfirm,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
  ExportOutlined,
  InboxOutlined,
  BgColorsOutlined,
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
import { hasPermission } from '@/helpers';
import { Actions, Subjects } from '@/constants/permissions';

const { Text, Title } = Typography;
const { Option } = Select;

const WarehouseOutbound = () => {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    branch: '',
    searchText: '',
    dateRange: null,
  });
  const { message, notification, permissions } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [outboundItems, setOutboundItems] = useState([]);
  const [outboundHistory, setOutboundHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedOutboundDetail, setSelectedOutboundDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const { RangePicker } = DatePicker;

  const fetchInventories = async () => {
    try {
      const response = await callFetchInventories();
      setInventories(response.data.data);
    } catch (err) {
      console.error('Error fetching inventories:', err);
      notification.error({
        message: 'Lỗi tải dữ liệu kho',
        description: `Lỗi: ${err.response?.data?.message || err.message}`,
        duration: 4.5,
      });
    }
  };

  useEffect(() => {
    document.title = 'Xuất kho';
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      notification.error({
        message: 'Lỗi tải dữ liệu chi nhánh',
        description: `Lỗi: ${err.response?.data?.message || err.message}`,
        duration: 4.5,
      });
    }
  };

  const fetchOutboundHistory = async () => {
    try {
      const response = await callFetchOutboundHistory();
      setOutboundHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching outbound history:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu lịch sử xuất kho',
        description: `Lỗi: ${error.response?.data?.message || error.message}`,
        duration: 4.5,
      });
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
      notification.error({
        message: 'Lỗi tải dữ liệu chi tiết phiếu xuất',
        description: `Lỗi: ${error.response?.data?.message || error.message}`,
        duration: 4.5,
      });
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

  // Lấy danh sách inventory theo chi nhánh đã chọn
  const getFilteredInventories = () => {
    if (!selectedBranch) return [];
    return inventories.filter((inv) => inv.branch._id === selectedBranch);
  };

  // Xử lý khi thay đổi chi nhánh
  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setSelectedProduct(null);
    setSelectedInventory(null);
    setSelectedVariant(null);
    form.setFieldsValue({
      productId: undefined,
      variantId: undefined,
      variantColor: undefined,
    });
  };

  // Xử lý khi thay đổi sản phẩm
  const handleProductChange = (productId) => {
    const inventory = getFilteredInventories().find(
      (inv) => inv.product._id === productId,
    );
    setSelectedInventory(inventory);
    setSelectedProduct(inventory?.product);
    setSelectedVariant(null);
    form.setFieldsValue({
      variantId: undefined,
      variantColor: undefined,
    });
  };

  // Xử lý khi thay đổi variant
  const handleVariantChange = (variantId) => {
    if (!selectedInventory) return;

    // Tìm variant info từ danh sách variants
    const variantInfo = selectedInventory.variants.find(
      (v) => v.variantId._id === variantId,
    );

    setSelectedVariant(variantInfo);
    form.setFieldsValue({
      variantColor: undefined,
    });
  };

  // Lấy danh sách màu có sẵn cho variant đã chọn
  const getAvailableColors = () => {
    if (!selectedInventory || !selectedVariant) return [];

    return selectedInventory.variants
      .filter(
        (v) =>
          v.variantId._id === selectedVariant.variantId._id && v.variantColor,
      )
      .map((v) => ({
        color: v.variantColor,
        stock: v.stock,
        cost: v.cost || 0,
      }));
  };
  console.log(getAvailableColors());

  // Lấy thông tin chi tiết của variant với màu cụ thể
  const getVariantColorInfo = (variantId, color) => {
    if (!selectedInventory) return null;
    return selectedInventory.variants.find(
      (v) => v.variantId._id === variantId && v.variantColor === color,
    );
  };

  // Kiểm tra tồn kho
  const checkStockAvailability = (variantId, color, requestedQuantity) => {
    const variantInfo = getVariantColorInfo(variantId, color);
    if (!variantInfo) return false;
    return variantInfo.stock >= requestedQuantity;
  };

  // Thêm sản phẩm vào danh sách xuất kho
  const handleAddItem = () => {
    form
      .validateFields([
        'branchId',
        'productId',
        'variantId',
        'variantColor',
        'quantity',
      ])
      .then((values) => {
        const variantInfo = getVariantColorInfo(
          values.variantId,
          values.variantColor,
        );

        if (!variantInfo) {
          notification.error({
            message: 'Không tìm thấy sản phẩm với biến thể và màu này',
            duration: 4.5,
          });
          return;
        }

        if (
          !checkStockAvailability(
            values.variantId,
            values.variantColor,
            values.quantity,
          )
        ) {
          notification.warning({
            message: `Số lượng vượt quá tồn kho`,
            description: `Tồn kho hiện tại: ${variantInfo.stock}, số lượng yêu cầu: ${values.quantity}`,
            duration: 4.5,
          });
          return;
        }

        // Kiểm tra sản phẩm đã tồn tại trong danh sách chưa
        const existingItemIndex = outboundItems.findIndex(
          (item) =>
            item.productId === values.productId &&
            item.variantId === values.variantId &&
            item.variantColor === values.variantColor,
        );

        if (existingItemIndex >= 0) {
          // Nếu đã tồn tại, cập nhật số lượng
          const existingItem = outboundItems[existingItemIndex];
          const totalQuantity = existingItem.quantity + values.quantity;

          if (
            !checkStockAvailability(
              values.variantId,
              values.variantColor,
              totalQuantity,
            )
          ) {
            notification.warning({
              message: `Tổng số lượng vượt quá tồn kho`,
              description: `Tồn kho hiện tại: ${variantInfo.stock}, tổng số lượng: ${totalQuantity}`,
              duration: 4.5,
            });
            return;
          }

          const newItems = [...outboundItems];
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: totalQuantity,
            total: totalQuantity * existingItem.cost,
          };
          setOutboundItems(newItems);
          message.success('Đã cập nhật số lượng sản phẩm');
        } else {
          // Thêm sản phẩm mới
          const newItem = {
            id: Date.now(),
            productId: values.productId,
            branchId: values.branchId,
            productName: selectedProduct.name,
            productCode: selectedProduct.code,
            variantName: selectedVariant.variantId.name,
            variantId: values.variantId,
            variantColor: values.variantColor,
            variantSku: selectedVariant.variantId.sku,
            quantity: values.quantity,
            cost: variantInfo.cost || 0,
            total: values.quantity * (variantInfo.cost || 0),
            availableStock: variantInfo.stock,
          };

          setOutboundItems([...outboundItems, newItem]);
          message.success('Đã thêm sản phẩm vào danh sách xuất kho');
        }

        // Reset form
        form.setFieldsValue({
          productId: undefined,
          variantId: undefined,
          variantColor: undefined,
          quantity: undefined,
        });
        setSelectedProduct(null);
        setSelectedInventory(null);
        setSelectedVariant(null);
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
        notification.error({
          message: 'Vui lòng kiểm tra lại thông tin',
          description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          duration: 4.5,
        });
      });
  };

  // Xóa sản phẩm khỏi danh sách
  const handleRemoveItem = (id) => {
    setOutboundItems(outboundItems.filter((item) => item.id !== id));
    message.success('Đã xóa sản phẩm khỏi danh sách');
  };

  // Cập nhật số lượng
  const handleUpdateQuantity = (id, quantity) => {
    const item = outboundItems.find((i) => i.id === id);
    if (!item) return;

    if (!checkStockAvailability(item.variantId, item.variantColor, quantity)) {
      notification.warning({
        message: `Số lượng vượt quá tồn kho`,
        description: `Tồn kho hiện tại: ${item.availableStock}, số lượng yêu cầu: ${quantity}`,
        duration: 4.5,
      });
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

  // Cập nhật giá vốn
  const handleUpdateCost = (id, cost) => {
    setOutboundItems(
      outboundItems.map((item) =>
        item.id === id ? { ...item, cost, total: item.quantity * cost } : item,
      ),
    );
  };

  // Lọc lịch sử xuất kho
  const filteredOutbound = outboundHistory.filter((outbound) => {
    let isMatch = true;

    if (filters.branch) {
      isMatch = isMatch && outbound.branchId._id === filters.branch;
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
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

  // Xử lý submit xuất kho
  const handleSubmitOutbound = () => {
    form
      .validateFields(['branchId'])
      .then((values) => {
        if (outboundItems.length === 0) {
          notification.warning({
            message: 'Vui lòng thêm sản phẩm vào danh sách xuất kho',
          });
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

  // Xác nhận xuất kho
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
          variantColor: item.variantColor,
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
      setSelectedVariant(null);
      setIsModalVisible(false);
      await Promise.all([fetchInventories(), fetchOutboundHistory()]);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      notification.error({
        message: 'Lỗi xảy ra khi xuất kho',
        description: `Lỗi: ${error.response?.data?.message || error.message}`,
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột bảng chi tiết sản phẩm
  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 250,
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
      title: 'Biến thể & Màu',
      key: 'variant',
      width: 200,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.variantName}</Tag>
          <br />
          <Tag
            color="orange"
            icon={<BgColorsOutlined />}
            style={{ marginTop: '4px' }}
          >
            {record.variantColor}
          </Tag>
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

  // Cấu hình cột bảng lịch sử xuất kho
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
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          background: '#fff',
          padding: '24px 32px',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <Space align="center" size="large">
          <Avatar size={48} icon={<InboxOutlined />} />
          <div>
            <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
              Quản lý xuất kho
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Tạo phiếu xuất kho và quản lý lịch sử xuất hàng
            </Text>
          </div>
        </Space>
      </div>

      <Row gutter={[10, 10]}>
        {/* Form tạo phiếu xuất kho */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space className="py-10! ">
                <ExportOutlined />
                <Text strong>Tạo phiếu xuất kho</Text>
              </Space>
            }
            className="h-full!"
          >
            <Form form={form} layout="vertical">
              <Row gutter={[10, 10]}>
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
                      disabled={!selectedBranch}
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
                      onChange={handleVariantChange}
                    >
                      {selectedInventory?.variants
                        ?.filter((v, index, self) => {
                          // Lọc để chỉ hiển thị unique variants (không trùng lặp)
                          return (
                            v.stock > 0 &&
                            index ===
                              self.findIndex(
                                (variant) =>
                                  variant.variantId._id === v.variantId._id,
                              )
                          );
                        })
                        .map((variant) => (
                          <Option
                            key={variant.variantId._id}
                            value={variant.variantId._id}
                          >
                            <Tooltip title={variant.variantId.name}>
                              <span>{variant.variantId.name}</span>
                            </Tooltip>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Màu sắc"
                    name="variantColor"
                    rules={[
                      { required: true, message: 'Vui lòng chọn màu sắc' },
                    ]}
                  >
                    <Select
                      placeholder="Chọn màu sắc"
                      size="large"
                      disabled={!selectedVariant}
                    >
                      {getAvailableColors().map((colorInfo, index) => (
                        <Option key={index} value={colorInfo.color}>
                          <Space>
                            <BgColorsOutlined />
                            <span>{colorInfo.color}</span>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              (Tồn: {colorInfo.stock})
                            </Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

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
                        selectedVariant && form.getFieldValue('variantColor')
                          ? getVariantColorInfo(
                              selectedVariant.variantId._id,
                              form.getFieldValue('variantColor'),
                            )?.stock
                          : undefined
                      }
                      placeholder="Nhập số lượng"
                      style={{ width: '100%' }}
                      size="large"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault(); // chặn nhập nếu không phải số
                        }
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item>
                    <Button
                      type="primary"
                      disabled={
                        !hasPermission(
                          permissions,
                          Subjects.StockMovement,
                          Actions.Create,
                        )
                      }
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
            </Form>
          </Card>
        </Col>

        {/* Tóm tắt và danh sách sản phẩm */}
        <Col xs={24} lg={10}>
          <InboundSummary
            inboundItems={outboundItems}
            totalQuantity={totalQuantity}
            totalValue={totalValue}
            handleSubmitInbound={handleSubmitOutbound}
          />

          <Card
            title={
              <Space>
                <Text strong>Danh sách sản phẩm</Text>
                <Text type="secondary">({outboundItems.length})</Text>
              </Space>
            }
            style={{ marginTop: '16px' }}
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {outboundItems.length === 0 ? (
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
                outboundItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <Row justify="space-between" align="top">
                      <Col span={16}>
                        <Text
                          strong
                          style={{ fontSize: '14px', color: '#2c3e50' }}
                        >
                          {item.productName}
                        </Text>
                        <br />
                        <Space style={{ marginTop: '4px' }}>
                          <Tag color="blue" size="small">
                            {item.variantName}
                          </Tag>
                          <Tag
                            color="orange"
                            size="small"
                            icon={<BgColorsOutlined />}
                          >
                            {item.variantColor}
                          </Tag>
                        </Space>
                        <br />
                        <Text
                          type="secondary"
                          style={{ fontSize: '12px', marginTop: '4px' }}
                        >
                          SKU: {item.variantSku || 'N/A'} | Số lượng:{' '}
                          {item.quantity}
                        </Text>
                        <br />
                        <Text type="success" style={{ fontSize: '11px' }}>
                          Tồn kho: {item.availableStock}
                        </Text>
                      </Col>
                      <Col span={8} style={{ textAlign: 'right' }}>
                        <Text
                          strong
                          style={{ fontSize: '14px', color: '#fa8c16' }}
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
                          style={{ marginTop: '8px' }}
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

      {/* Bảng chi tiết sản phẩm xuất kho */}
      {outboundItems.length > 0 && (
        <Card
          title={
            <Space>
              <Text strong>Chi tiết sản phẩm xuất kho</Text>
            </Space>
          }
          style={{ marginTop: '24px' }}
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

      {/* Lịch sử xuất kho */}
      {hasPermission(permissions, Subjects.StockMovement, Actions.Read) && (
        <Card
          title={
            <Space>
              <Text strong>Lịch sử xuất kho</Text>
            </Space>
          }
          style={{ marginTop: '24px' }}
        >
          {/* Bộ lọc */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={8}>
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm, chi nhánh, người tạo..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
                allowClear
              />
            </Col>

            <Col span={6}>
              <Select
                placeholder="Chọn chi nhánh"
                style={{ width: '100%' }}
                value={filters.branch}
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

            <Col span={7}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={(dates) =>
                  setFilters({ ...filters, dateRange: dates })
                }
                format="DD/MM/YYYY"
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
                title="Làm mới bộ lọc"
              >
                Reset
              </Button>
            </Col>
          </Row>

          {/* Bảng lịch sử */}
          <Table
            columns={historyColumns}
            dataSource={filteredOutbound}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} bản ghi`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      )}

      {/* Modal và Drawer */}
      <InboundDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        selectedInboundDetail={selectedOutboundDetail}
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
