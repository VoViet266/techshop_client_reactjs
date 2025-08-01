import React, { useState, useEffect, useMemo } from 'react';
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
  Space,
  Tag,
  Progress,
  Avatar,
  Segmented,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
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
  ComposedChart,
} from 'recharts';
import dayjs from 'dayjs';

import axiosInstance from '@/services/apis';
import { formatCurrency } from '@/helpers';
import Branchs from '@/services/branches';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#84cc16', // Lime
];

const BRANCH_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#84cc16',
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#a855f7',
];

const Dashboard = () => {
  const [allStats, setAllStats] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    yearly: null,
  });
  const [allComparison, setAllComparison] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    yearly: null,
  });
  const [allHistorical, setAllHistorical] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
  });

  const [allBranchData, setAllBranchData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
  });

  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [branch, setBranch] = useState(null);
  const currentStats = allStats[selectedPeriod];
  const comparisonData = allComparison[selectedPeriod];
  const historicalData = allHistorical[selectedPeriod];
  const currentBranchData = allBranchData[selectedPeriod];

  const fetchStats = async (period) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/dashboard/stats/${period}/current`,
        { timeout: 3000 },
      );
      return response.data?.data || {};
    } catch (error) {
      console.error(`Error fetching ${period} stats:`, error);
      return null;
    }
  };

  const fetchStatsWithComparison = async (period, date) => {
    try {
      const dateParam = date ? `?date=${date.toISOString()}` : '';
      const response = await axiosInstance.get(
        `/api/v1/dashboard/stats/${period}${dateParam}`,
        { timeout: 10000 },
      );
      return response.data?.data || {};
    } catch (error) {
      console.error(`Error fetching ${period} comparison data:`, error);
      return null;
    }
  };

  const fetchHistoricalData = async (period) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/dashboard/stats/${period}/historical?limit=30`,
        { timeout: 15000 },
      );
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching ${period} historical data:`, error);
      return [];
    }
  };

  const fetchBranch = async () => {
    try {
      const response = await Branchs.getAll();
      setBranch(response.data.data);
    } catch (error) {
      console.error(`Error fetching branches:`, error);
      return [];
    }
  };

  useEffect(() => {
    fetchBranch();
    const loadAllDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const periods = ['daily', 'weekly', 'monthly', 'yearly'];

        const statsPromises = periods.map((period) => fetchStats(period));
        const comparisonPromises = periods.map((period) =>
          fetchStatsWithComparison(period, dateRange?.[0]),
        );
        const historicalPromises = periods.map((period) =>
          fetchHistoricalData(period),
        );

        const [statsResults, comparisonResults, historicalResults] =
          await Promise.all([
            Promise.all(statsPromises),
            Promise.all(comparisonPromises),
            Promise.all(historicalPromises),
          ]);

        const newAllStats = {};
        const newAllComparison = {};
        const newAllHistorical = {};
        const newAllBranchData = {};

        periods.forEach((period, index) => {
          newAllStats[period] = statsResults[index];
          newAllBranchData[period] = historicalResults[index];
          newAllComparison[period] = comparisonResults[index];
          newAllHistorical[period] = historicalResults[index];
        });

        setAllStats(newAllStats);
        setAllComparison(newAllComparison);
        setAllHistorical(newAllHistorical);
        setAllBranchData(newAllBranchData);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadAllDashboardData();
  }, [dateRange]);

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  const ChangeIndicator = ({ change, showIcon = true }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const color = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#6b7280';
    const Icon = isPositive
      ? ArrowUpOutlined
      : isNegative
        ? ArrowDownOutlined
        : MinusOutlined;

    return (
      <Space size={4} style={{ marginTop: 8 }}>
        {showIcon && <Icon style={{ color, fontSize: '12px' }} />}
        <Text style={{ color, fontSize: '12px', fontWeight: 500 }}>
          {Math.abs(change).toFixed(1)}%
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          vs kỳ trước
        </Text>
      </Space>
    );
  };

  const BranchOverview = () => {
    const [selectedBranch, setSelectedBranch] = useState(branch?.[0]?._id);
    const [selectedDate, setSelectedDate] = useState(null);

    const branchStats = currentBranchData || [];

    const filteredBranchStats = useMemo(() => {
      let data = Object.values(branchStats);
      data = data.filter((b) =>
        b?.branchOverview?.branchStats?.some(
          (bs) => bs.branchId === selectedBranch,
        ),
      );
      return data;
    }, [branchStats, selectedBranch, selectedDate]);

    const branchChartData = useMemo(() => {
      return filteredBranchStats?.flatMap((branch, index) => {
        const formattedDate = dayjs(branch.date).format(
          selectedPeriod === 'daily' || selectedPeriod === 'weekly'
            ? 'DD/MM'
            : selectedPeriod === 'monthly'
              ? 'MM/YYYY'
              : 'YYYY',
        );

        const branchData = branch.branchOverview?.branchStats.find(
          (bs) => bs.branchId === selectedBranch,
        );

        return {
          branchId: selectedBranch,
          branchName: branchData?.branchName,
          totalRevenueBranch: branchData?.totalRevenue,
          totalOrdersBranch: branchData?.totalOrders,
          date: formattedDate,
          color: BRANCH_COLORS[index % BRANCH_COLORS.length],
        };
      });
    }, [filteredBranchStats, selectedBranch, selectedPeriod]);

    const pieChartData = useMemo(() => {
      if (!filteredBranchStats) return [];

      const branchMap = {};
      filteredBranchStats.forEach((day) => {
        day.branchOverview?.branchStats.forEach((branch) => {
          const id = branch.branchId;
          if (!branchMap[id]) {
            branchMap[id] = {
              branchId: id,
              branchName: branch.branchName,
              totalRevenue: 0,
            };
          }
          branchMap[id].totalRevenue += branch.totalRevenue;
        });
      });

      return Object.values(branchMap);
    }, [filteredBranchStats]);

    if (!branchStats || branchStats.length === 0) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Chưa có dữ liệu chi nhánh
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '10px' }}>
        <Row gutter={[10, 10]}>
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: '12px',
                border: 'none',
              }}
              title={
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                    <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                      Doanh thu theo chi nhánh
                    </Text>
                  </div>
                  <Select
                    size="middle"
                    style={{
                      width: 280,
                      borderRadius: '8px',
                    }}
                    value={selectedBranch}
                    onChange={(value) => setSelectedBranch(value)}
                  >
                    {branch?.map((branch) => (
                      <Option key={branch._id} value={branch._id}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart
                  data={branchChartData?.length ? branchChartData : [{}]}
                  margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.6}
                  />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />

                  {/* Y bên trái */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value) => [
                      `${formatCurrency(value)} vnđ`,
                      'Doanh thu',
                    ]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalRevenueBranch"
                    fill="#10b981"
                    name="Doanh thu"
                    radius={[6, 6, 0, 0]}
                    opacity={0.8}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              style={{
                height: '100%',
                borderRadius: '12px',
                border: 'none',
              }}
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                  <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                    Phân bổ doanh thu
                  </Text>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="totalRevenue"
                    nameKey="branchName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BRANCH_COLORS[index % BRANCH_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => [
                      `${formatCurrency(value)} VNĐ`,
                      'Doanh thu',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '20px' }}>
                {pieChartData.map((item, index) => (
                  <div
                    key={item.branchName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor:
                          BRANCH_COLORS[index % BRANCH_COLORS.length],
                        marginRight: '8px',
                      }}
                    ></div>
                    <Text strong style={{ fontSize: '14px' }}>
                      {item.branchName}
                    </Text>
                    <Text style={{ fontSize: '14px', marginLeft: 'auto' }}>
                      {formatCurrency(item.totalRevenue)} VNĐ
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    return historicalData
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        date: dayjs(item.date).format(
          selectedPeriod === 'daily'
            ? 'DD/MM'
            : selectedPeriod === 'weekly'
              ? 'DD/MM'
              : selectedPeriod === 'monthly'
                ? 'MM/YYYY'
                : 'YYYY',
        ),
        revenue: item.totalRevenue,
        orders: item.totalOrders,
        customers: item.totalCustomers || 0,
        aov: Math.round(item.averageOrderValue / 1000),
      }));
  }, [historicalData, selectedPeriod]);

  const paymentMethodData = useMemo(() => {
    if (!currentStats?.paymentMethods) return [];

    return currentStats.paymentMethods.map((method, index) => ({
      name: method.method,
      value: method.amount,
      count: method.count,
      percentage: method.percentage,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [currentStats]);

  const topProductsColumns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_, __, index) => (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: index < 3 ? '#f59e0b' : '#f3f4f6',
            color: index < 3 ? '#ffffff' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ color: '#1f2937' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      align: 'right',
      width: 100,
      render: (value) => (
        <Tag
          style={{
            margin: 0,
            borderRadius: '6px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: 'none',
            fontWeight: '500',
          }}
        >
          {value?.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      width: 130,
      render: (value) => (
        <Text strong style={{ color: '#10b981' }}>
          {formatCurrency(value || 0)}
        </Text>
      ),
    },
  ];

  const topViewCountColumns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_, __, index) => (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ color: '#1f2937' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'right',
      width: 100,
      render: (value) => (
        <Tag
          style={{
            margin: 0,
            borderRadius: '6px',
            backgroundColor: '#f3e8ff',
            color: '#7c3aed',
            border: 'none',
            fontWeight: '500',
          }}
        >
          {value?.toLocaleString()}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: '12px' }}
          action={
            <Space>
              <a onClick={() => window.location.reload()}>Thử lại</a>
            </Space>
          }
        />
      </div>
    );
  }

  if (!currentStats) {
    return (
      <div style={{ padding: '40px' }}>
        <Alert
          message="Chưa có dữ liệu"
          description={`Dữ liệu cho ${selectedPeriod} chưa được tải`}
          type="warning"
          showIcon
          style={{ borderRadius: '12px' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '10px',

        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: '10px',
          borderRadius: '12px',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#111827' }}>
              Dashboard
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: '16px', color: '#6b7280' }}
            >
              Tổng quan hiệu suất kinh doanh
            </Text>
          </Col>
          <Col>
            <Segmented
              value={selectedPeriod}
              onChange={handlePeriodChange}
              options={[
                { label: 'Hôm nay', value: 'daily' },
                { label: 'Tuần', value: 'weekly' },
                { label: 'Tháng', value: 'monthly' },
                { label: 'Năm', value: 'yearly' },
              ]}
              scrolling="false"
              style={{
                borderRadius: '12px',
                padding: '4px',
                border: '1px solid #e5e7eb',
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ paddingLeft: '10px' }}>
                <Statistic
                  title={
                    <Text
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      Tổng doanh thu
                    </Text>
                  }
                  value={currentStats?.totalRevenue || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{
                    color: '#111827',
                    fontSize: '28px',
                    fontWeight: '700',
                    lineHeight: 1.2,
                  }}
                />
                {comparisonData?.comparison && (
                  <ChangeIndicator
                    change={comparisonData.comparison.revenueChange}
                  />
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',

              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ paddingLeft: '16px' }}>
                <Statistic
                  title={
                    <Text
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      Tổng đơn hàng
                    </Text>
                  }
                  value={currentStats?.totalOrders || 0}
                  valueStyle={{
                    color: '#111827',
                    fontSize: '28px',
                    fontWeight: '700',
                    lineHeight: 1.2,
                  }}
                />
                {comparisonData?.comparison && (
                  <ChangeIndicator
                    change={comparisonData.comparison.ordersChange}
                  />
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: '16px',
            }}
            title={
              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                  Doanh thu & đơn hàng
                </Text>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.09} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                  formatter={(value, name, props) => {
                    if (props.dataKey === 'revenue') {
                      return [`${formatCurrency(value)}`, 'Doanh thu'];
                    } else if (props.dataKey === 'orders') {
                      return [value.toLocaleString(), 'Số đơn hàng'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  fill="#10b981"
                  name="Số đơn hàng"
                  radius={[6, 6, 0, 0]}
                  opacity={0.8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: '16px',

              height: '100%',
            }}
            title={
              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                  Phương thức thanh toán
                </Text>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                  formatter={(value) => [
                    `${formatCurrency(value)} VNĐ`,
                    'Giá trị',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '20px' }}>
              {paymentMethodData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom:
                      index < paymentMethodData.length - 1
                        ? '1px solid #f3f4f6'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Text style={{ color: '#374151', fontWeight: '500' }}>
                      {item.name}
                    </Text>
                  </div>
                  <Text strong style={{ color: '#1f2937' }}>
                    {formatCurrency(item.value)} VNĐ
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Branch Overview */}
      <BranchOverview />

      {/* Product Tables */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              height: '100%',
            }}
            bodyStyle={{ padding: '24px' }}
            title={
              <div className="flex items-center gap-3 py-3">
                <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                  Top sản phẩm bán chạy
                </Text>
              </div>
            }
          >
            <Table
              dataSource={currentStats?.topSellingProducts || []}
              columns={topProductsColumns}
              pagination={false}
              rowKey="productId"
              style={{
                '& .ant-table': {
                  borderRadius: '12px',
                },
                '& .ant-table-thead > tr > th': {
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#374151',
                  fontWeight: '600',
                },
                '& .ant-table-tbody > tr': {
                  borderBottom: '1px solid #f3f4f6',
                },
                '& .ant-table-tbody > tr:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              height: '100%',
            }}
            bodyStyle={{ padding: '24px' }}
            title={
              <div className="flex items-center gap-3 py-3">
                <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                  Sản phẩm được quan tâm
                </Text>
              </div>
            }
          >
            <Table
              dataSource={currentStats?.mostViewedProducts || []}
              columns={topViewCountColumns}
              pagination={false}
              rowKey="productId"
              style={{
                '& .ant-table': {
                  borderRadius: '12px',
                },
                '& .ant-table-thead > tr > th': {
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#374151',
                  fontWeight: '600',
                },
                '& .ant-table-tbody > tr': {
                  borderBottom: '1px solid #f3f4f6',
                },
                '& .ant-table-tbody > tr:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {currentStats?.lastUpdated && (
        <Card
          style={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',
            textAlign: 'center',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Text style={{ fontSize: '13px', color: '#6b7280' }}>
            Cập nhật lần cuối:{' '}
            <Text strong style={{ color: '#374151' }}>
              {dayjs(currentStats.lastUpdated).format('DD/MM/YYYY - HH:mm:ss')}
            </Text>
          </Text>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
