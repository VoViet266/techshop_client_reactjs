import { useAppContext } from "@contexts";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Flex,
  Breadcrumb,
  Menu,
  Space,
  Avatar,
  Badge,
  Divider,
  Button,
  Tooltip,
  Card,
  FloatButton,
} from "antd";
import {
  DashboardOutlined,
  HomeOutlined,
  LaptopOutlined,
  NotificationOutlined,
  ProductOutlined,
  ShoppingOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TagsOutlined,
  ContainerOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { callLogout } from "@/services/apis";

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;
  const { sideBarSelectedTab, setSideBarSelectedTab } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: "dashboard",
      label: "Tổng quan",
      icon: <DashboardOutlined />,
      onClick: () => navigate("/dashboard"),
    },
    {
      type: "divider",
    },
    {
      key: "product",
      label: "Sản phẩm",
      icon: <ProductOutlined />,
      children: [
        {
          key: "allproducts",
          label: "Danh sách sản phẩm",
          onClick: () => navigate("/product/all"),
        },
        {
          key: "addproduct",
          label: "Thêm sản phẩm",
          onClick: () => navigate("/product/add"),
        },
      ],
    },
    {
      key: "inventory",
      label: "Kho hàng",
      icon: <ContainerOutlined />,
      children: [
        {
          key: "allinventory",
          label: "Danh sách kho hàng",
          onClick: () => navigate("/inventory/all"),
        },
        {
          key: "importinventory",
          label: "Nhập hàng",
          onClick: () => navigate("/inventory/import"),
        },
        {
          key: "transferinventory",
          label: "Chuyển kho",
          onClick: () => navigate("/inventory/transfer"),
        },
      ],
    },
    {
      key: "order",
      label: "Đơn hàng",
      icon: <ShoppingOutlined />,
      onClick: () => navigate("/admin/order"),
    },
    {
      type: "divider",
    },
    {
      key: "branch",
      label: "Chi nhánh",
      icon: <HomeOutlined />,
      onClick: () => navigate("/branch"),
    },
    {
      key: "category",
      label: "Danh mục",
      icon: <ShoppingOutlined />,
      onClick: () => navigate("/category"),
    },
    {
      key: "brand",
      label: "Thương hiệu",
      icon: <TagsOutlined />,
      onClick: () => navigate("/brand"),
    },
    {
      key: "user",
      label: "Người dùng",
      icon: <UserOutlined />,
      onClick: () => navigate("/user"),
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
      {
        title: <Link to="/dashboard">Admin</Link>,
      },
    ];

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title =
        pathSnippets[index].charAt(0).toUpperCase() +
        pathSnippets[index].slice(1);

      if (index > 0) {
        breadcrumbItems.push({
          title: <Link to={url}>{title}</Link>,
        });
      }
    });

    return breadcrumbItems;
  };

  useEffect(() => {
    navigate("/dashboard");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCurrentPath = () => {
    const path = location.pathname.split("/");
    return path.length > 2 ? path[2] : path[1];
  };

  const handleLogout = async () => {
    await callLogout();
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <Layout className="w-full!">
      <Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-100! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! ">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 40,
            height: 40,
            color: "#7f7f7f",
            right: 40,
          }}
        />

        <Link to="/dashboard">
          <div className="flex items-end space-x-2 cursor-pointer">
            <Title
              level={2}
              className="font-bold font-roboto xl:text-3xl lg:text-2xl md:text-2xl m-0 text-primary"
            >
              TechShop
            </Title>
            <span className="text-xs text-gray-500 pb-1">Trang quản lý</span>
          </div>
        </Link>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          collapsedWidth={80}
          style={{
            overflow: "auto",
            height: "100vh",
            maxHeight: "90vh",
            position: "fixed",
            left: 0,
            top: 64,
            bottom: 0,
            background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRight: "1px solid #e2e8f0",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: collapsed ? "0" : "24px",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: collapsed ? "none" : "white",
              margin: collapsed ? "16px 8px" : "16px",
              borderRadius: 50,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
            }}
          >
            {collapsed ? (
              <Tooltip title="Admin User" placement="right">
                <Avatar
                  size={48}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <UserOutlined />
                </Avatar>
              </Tooltip>
            ) : (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Avatar
                  size={64}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "3px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <UserOutlined />
                </Avatar>
                <div>
                  <Text strong style={{ fontSize: 16, display: "block" }}>
                    Admin
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Quản trị viên
                  </Text>
                </div>
              </Space>
            )}
          </div>

          <div style={{ padding: collapsed ? "0 8px" : "0 16px" }}>
            <Menu
              mode="inline"
              items={navItems}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 14,
              }}
              theme="light"
            />
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 280,
            transition: "margin-left 0.2s",
          }}
        >
          <Content
            style={{
              margin: "24px",
              padding: "24px",
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              minHeight: "calc(100vh - 112px)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{
                  fontSize: 14,
                  color: "#64748b",
                }}
              />
            </div>
            <Outlet />
            <FloatButton.Group
              trigger="click"
              size="large"
              style={{
                insetInlineEnd: 24,
                insetBlockEnd: 24,
                transform: "scale(1.2)",
              }} // bottom right
              icon={<ToolOutlined />}
            >
              <FloatButton
                icon={<SettingOutlined />}
                tooltip="Cài đặt"
                onClick={() => {
                  console.log("Cài đặt");
                }}
              />
              <FloatButton
                shape="circle"
                icon={<LogoutOutlined />}
                tooltip="Đăng xuất"
                type="primary"
                onClick={handleLogout}
              />
            </FloatButton.Group>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
