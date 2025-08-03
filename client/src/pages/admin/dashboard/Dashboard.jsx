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
  Segmented,
  Button,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  CalendarOutlined,
  FilterOutlined,
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
  Brush,
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

  // Thêm state cho date range filter
  const [chartDateRange, setChartDateRange] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const currentStats = allStats[selectedPeriod];
  const comparisonData = allComparison[selectedPeriod];
  const historicalData = allHistorical[selectedPeriod];
  const currentBranchData = allBranchData[selectedPeriod];

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  // Hàm để lấy preset date ranges phổ biến
  const getDatePresets = () => {
    const today = dayjs();
    return {
      'Hôm nay': [today, today],
      '7 ngày qua': [today.subtract(6, 'day'), today],
      '30 ngày qua': [today.subtract(29, 'day'), today],
      '3 tháng qua': [today.subtract(3, 'month'), today],
      '6 tháng qua': [today.subtract(6, 'month'), today],
      'Năm nay': [today.startOf('year'), today],
      'Năm trước': [
        today.subtract(1, 'year').startOf('year'),
        today.subtract(1, 'year').endOf('year'),
      ],
    };
  };

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

  const fetchHistoricalData = async (
    period,
    startDate = null,
    endDate = null,
  ) => {
    try {
      let url = `/api/v1/dashboard/stats/${period}/historical?limit=30`;

      // Thêm date range nếu có
      if (startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await axiosInstance.get(url, { timeout: 15000 });
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

        // Sử dụng chartDateRange cho historical data nếu có
        const startDate = chartDateRange?.[0];
        const endDate = chartDateRange?.[1];

        const statsPromises = periods.map((period) => fetchStats(period));
        const comparisonPromises = periods.map((period) =>
          fetchStatsWithComparison(period, dateRange?.[0]),
        );
        const historicalPromises = periods.map((period) =>
          fetchHistoricalData(period, startDate, endDate),
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
  }, [dateRange, chartDateRange]); // Thêm chartDateRange vào dependency

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  // Hàm xử lý thay đổi date range cho biểu đồ
  const handleChartDateRangeChange = (dates) => {
    setChartDateRange(dates);
  };

  // Hàm reset date filter
  const handleResetDateFilter = () => {
    setChartDateRange(null);
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

    const branchStats = currentBranchData || [];

    const filteredBranchStats = useMemo(() => {
      let data = Object.values(branchStats);
      data = data.filter((b) =>
        b?.branchOverview?.branchStats?.some(
          (bs) => bs.branchId === selectedBranch,
        ),
      );
      return data;
    }, [branchStats, selectedBranch]);

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
          profitBranch: branchData?.totalProfit || 0,
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
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              height: '100%',
            }}
            title={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '24px',
                      backgroundColor: '#6366f1',
                      borderRadius: '2px',
                    }}
                  ></div>
                  <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                    Doanh thu theo chi nhánh
                  </Text>
                </div>
                <Select
                  size="middle"
                  style={{ width: 250 }}
                  value={selectedBranch}
                  onChange={(value) => setSelectedBranch(value)}
                  placeholder="Chọn chi nhánh"
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
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={branchChartData?.length ? branchChartData : []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu' || name === 'Lợi nhuận') {
                      return [`${formatCurrency(value)} VNĐ`, name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                />
                <Bar
                  dataKey="totalRevenueBranch"
                  fill="#10b981"
                  name="Doanh thu"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profitBranch"
                  fill="#3b82f6"
                  name="Lợi nhuận"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              height: '100%',
            }}
            title={
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '24px',
                    backgroundColor: '#10b981',
                    borderRadius: '2px',
                  }}
                ></div>
                <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                  Phân bổ doanh thu
                </Text>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="totalRevenue"
                  nameKey="branchName"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fontSize: '12px', fontWeight: '500' }}
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
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [
                    `${formatCurrency(value)} VNĐ`,
                    'Doanh thu',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '16px' }}>
              {pieChartData.map((item, index) => (
                <div
                  key={item.branchName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom:
                      index < pieChartData.length - 1
                        ? '1px solid #f3f4f6'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor:
                          BRANCH_COLORS[index % BRANCH_COLORS.length],
                      }}
                    />
                    <Text style={{ fontSize: '14px' }}>{item.branchName}</Text>
                  </div>
                  <Text strong style={{ fontSize: '14px' }}>
                    {formatCurrency(item.totalRevenue)} VNĐ
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // Filtered chart data dựa trên date range
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    let filteredData = historicalData
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Áp dụng date range filter nếu có
    if (chartDateRange && chartDateRange[0] && chartDateRange[1]) {
      const startDate = chartDateRange[0].startOf('day');
      const endDate = chartDateRange[1].endOf('day');

      filteredData = filteredData.filter((item) => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      });
    }

    return filteredData.map((item) => ({
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
      profit: item.totalProfit || 0,
      orders: item.totalOrders,
      customers: item.totalCustomers || 0,
    }));
  }, [historicalData, selectedPeriod, chartDateRange]);

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
            borderRadius: '6px',
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
            borderRadius: '6px',
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
          backgroundColor: '#f9fafb',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: '8px' }}
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
      <div style={{ padding: '24px' }}>
        <Alert
          message="Chưa có dữ liệu"
          description={`Dữ liệu cho ${selectedPeriod} chưa được tải`}
          type="warning"
          showIcon
          style={{ borderRadius: '8px' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: '16px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#111827' }}>
              Dashboard
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: '14px', color: '#6b7280' }}
            >
              Tổng quan hiệu suất kinh doanh
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              <Segmented
                value={selectedPeriod}
                onChange={handlePeriodChange}
                options={[
                  { label: 'Hôm nay', value: 'daily' },
                  { label: 'Tuần', value: 'weekly' },
                  { label: 'Tháng', value: 'monthly' },
                  { label: 'Năm', value: 'yearly' },
                ]}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            }}
          >
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
                fontSize: '24px',
                fontWeight: '700',
              }}
            />
            {comparisonData?.comparison && (
              <ChangeIndicator
                change={comparisonData.comparison.revenueChange}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            }}
          >
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
                fontSize: '24px',
                fontWeight: '700',
              }}
            />
            {comparisonData?.comparison && (
              <ChangeIndicator
                change={comparisonData.comparison.ordersChange}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            }}
          >
            <Statistic
              title={
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: 500,
                  }}
                >
                  Tổng lợi nhuận
                </Text>
              }
              value={currentStats?.totalProfit || 0}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{
                color: '#111827',
                fontSize: '24px',
                fontWeight: '700',
              }}
            />
            {comparisonData?.comparison && (
              <ChangeIndicator
                change={comparisonData.comparison.profitChange || 0}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}
            title={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 0px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                    Doanh thu & Lợi nhuận & Đơn hàng
                  </Text>
                </div>
                <RangePicker
                  value={chartDateRange}
                  onChange={handleChartDateRangeChange}
                  presets={getDatePresets()}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                  style={{
                    borderRadius: '6px',
                    minWidth: '280px',
                  }}
                  allowClear
                />
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart
                data={chartData}
                margin={{ top: 30, right: 10, bottom: 40, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                {/* Trục X */}
                <XAxis
                  dataKey="date"
                  stroke="#374151"
                  fontSize={13}
                  tick={{ fill: '#6b7280' }}
                  padding={{ left: 10, right: 10 }}
                />

                {/* Brush cho phép zoom / filter */}
                <Brush
                  dataKey="date"
                  height={15}
                  stroke="#4f46e5"
                  travellerWidth={10}
                  traveller={false}
                  strokeDasharray="3 3"
                />

                {/* Trục Y bên trái */}
                <YAxis
                  yAxisId="left"
                  stroke="#374151"
                  fontSize={13}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{ fill: '#6b7280' }}
                />

                {/* Trục Y bên phải */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#374151"
                  fontSize={13}
                  tick={{ fill: '#6b7280' }}
                />

                {/* Tooltip đẹp hơn */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu' || name === 'Lợi nhuận') {
                      return [`${formatCurrency(value)} VNĐ`, name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                />

                {/* Legend đẹp hơn */}
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: 13,
                    color: '#374151',
                  }}
                />

                {/* Gradient cho Area */}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                {/* Area - Doanh thu */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Doanh thu"
                />

                {/* Area - Lợi nhuận */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                  name="Lợi nhuận"
                />

                {/* Bar - Số đơn hàng */}
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  fill="#f59e0b"
                  name="Số đơn hàng"
                  radius={[5, 5, 0, 0]}
                  opacity={0.85}
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
