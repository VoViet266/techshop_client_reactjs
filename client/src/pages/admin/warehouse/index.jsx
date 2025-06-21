import React, { useState, useEffect } from 'react';
import {
  Table,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Badge,
  Empty,
  Spin,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShopOutlined,
  ProductOutlined,
  TeamOutlined,
  CalendarOutlined,
  StockOutlined,
  DollarOutlined,
  WarningOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { callFetchInventories } from '@/services/apis';
import useMessage from '@/hooks/useMessage';

const { Text, Title } = Typography;
const { Option } = Select;

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const { success, error, warning, contextHolder } = useMessage();
  const fetchInventory = async () => {
    try {
      const res = await callFetchInventories();
      setWarehouses(res.data.data);
      setFilteredData(res.data.data);
      success('Lấy danh sách tồn kho');
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  useEffect(() => {
    try {
      fetchInventory();
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let filtered = warehouses;

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.branch.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.createdBy.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter((item) => item.branch.name === selectedBranch);
    }

    setFilteredData(filtered);
  }, [searchText, selectedBranch, warehouses]);

  const branches = [...new Set(warehouses.map((item) => item.branch.name))];

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Hết hàng' };
    if (stock < 10) return { color: 'orange', text: 'Sắp hết' };
    if (stock < 50) return { color: 'blue', text: 'Bình thường' };
    return { color: 'green', text: 'Nhiều' };
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <Space>
          <Tooltip title={name}>
            <div
              style={{
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Chi nhánh',
      dataIndex: ['branch', 'name'],
      key: 'branch',
      width: 180,
      render: (name) => (
        <Space>
          <ShopOutlined style={{ color: '#52c41a' }} />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Biến thể',
      key: 'variantCount',
      width: 100,
      align: 'center',
      render: (_, record) => <Text> {record.variants?.length || 0}</Text>,
    },
    {
      title: 'Tổng tồn kho',
      key: 'totalStock',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const totalStock =
          record.variants?.reduce((sum, variant) => sum + variant.stock, 0) ||
          0;

        return (
          <Space>
            <Text> {totalStock}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
        </Space>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      width: 150,
      render: (name) => (
        <Space>
          <Text>{name}</Text>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const variantColumns = [
      {
        title: 'Tên biến thể',
        dataIndex: ['variantId', 'name'],
        key: 'variant',
        render: (variant) => (
          <Space>
            <Tag color="blue">{variant}</Tag>
          </Space>
        ),
      },
      {
        title: 'Số lượng tồn',
        dataIndex: 'stock',
        key: 'stock',
        align: 'center',
        render: (stock) => {
          const status = getStockStatus(stock);
          return (
            <Space>
              <StockOutlined style={{ color: status.color }} />
              <Tag color={status.color}>
                {stock} - {status.text}
              </Tag>
            </Space>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: 'cost',
        key: 'cost',
        align: 'right',
        render: (cost) => (
          <Space>
            <DollarOutlined style={{ color: '#fa8c16' }} />
            <Text strong style={{ color: '#fa8c16' }}>
              {cost ? cost.toLocaleString('vi-VN') + ' ₫' : '—'}
            </Text>
          </Space>
        ),
      },
    ];

    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
        }}
      >
        <Table
          columns={variantColumns}
          dataSource={record.variants}
          rowKey={(variant, index) => `${record._id}-${index}`}
          pagination={false}
          size="small"
          style={{ backgroundColor: 'white' }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Đang tải dữ liệu kho hàng...</Text>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        // backgroundColor: "#f5f5f5",
        minHeight: '100vh',
        borderRadius: '8px',
      }}
    >
      {contextHolder}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col
          xs={24}
          sm={12}
          md={8}
          style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)" }}
        >
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              prefix={<ProductOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng tồn kho"
              value={totalStock}
              prefix={<StockOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Sản phẩm cảnh báo"
              value={lowStockItems}
              prefix={<WarningOutlined style={{ color: "#fa541c" }} />}
              valueStyle={{ color: lowStockItems > 0 ? "#fa541c" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row> */}

      <Card
        style={{
          marginBottom: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm sản phẩm, chi nhánh, người tạo..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn chi nhánh"
              value={selectedBranch}
              onChange={setSelectedBranch}
            >
              <Option value="all">Tất cả chi nhánh</Option>
              {branches.map((branch) => (
                <Option key={branch} value={branch}>
                  {branch}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchInventory}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          minHeight: '90vh',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Title level={4}>Danh sách kho hàng</Title>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                icon={expanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                style={{
                  color: expanded ? '#1890ff' : '#8c8c8c',
                  transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)',
                }}
                onClick={(e) => onExpand(record, e)}
              />
            ),
          }}
          pagination={{
            pageSize: 10,
          }}
          bordered
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu kho hàng"
              />
            ),
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default WarehouseManagement;
