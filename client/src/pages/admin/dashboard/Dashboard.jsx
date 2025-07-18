import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  DatePicker,
  Spin,
  Alert,
  Typography,
  Divider,
} from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import dayjs from 'dayjs';

import axiosInstance from '@/services/apis';
import { formatCurrency } from '@/helpers';
import { TrendingDown, TrendingUp } from 'lucide-react';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Màu sắc tối ưu cho biểu đồ
const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

const Dashboard = () => {
  const [currentStats, setCurrentStats] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [productTopSelling, setProductTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API calls với đúng endpoints
  const fetchStats = async (period, date) => {
    const response = await axiosInstance(
      `/api/v1/dashboard/stats/${period}/current`,
    );
    return response.data.data;
  };

  const fetchStatsWithComparison = async (period, date) => {
    const dateParam = date ? `?date=${date.toISOString()}` : '';
    const response = await axiosInstance(
      `/api/v1/dashboard/stats/${period}${dateParam}`,
    );
    if (!response.ok) throw new Error('Failed to fetch comparison data');
    return response.json();
  };

  const fetchHistoricalData = async (period) => {
    const response = await axiosInstance.get(
      `/api/v1/dashboard/stats/${period}/historical?limit=30`,
    );
    return response.data.data;
  };

  // const fetchOverview = async (period, date) => {
  //   const dateParam = date ? `&date=${date.toISOString()}` : '';
  //   const response = await axiosInstance(
  //     `/api/v1/dashboard/overview?period=${period}${dateParam}`,
  //   );
  //   if (!response.ok) throw new Error('Failed to fetch overview');
  //   return response.json();
  // };

  // const fetchTopSellingProducts = async () => {
  //   const response = await axiosInstance.get(
  //     '/api/v1/dashboard/products/top-selling',
  //   );
  //   if (!response.ok) throw new Error('Failed to fetch top-selling products');
  //   return response.data.data;
  // };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const historical = await fetchHistoricalData(selectedPeriod);
        setHistoricalData(historical);
        const current = await fetchStats(selectedPeriod);
        setCurrentStats(current);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedPeriod]);

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  const getChangeIcon = (change) => {
    if (change > 0)
      return <TrendingUp style={{ color: '#52c41a', fontSize: '14px' }} />;
    if (change < 0)
      return <TrendingDown style={{ color: '#f5222d', fontSize: '14px' }} />;
    return null;
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#52c41a';
    if (change < 0) return '#f5222d';
    return '#8c8c8c';
  };

  // Prepare data for charts
  const prepareRevenueChartData = () => {
    return historicalData
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        date: dayjs(item.date).format(
          selectedPeriod === 'daily'
            ? 'DD/MM'
            : selectedPeriod === 'monthly'
              ? 'MM/YYYY'
              : 'YYYY',
        ),
        revenue: Math.round(item.totalRevenue / 1_000_000),
        orders: item.totalOrders,
      }));
  };

  const preparePaymentMethodData = () => {
    return (
      currentStats?.paymentMethods?.map((method) => ({
        name: method.method,
        value: method.amount,
        count: method.count,
        percentage: method.percentage,
      })) || []
    );
  };

  const topProductsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      align: 'right',
      render: (value) => <Text>{value?.toLocaleString()}</Text>,
    },
  ];

  const topViewCountColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'right',
      render: (value) => <Text>{value?.toLocaleString()}</Text>,
    },
  ];

  if (loading) {
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
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          backgroundColor: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#262626' }}>
            Dashboard
          </Title>
          <Text type="secondary">Tổng quan hoạt động kinh doanh</Text>
        </div>
        <Select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          style={{ width: 120 }}
          size="middle"
        >
          <Option value="daily">Hôm nay</Option>
          <Option value="weekly">Tuần này</Option>
          <Option value="monthly">Tháng này</Option>
          <Option value="yearly">Năm này</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text type="secondary">Tổng doanh thu</Text>}
              value={currentStats?.totalRevenue || 0}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{
                color: '#262626',
                fontSize: '24px',
                fontWeight: 600,
              }}
            />
            {comparisonData?.comparison && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getChangeIcon(comparisonData.comparison.revenueChange)}
                <Text
                  style={{
                    color: getChangeColor(
                      comparisonData.comparison.revenueChange,
                    ),
                    marginLeft: '4px',
                    fontSize: '12px',
                  }}
                >
                  {comparisonData.comparison.revenueChange.toFixed(1)}% so với
                  kỳ trước
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text type="secondary">Tổng đơn hàng</Text>}
              value={currentStats?.totalOrders || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{
                color: '#262626',
                fontSize: '24px',
                fontWeight: 600,
              }}
            />
            {comparisonData?.comparison && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getChangeIcon(comparisonData.comparison.ordersChange)}
                <Text
                  style={{
                    color: getChangeColor(
                      comparisonData.comparison.ordersChange,
                    ),
                    marginLeft: '4px',
                    fontSize: '12px',
                  }}
                >
                  {comparisonData.comparison.ordersChange.toFixed(1)}% so với kỳ
                  trước
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text type="secondary">Giá trị đơn hàng TB</Text>}
              value={currentStats?.averageOrderValue || 0}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
              valueStyle={{
                color: '#262626',
                fontSize: '24px',
                fontWeight: 600,
              }}
            />
            {comparisonData?.comparison && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getChangeIcon(comparisonData.comparison.aovChange)}
                <Text
                  style={{
                    color: getChangeColor(comparisonData.comparison.aovChange),
                    marginLeft: '4px',
                    fontSize: '12px',
                  }}
                >
                  {comparisonData.comparison.aovChange.toFixed(1)}% so với kỳ
                  trước
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text type="secondary">Tỷ lệ trả hàng</Text>}
              value={currentStats?.returnRate || 0}
              suffix="%"
              precision={1}
              prefix={<TrendingUp style={{ color: '#f5222d' }} />}
              valueStyle={{
                color: '#262626',
                fontSize: '24px',
                fontWeight: 600,
              }}
            />
            {comparisonData?.comparison && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getChangeIcon(comparisonData.comparison.returnRateChange)}
                <Text
                  style={{
                    color: getChangeColor(
                      comparisonData.comparison.returnRateChange,
                    ),
                    marginLeft: '4px',
                    fontSize: '12px',
                  }}
                >
                  {comparisonData.comparison.returnRateChange.toFixed(1)}% so
                  với kỳ trước
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ doanh thu và phương thức thanh toán */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LineChartOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                <Text strong>Biểu đồ doanh thu & đơn hàng</Text>
              </div>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={prepareRevenueChartData()}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#8c8c8c" fontSize={12} />
                <YAxis yAxisId="left" stroke="#8c8c8c" fontSize={12} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#8c8c8c"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(value * 1000000)
                      : value,
                    name === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  name="Doanh thu (triệu VND)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Số đơn hàng"
                  dot={{ fill: '#52c41a', strokeWidth: 2, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PieChartOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                <Text strong>Phương thức thanh toán</Text>
              </div>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={preparePaymentMethodData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
                  }
                >
                  {preparePaymentMethodData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bảng sản phẩm */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                <Text strong>Sản phẩm bán chạy</Text>
              </div>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Table
              dataSource={currentStats?.topSellingProducts || []}
              columns={topProductsColumns}
              pagination={false}
              size="middle"
              rowKey="productId"
              style={{
                '.ant-table-thead > tr > th': {
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #f0f0f0',
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                <Text strong>Sản phẩm được xem nhiều</Text>
              </div>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Table
              dataSource={currentStats?.topViewCountProducts || []}
              columns={topViewCountColumns}
              pagination={false}
              size="middle"
              rowKey="productId"
            />
          </Card>
        </Col>
      </Row>

      {/* Thông tin cập nhật */}
      {currentStats?.lastUpdated && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cập nhật lần cuối:{' '}
            {dayjs(currentStats.lastUpdated).format('DD/MM/YYYY HH:mm:ss')}
          </Text>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
