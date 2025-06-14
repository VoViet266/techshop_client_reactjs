import React, { useState } from "react";
import { Card, Row, Col, Statistic, Table } from "antd";
import {
  UserOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
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
} from "recharts";
const generateRandomData = () => {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return months.map((month) => ({
    tháng: month,
    doanhthu: Math.floor(Math.random() * 1000) + 200,
    chiphi: Math.floor(Math.random() * 500) + 100,
  }));
};

const salesData = generateRandomData();

const trafficData = [
  { name: "Google", value: 400 },
  { name: "Facebook", value: 300 },
  { name: "Twitter", value: 200 },
  { name: "Instagram", value: 150 },
  { name: "LinkedIn", value: 100 },
];

const customerData = [
  {
    key: "1",
    tên: "Nguyễn Văn A",
    loại: "VIP",
    giatri: 15000000,
    thành_phố: "Hà Nội",
  },
  {
    key: "2",
    tên: "Trần Thị B",
    loại: "Thường",
    giatri: 5000000,
    thành_phố: "Hồ Chí Minh",
  },
  {
    key: "3",
    tên: "Lê Văn C",
    loại: "VIP",
    giatri: 12000000,
    thành_phố: "Đà Nẵng",
  },
  {
    key: "4",
    tên: "Phạm Thị D",
    loại: "Thường",
    giatri: 3000000,
    thành_phố: "Hải Phòng",
  },
];

const columns = [
  { title: "Tên", dataIndex: "tên", key: "tên" },
  { title: "Loại", dataIndex: "loại", key: "loại" },
  {
    title: "Giá trị",
    dataIndex: "giatri",
    key: "giatri",
    render: (value) => `${value.toLocaleString()} đ`,
  },
  { title: "Thành phố", dataIndex: "thành_phố", key: "thành_phố" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
  return (
    <>
      {/* Thống kê doanh thu, đơn hàng, khách hàng mới, tỷ lệ chuyển đổi */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Doanh thu" value={15890000} suffix="đ" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Đơn hàng" value={156} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Khách hàng mới" value={42} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chuyển đổi"
              value={12.3}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
      </Row>
      {/* Biểu đồ doanh thu và chi phí, biểu đồ nguồn truy cập */}
      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Col xs={24} lg={16}>
          <Card title="Doanh thu & Chi phí" extra={<LineChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis dataKey="tháng" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="doanhthu"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="chiphi" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Nguồn truy cập" extra={<PieChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {trafficData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      {/* Bảng doanh thu theo tháng và khách hàng hàng đầu */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Doanh thu theo tháng" extra={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tháng" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="doanhthu" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Khách hàng hàng đầu" extra={<UserOutlined />}>
            <Table
              dataSource={customerData}
              columns={columns}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
