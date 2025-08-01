import { formatCurrency } from '@/helpers';
import {
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  ShopOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  Modal,
  Button,
  Steps,
  Descriptions,
  Typography,
  Select,
  Table,
  Input,
  Divider,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Alert,
  message,
} from 'antd';
import { useEffect, useState } from 'react';

const OrderDetailsModal = ({
  visible,
  onCancel,
  order,
  onUpdate,
  onConfirmReturn,
  loading,
}) => {
  const [editableOrder, setEditableOrder] = useState(null);
  const { Text, Title } = Typography;
  const { Option } = Select;

  useEffect(() => {
    if (order) {
      setEditableOrder({ ...order });
    }
  }, [order]);

  if (!editableOrder) return null;

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

  const ALLOWED_NEXT_STATUSES = {
    PENDING: [
      { value: 'PROCESSING', label: 'Đang xử lý' },
      { value: 'CANCELLED', label: 'Đã hủy' },
      { value: 'CONFIRMED', label: 'Đã xác nhận' },
    ],
    PROCESSING: [
      { value: 'CONFIRMED', label: 'Đã xác nhận' },
      { value: 'CANCELLED', label: 'Đã hủy' },
    ],
    CONFIRMED: [{ value: 'SHIPPING', label: 'Đang giao hàng' }],
    SHIPPING: [{ value: 'DELIVERED', label: 'Đã giao hàng' }],
    DELIVERED: [],
    CANCELLED: [],
    RETURNED: [],
  };

  const PAYMENT_METHOD_LABELS = {
    cash: 'Thanh toán tiền mặt',
    momo: 'Thanh toán qua MoMo',
    bank_transfer: 'Thanh toán qua chuyển khoản',
    cod: 'Thanh toán khi nhận hàng',
  };

  const getStatusSteps = (status) => {
    const steps = [
      { title: 'Tạo đơn hàng', icon: <UserOutlined /> },
      { title: 'Xử lý đơn hàng', icon: <ExclamationCircleOutlined /> },
      { title: 'Xác nhận đơn hàng', icon: <CheckCircleOutlined /> },
      { title: 'Vận chuyển', icon: <EnvironmentOutlined /> },
      { title: 'Đã nhận', icon: <CheckCircleOutlined /> },
    ];

    let current;
    let status_type = 'process';

    switch (status) {
      case 'PENDING':
        current = 0;
        break;
      case 'PROCESSING':
        current = 1;
        break;
      case 'CONFIRMED':
        current = 2;
        break;
      case 'SHIPPING':
        current = 3;
        break;
      case 'DELIVERED':
        current = 4;
        break;
      case 'CANCELLED':
        current = 1;
        status_type = 'error';
        break;
      case 'RETURNED':
        current = 3;
        status_type = 'error';
        break;
      default:
        current = 0;
    }

    return { steps, current, status: status_type };
  };

  const availableStatusOptions = STATUS_OPTIONS.filter((option) =>
    ALLOWED_NEXT_STATUSES[editableOrder.status]?.some(
      (allowed) => allowed.value === option.value,
    ),
  );

  const getStatusColor = (status) => {
    return (
      STATUS_OPTIONS.find((option) => option.value === status)?.color ||
      'default'
    );
  };

  const handleSave = () => {
    onUpdate(editableOrder._id, {
      status: editableOrder.status,
      paymentStatus: editableOrder.paymentStatus,
      paymentMethod: editableOrder.paymentMethod,
    });
    message.success('Cập nhật đơn hàng thành công!');
    onCancel();
  };

  const stepInfo = getStatusSteps(editableOrder.status);
console.log(editableOrder);
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <PackageOutlined style={{ color: '#1890ff', fontSize: '20px' }} /> */}
          <span>Chi tiết đơn hàng #{editableOrder._id.slice(-8)}</span>
          <Tag
            color={getStatusColor(editableOrder.status)}
            className="p-5! rounded-2xl!"
          >
            {
              STATUS_OPTIONS.find((s) => s.value === editableOrder.status)
                ?.label
            }
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Đóng
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
          size="large"
        >
          Lưu thay đổi
        </Button>,
      ]}
      width={1100}
      style={{ top: 10 }}
    >
      <div style={{ maxHeight: '100vh' }}>
        <Card style={{ marginBottom: 20, backgroundColor: '#fafafa' }}>
          <Steps
            current={stepInfo.current}
            status={stepInfo.status}
            items={stepInfo.steps}
            size="small"
          />
        </Card>

        {editableOrder.isReturned &&
          editableOrder.returnStatus === 'requested' && (
            <Alert
              message="Yêu cầu trả hàng"
              description={
                <div>
                  <p>
                    <strong>Lý do:</strong>{' '}
                    {editableOrder.returnReason || 'Khách hàng không ghi lý do'}
                  </p>
                  <div style={{ marginTop: 10 }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onConfirmReturn('approved')}
                        loading={loading}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => onConfirmReturn('rejected')}
                        loading={loading}
                      >
                        Từ chối
                      </Button>
                    </Space>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 10 }}
            />
          )}

        <Row gutter={[10, 10]}>
          {/* Order Information */}
          <Col span={24}>
            <Card title="Thông tin đơn hàng" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã đơn hàng" span={2}>
                  <Text
                    code
                    copyable={{ text: editableOrder._id }}
                    style={{ fontSize: '14px' }}
                  >
                    {editableOrder._id}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Ngày tạo
                    </>
                  }
                >
                  {new Date(editableOrder.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Cập nhật lần cuối
                    </>
                  }
                >
                  {new Date(editableOrder.updatedAt).toLocaleString('vi-VN')}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <>
                      <ShopOutlined /> Chi nhánh
                    </>
                  }
                >
                  {editableOrder.items
                    ?.map((item) => item.branch?.name)
                    .join(', ') || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <CreditCardOutlined /> Phương thức thanh toán
                    </>
                  }
                >
                  {PAYMENT_METHOD_LABELS[editableOrder.paymentMethod] ||
                    editableOrder.paymentMethod}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Customer Information */}
          <Col span={12}>
            <Card
              title={
                <>
                  <UserOutlined /> Thông tin khách hàng
                </>
              }
              size="small"
              className="h-full!"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Người mua">
                  <div style={{ fontWeight: 500 }}>
                    {editableOrder.buyer?.name || 'Không có'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Text copyable>
                    <PhoneOutlined /> {editableOrder.buyer?.phone || 'Không có'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Recipient Information */}
          <Col span={12}>
            <Card
              title={
                <>
                  <EnvironmentOutlined /> Thông tin người nhận
                </>
              }
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Người nhận">
                  <div style={{ fontWeight: 500 }}>
                    {editableOrder.recipient?.name || 'Không có'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Text copyable>
                    <PhoneOutlined />{' '}
                    {editableOrder.recipient?.phone || 'Không có'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="" span={2}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <Text style={{ fontWeight: 500, marginBottom: 4 }}>
                      Địa chỉ giao hàng
                    </Text>
                    <Input.TextArea
                      value={editableOrder.recipient?.address || ''}
                      disabled
                      rows={4}
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Status Management */}
          <Col span={24}>
            <Card title="Quản lý trạng thái" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Trạng thái đơn hàng:</Text>
                  </div>
                  <Select
                    value={editableOrder.status}
                    style={{ width: '100%' }}
                    size="large"
                    onChange={(value) =>
                      setEditableOrder({ ...editableOrder, status: value })
                    }
                  >
                    {availableStatusOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <Text strong>{option.label}</Text>
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Trạng thái thanh toán:</Text>
                  </div>
                  <Select
                    value={editableOrder.paymentStatus}
                    style={{ width: '100%' }}
                    size="large"
                    disabled
                    onChange={(value) => {
                      setEditableOrder({
                        ...editableOrder,
                        paymentStatus: value,
                      });
                    }}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <Text strong>{option.label}</Text>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider
          orientation="left"
          style={{ fontSize: '16px', fontWeight: 600 }}
        >
          Sản phẩm đặt hàng
        </Divider>

        <Card>
          <Table
            dataSource={editableOrder.items}
            pagination={false}
            size="small"
            rowKey={(record, index) =>
              `${record.product?._id}-${record.variant?._id}-${index}`
            }
            columns={[
              {
                title: 'Sản phẩm',
                render: (_, item) => (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {item.product?.name || 'Không có tên'}
                    </div>
                    <Tag size="small" color="blue">
                      {item.variant?.name || 'Không có phân loại'}
                    </Tag>
                  </div>
                ),
                width: '40%',
              },
              {
                title: 'Số lượng',
                dataIndex: 'quantity',
                align: 'center',
                render: (quantity) => (
                  <Tag color="green" style={{ fontSize: '13px' }}>
                    {quantity}
                  </Tag>
                ),
              },
              {
                title: 'Đơn giá',
                dataIndex: 'price',
                render: (price) => (
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(price)}
                  </Text>
                ),
                align: 'right',
              },
              {
                title: 'Thành tiền',
                render: (_, item) => (
                  <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                    {formatCurrency((item.price || 0) * (item.quantity || 0))}
                  </Text>
                ),
                align: 'right',
              },
            ]}
          />

          <div
            style={{
              marginTop: 20,
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'right',
            }}
          >
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              Tổng cộng: {formatCurrency(editableOrder.totalPrice || 0)}
            </Title>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
