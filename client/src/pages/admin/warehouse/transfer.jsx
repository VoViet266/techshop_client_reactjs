import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Card,
  Popconfirm,
  Steps,
  Descriptions,
  Divider,
  Row,
  Col,
  Typography,
  Badge,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ModalSearchProduct from '@/components/admin/warehouse/modalSearchProduct';
import { useAppContext } from '@/contexts';
import Branchs from '@/services/branches';
import Warehouse from '@/services/warehouse';
import Products from '@/services/products';
import Inventory from '@/services/inventories';
import { hasPermission } from '@/helpers';
import { Actions, Subjects } from '@/constants/permissions';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const WarehouseTransferManagement = () => {
  const [form] = Form.useForm();
  const [transfers, setTransfers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isProductSearchVisible, setIsProductSearchVisible] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { message, user, permissions } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [products, setProducts] = useState([]);
  const [fromWarehouse, setFromWarehouse] = useState(null);
  const [toWarehouse, setToWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [newStatus, setNewStatus] = useState(null);

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const fetchTransfers = async () => {
    try {
      const response = await Warehouse.transferInventory();
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await Branchs.getAll();
      setWarehouses(response.data.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await Inventory.getAll();
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await Products.getAll();
      setProducts(response.result || []);
      setFilteredProducts(response.result || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
    fetchProducts();
    fetchInventory();
  }, []);

  const handleAddTransfer = () => {
    setEditingTransfer(null);
    setItems([]);
    setSelectedProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTransfer = (transfer) => {
    setEditingTransfer(transfer);
    setItems(transfer.items);
    setSelectedProduct(null);
    form.setFieldsValue({
      fromWarehouse: transfer.fromWarehouse,
      toWarehouse: transfer.toWarehouse,
      note: transfer.note,
    });
    setIsModalVisible(true);
  };

  const handleViewTransfer = (transfer) => {
    setViewingTransfer(transfer);
    setNewStatus(transfer.status); // Set initial status
    setIsViewModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!viewingTransfer || !newStatus) {
      message.error('Vui lòng chọn trạng thái');
      return;
    }

    setStatusLoading(true);

    try {
      const normalizedItems = viewingTransfer.items.map((item) => ({
        productId: item.productId._id,
        variantId: item.variantId._id,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const updateData = {
        status: newStatus,
        approvedBy: user.name,
        approvedDate: dayjs().format('YYYY-MM-DD'),
        rejectNote: newStatus === 'rejected' ? rejectNote : null,
        items: normalizedItems,
        fromBranchId: viewingTransfer.fromBranchId._id,
        toBranchId: viewingTransfer.toBranchId._id,
      };
      await Warehouse.updateTransfer(viewingTransfer._id, updateData, user);
      setTransfers(
        transfers.map((t) =>
          t._id === viewingTransfer._id ? { ...t, ...updateData } : t,
        ),
      );
      setViewingTransfer({
        ...viewingTransfer,
        status: updateData.status,
        approvedBy: updateData.approvedBy,
        approvedDate: updateData.approvedDate,
        rejectNote: updateData.rejectNote,
      });

      message.success('Cập nhật trạng thái thành công');
      fetchTransfers();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Cập nhật trạng thái thất bại');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePrint = (transfer) => {
    const printContent = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center; color: #1890ff;">PHIẾU CHUYỂN KHO</h2>
      <div style="margin: 20px 0;">
        <p><strong>Mã phiếu:</strong> ${transfer._id}</p>
        <p><strong>Từ kho:</strong> ${transfer.fromBranchId.name}</p>
        <p><strong>Đến kho:</strong> ${transfer.toBranchId.name}</p>
        <p><strong>Ngày tạo:</strong> ${dayjs(transfer.createdAt).format('DD/MM/YYYY')}</p>
        <p><strong>Người tạo:</strong> ${transfer.createdBy.name}</p>
        <p><strong>Ghi chú:</strong> ${transfer.note || ''}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ddd; padding: 8px;">STT</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Tên sản phẩm</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Số lượng</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Đơn vị</th>
          </tr>
        </thead>
        <tbody>
          ${transfer.items
            .map(
              (item, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.productId.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.unit || 'N/A'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div>
          <p><strong>Người giao hàng</strong></p>
          <p style="margin-top: 40px;">........................</p>
        </div>
        <div>
          <p><strong>Người nhận hàng</strong></p>
          <p style="margin-top: 40px;">........................</p>
        </div>
      </div>
    </div>
  `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSubmit = async (values) => {
    if (items.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const newTransfer = {
        fromBranchId: values.fromWarehouse,
        toBranchId: values.toWarehouse,
        items: items,
        status: 'pending',
        note: values.note,
        totalItems: items.length,
      };

      if (editingTransfer) {
        // await Warehouse.updateTransfer(editingTransfer._id, newTransfer);
        // message.success('Cập nhật phiếu chuyển kho thành công');
      } else {
        await Warehouse.createTransfer(newTransfer);
        message.success('Tạo phiếu chuyển kho thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      setItems([]);
      setSelectedProduct(null);
      fetchTransfers();
    } catch (error) {
      console.error('Error submitting transfer:', error);
      message.error('Có lỗi xảy ra khi xử lý phiếu chuyển kho');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await form.validateFields([
        'productId',
        'variantId',
        'quantity',
      ]);

      if (!selectedProduct) {
        message.error('Vui lòng chọn sản phẩm');
        return;
      }

      const selectedVariant = selectedProduct.variants.find(
        (v) => v.variantId._id === values.variantId,
      );

      const newItem = {
        productId: values.productId,
        variantId: values.variantId,
        name: `${selectedProduct.product.name} - ${selectedVariant.variantId.name}`,
        quantity: values.quantity,
        unit: values.unit || selectedVariant.unit || 'cái',
      };

      setItems([...items, newItem]);

      form.setFieldsValue({
        productId: undefined,
        variantId: undefined,
        quantity: undefined,
        unit: undefined,
      });
      setSelectedProduct(null);

      message.success('Thêm sản phẩm thành công');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    form.setFieldsValue({
      productId: product._id,
      variantId: undefined,
    });
    setIsProductSearchVisible(false);
  };

  const getStatusSteps = (status) => {
    const steps = [
      { title: 'Tạo phiếu' },
      { title: 'Gửi yêu cầu' },
      { title: 'Duyệt phiếu' },
      { title: 'Vận chuyển' },
      { title: 'Đã nhận' },
    ];

    let current = 0;
    switch (status) {
      case 'pending':
        current = 1;
        break;
      case 'approved':
        current = 2;
        break;
      case 'in_transit':
        current = 3;
        break;
      case 'received':
        current = 4;
        break;
      default:
        break;
    }

    return { steps, current };
  };

  const columns = [
    {
      title: 'Từ kho',
      dataIndex: 'fromBranchId',
      key: 'fromBranchId',
      render: (text) => <Text strong>{text.name}</Text>,
    },
    {
      title: 'Đến kho',
      dataIndex: 'toBranchId',
      key: 'toBranchId',
      render: (text) => <Text strong>{text.name}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
      render: (text) => <Badge count={text} showZero color="#52c41a" />,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag
          color={statusConfig[status].color}
          className="flex! flex-row! gap-5!"
        >
          <div>{statusConfig[status].icon}</div>
          <div>{statusConfig[status].text}</div>
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => <Text>{dayjs(text).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
      render: (text) => <Text>{text.name}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              handleViewTransfer(record);
            }}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  const allowedNextStatuses = {
    pending: ['pending', 'approved', 'rejected'],
    approved: ['in_transit'],
    in_transit: ['received'],
    received: [],
    rejected: [],
  };

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'in_transit', label: 'Đang được vận chuyển' },
    { value: 'received', label: 'Đã nhận hàng' },
    { value: 'approved', label: 'Phê duyệt' },
    { value: 'rejected', label: 'Từ chối' },
  ];
  const statusConfig = {
    pending: {
      color: 'orange',
      text: 'Chờ duyệt',
      icon: <ClockCircleOutlined />,
    },
    in_transit: {
      color: 'blue',
      text: 'Đang vận chuyển',
      icon: <CarOutlined />,
    },
    approved: {
      color: 'blue',
      text: 'Đã duyệt',
      icon: <CheckCircleOutlined />,
    },
    received: {
      color: 'green',
      text: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
    rejected: { color: 'red', text: 'Từ chối', icon: <CloseCircleOutlined /> },
  };
  const availableOptions = statusOptions.filter((option) =>
    allowedNextStatuses[viewingTransfer?.status]?.includes(option.value),
  );

  const productInInventory = inventory.filter(
    (product) => product.branch?._id.toString() === fromWarehouse?.toString(),
  );

  return (
    <div className="p-6 bg-gray-50 ">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0! ">
            <SwapOutlined className="mr-4!" />
            Quản lý chuyển kho hàng hóa
          </Title>

          <Button
            type="primary"
            disabled={
              !hasPermission(permissions, Subjects.Transfer, Actions.Create)
            }
            icon={<PlusOutlined />}
            onClick={handleAddTransfer}
            size="large"
          >
            Tạo phiếu chuyển
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phiếu`,
          }}
        />
      </Card>

      <Modal
        title={
          editingTransfer ? 'Sửa phiếu chuyển kho' : 'Tạo phiếu chuyển kho'
        }
        open={isModalVisible}
        onCancel={() => (
          setIsModalVisible(false),
          form.resetFields(),
          setItems([]),
          setSelectedProduct(null),
          setFromWarehouse(null),
          setToWarehouse(null)
        )}
        footer={
          <>
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              onClick={() => form.submit()}
            >
              {editingTransfer ? 'Cập nhật' : 'Tạo phiếu'}
            </Button>
          </>
        }
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Từ kho"
                name="fromWarehouse"
                rules={[{ required: true, message: 'Vui lòng chọn kho xuất' }]}
              >
                <Select
                  placeholder="Chọn kho xuất"
                  onChange={(value) => setFromWarehouse(value)}
                >
                  {warehouses.map((warehouse) => (
                    <Option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đến kho"
                name="toWarehouse"
                rules={[{ required: true, message: 'Vui lòng chọn kho nhập' }]}
              >
                <Select
                  placeholder="Chọn kho nhập"
                  onChange={(value) => setToWarehouse(value)}
                >
                  {warehouses
                    .filter((w) => w._id !== fromWarehouse)
                    .map((warehouse) => (
                      <Option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Thêm sản phẩm</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sản phẩm" name="productId">
                {/* <Form.Item name="productId" style={{ display: 'none' }}>
                  <Input type="hidden" />
                </Form.Item>
                <Input
                  placeholder="Click để tìm kiếm sản phẩm"
                  readOnly
                  onClick={() => setIsProductSearchVisible(true)}
                  value={selectedProduct?.name || ''}
                  suffix={<SearchOutlined />}
                  style={{ cursor: 'pointer' }}
                /> */}
                <Select
                  showSearch
                  placeholder="Chọn sản phẩm"
                  disabled={!fromWarehouse}
                  onChange={(value) =>
                    setSelectedProduct(
                      inventory.find((p) => p.product._id === value),
                    )
                  }
                >
                  {productInInventory.map((p) => (
                    <Option key={p.product._id} value={p.product._id}>
                      {p.product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="variantId" label="Biến thể">
                <Select placeholder="Chọn biến thể" disabled={!selectedProduct}>
                  {selectedProduct?.variants?.map((variant) => (
                    <Option
                      key={variant.variantId._id}
                      value={variant.variantId._id}
                    >
                      {variant.variantId.name} - Tồn {variant.stock}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[
                  {
                    type: 'number',
                    min: 1,
                    message: 'Số lượng phải lớn hơn 0',
                  },
                ]}
              >
                <InputNumber
                  placeholder="Nhập số lượng"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị">
                <Input placeholder="Nhập đơn vị" />
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: 'flex', alignItems: 'end' }}>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  style={{ width: '100%' }}
                >
                  Thêm
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Danh sách sản phẩm đã chọn</Divider>

          {items.length > 0 ? (
            <Table
              dataSource={items}
              rowKey={(record, index) => index}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'STT',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'Tên sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 100,
                },
                {
                  title: 'Đơn vị',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: 100,
                  render: (text) => text || 'N/A',
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  width: 100,
                  render: (_, __, index) => (
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(index)}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có sản phẩm nào được thêm
            </div>
          )}

          <Divider />

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết phiếu chuyển kho"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
          viewingTransfer?.status === 'approved' ||
          viewingTransfer?.status === 'completed' ? (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(viewingTransfer)}
            >
              In phiếu
            </Button>
          ) : null,
        ]}
        width={800}
      >
        {viewingTransfer && (
          <div>
            <Steps
              current={getStatusSteps(viewingTransfer.status).current}
              items={getStatusSteps(viewingTransfer.status).steps}
              className="mb-10!"
            />

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={statusConfig[viewingTransfer.status].color}
                  className="flex! flex-row! gap-5!  w-[100px]!"
                >
                  <div>{statusConfig[viewingTransfer.status].icon}</div>
                  <div>{statusConfig[viewingTransfer.status].text}</div>
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Từ kho">
                {viewingTransfer.fromBranchId.name}
              </Descriptions.Item>
              <Descriptions.Item label="Đến kho">
                {viewingTransfer.toBranchId.name}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(viewingTransfer.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {viewingTransfer.createdBy.name}
              </Descriptions.Item>
              {viewingTransfer.approvedBy && (
                <>
                  <Descriptions.Item label="Ngày duyệt">
                    {viewingTransfer.approvedDate}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người duyệt">
                    {viewingTransfer.approvedBy}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Ghi chú" span={7}>
                {viewingTransfer.note || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Cập nhật trạng thái</Divider>
            <div className="mb-4">
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Text strong>Trạng thái hiện tại:</Text>
                </Col>
                <Col span={16}>
                  <Tag
                    color={statusConfig[viewingTransfer.status].color}
                    className="flex! flex-row! gap-5! w-[100px]!"
                  >
                    <div>{statusConfig[viewingTransfer.status].icon}</div>
                    <div>{statusConfig[viewingTransfer.status].text}</div>
                  </Tag>
                </Col>
              </Row>

              <Row gutter={16} align="middle" className="mt-3">
                <Col span={8}>
                  <Text strong>Cập nhật trạng thái:</Text>
                </Col>
                <Col span={10}>
                  <Select
                    style={{ width: '100%' }}
                    value={newStatus}
                    onChange={(value) => setNewStatus(value)}
                    placeholder="Chọn trạng thái mới"
                  >
                    {availableOptions.map((option) => (
                      <Option
                        disabled={option.value === 'pending'}
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={statusLoading}
                    onClick={handleUpdateStatus}
                    disabled={
                      newStatus === viewingTransfer.status ||
                      !hasPermission(
                        permissions,
                        Subjects.Transfer,
                        Actions.Update,
                      )
                    }
                  >
                    Cập nhật
                  </Button>
                </Col>
              </Row>
              {newStatus === 'rejected' ? (
                <Row gutter={10} className="mt-3">
                  <Col span={8}>
                    <Text strong>Lý do từ chối:</Text>
                  </Col>
                  <Col span={10}>
                    <Input.TextArea
                      className="w-full!"
                      rows={3}
                      placeholder="Nhập lý do từ chối"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                    {!rejectNote.trim() && (
                      <Text type="danger">Vui lòng nhập lý do từ chối</Text>
                    )}
                  </Col>
                </Row>
              ) : null}

              {viewingTransfer.status === 'rejected' &&
              viewingTransfer.rejectNote ? (
                <Row gutter={16} className="mt-3">
                  <Col span={8}>
                    <Text strong>Lý do từ chối:</Text>
                  </Col>
                  <Col span={16}>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <Text type="danger">{viewingTransfer.rejectNote}</Text>
                    </div>
                  </Col>
                </Row>
              ) : null}
            </div>

            <Divider>Danh sách sản phẩm</Divider>

            <Table
              dataSource={viewingTransfer.items}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'STT',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'Tên sản phẩm',
                  dataIndex: 'productId',
                  key: 'productId',
                  render: (productId) => productId.name,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 100,
                  align: 'center',
                },
                {
                  title: 'Đơn vị',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: 100,
                  align: 'center',
                  render: (text) => text || 'N/A',
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* <ModalSearchProduct
        productSearchVisible={isProductSearchVisible}
        setProductSearchVisible={setIsProductSearchVisible}
        handleSelectProduct={handleSelectProduct}
        products={products}
        filteredProducts={filteredProducts}
      /> */}
    </div>
  );
};

export default WarehouseTransferManagement;
