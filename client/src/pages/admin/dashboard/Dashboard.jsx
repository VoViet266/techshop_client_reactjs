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
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import {
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
            className="rounded-xl! h-full!"
            title={
              <div className="flex items-center justify-between md:gap-10 max-sm:flex-col max-sm:items-start py-10">
                <Text strong className="block! py-10! text-lg! text-[#1e293b]!">
                  Doanh thu theo chi nhánh
                </Text>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#1e293b"
                  fontSize={12}
                  tick={{ fill: '#475569' }}
                />
                <YAxis
                  stroke="#1e293b"
                  fontSize={12}
                  tick={{ fill: '#475569' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 15,
                    fontSize: 14,
                    color: '#1e293b',
                    fontWeight: '500',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu' || name === 'Lợi nhuận') {
                      return [`${formatCurrency(value)} VNĐ`, name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                />

                {/* Gradient definitions */}
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#05a085" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient
                    id="profitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <Bar
                  dataKey="totalRevenueBranch"
                  fill="url(#revenueGradient)"
                  name="Doanh thu"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="profitBranch"
                  fill="url(#profitGradient)"
                  name="Lợi nhuận"
                  radius={[6, 6, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="rounded-xl! h-full!"
            title={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  height: 50,
                }}
              >
                <Text strong style={{ fontSize: '18px', color: '#1e293b' }}>
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
                  innerRadius={45}
                  outerRadius={85}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelStyle={{
                    fontSize: '13px',
                    fontWeight: '600',
                    fill: '#1e293b',
                  }}
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
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
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
                    justifyContent: 'space-between',
                    padding: '12px 8px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    backgroundColor:
                      index % 2 === 0 ? '#f8fafc' : 'transparent',
                    transition: 'all 0.2s ease',
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
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor:
                          BRANCH_COLORS[index % BRANCH_COLORS.length],
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Text
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: '500',
                      }}
                    >
                      {item.branchName}
                    </Text>
                  </div>
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
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
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Card className="mb-16! rounded-xl!">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#111827' }}>
              Dashboard
            </Title>
            <Text type="secondary" className="text-sm! text-[#6b7280]! ">
              Tổng quan hiệu suất kinh doanh
            </Text>
          </Col>
          <Col className={`md:sm:mt-8! max-sm:mt-8!`}>
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
              />
            </Space>
          </Col>
        </Row>
      </Card>
      {/* Stats Cards */}
      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl! h-full!">
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
          <Card className="rounded-xl! h-full!">
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
          <Card className="rounded-xl! h-full!">
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
            className="rounded-xl!"
            title={
              <div className="flex items-center justify-between md:gap-10 max-sm:flex-col max-sm:items-start py-10">
                <Text
                  strong
                  className="text-[16px]! block! py-10! text-[#1f2937]!"
                >
                  Doanh thu & Lợi nhuận & Đơn hàng
                </Text>
                <RangePicker
                  value={chartDateRange}
                  onChange={handleChartDateRangeChange}
                  presets={getDatePresets()}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                  className="h-35!"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                {/* Trục X */}
                <XAxis
                  dataKey="date"
                  stroke="#1e293b"
                  fontSize={13}
                  tick={{ fill: '#475569' }}
                  padding={{ left: 10, right: 10 }}
                />

                {/* Brush cho phép zoom / filter */}
                <Brush
                  dataKey="date"
                  height={15}
                  stroke="#3b82f6"
                  travellerWidth={10}
                  traveller={false}
                  strokeDasharray="3 3"
                />

                {/* Trục Y bên trái */}
                <YAxis
                  yAxisId="left"
                  stroke="#1e293b"
                  fontSize={13}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{ fill: '#475569' }}
                />

                {/* Trục Y bên phải */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#1e293b"
                  fontSize={13}
                  tick={{ fill: '#475569' }}
                />

                {/* Tooltip đẹp hơn */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
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
                    color: '#1e293b',
                    fontWeight: '500',
                  }}
                />

                {/* Gradient cho Area */}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06d6a0" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                {/* Bar - Số đơn hàng */}
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  fill="url(#colorOrders)"
                  name="Số đơn hàng"
                  radius={[6, 6, 0, 0]}
                  opacity={0.9}
                />

                {/* Area - Doanh thu */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  name="Doanh thu"
                />

                {/* Area - Lợi nhuận */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#06d6a0"
                  fill="url(#colorProfit)"
                  strokeWidth={3}
                  name="Lợi nhuận"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="rounded-xl! h-full!"
            title={
              <div className="flex items-center gap-3 py-2 h-[50px]">
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
            className="rounded-xl! h-full!"
            title={
              <div className="flex items-center gap-3 py-3">
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
              bordered
              rowKey="productId"
              className="w-full! h-full!"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="rounded-xl! h-full!"
            title={
              <div className="flex items-center gap-3 py-3">
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
              bordered
              className="w-full! h-full!"
            />
          </Card>
        </Col>
      </Row>
      {currentStats?.lastUpdated && (
        <Card className="text-center! border-none! bg-transparent!">
          <Text className="text-[#6b7280]! text-sm!">
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
