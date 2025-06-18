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
          onClick: () => navigate("/product"),
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
          onClick: () => navigate("/warehouse"),
        },
        {
          key: "importinventory",
          label: "Nhập hàng",
          onClick: () => navigate("/warehouse/import"),
        },
        {
          key: "exportinventory",
          label: "Xuất hàng",
          onClick: () => navigate("/warehouse/export"),
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
      onClick: () => navigate("/order"),
    },
    {
      type: "divider",
    },
    {
      key: "branch",
      label: "Chi nhánh",
      icon: <HomeOutlined />,
      onClick: () => navigate("/branch/management"),
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
        title: (
          <Link to="/dashboard" style={{ color: "#4F46E5" }}>
            Admin
          </Link>
        ),
      },
    ];

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title =
        pathSnippets[index].charAt(0).toUpperCase() +
        pathSnippets[index].slice(1);

      if (index > 0) {
        breadcrumbItems.push({
          title: (
            <Link to={url} style={{ color: "#475569" }}>
              {title}
            </Link>
          ),
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
      <Header
        className="font-roboto xl:px-12 lg:px-8 md:px-6 px-4 w-full fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(99, 102, 241, 0.95) 50%, rgba(6, 182, 212, 0.95) 100%)`,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow:
            "0 4px 24px rgba(79, 70, 229, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 40,
              height: 40,
              color: "#FFFFFF",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: `1px solid rgba(255, 255, 255, 0.25)`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          <Link to="/dashboard">
            <div className="flex items-end space-x-3 cursor-pointer">
              <Title
                level={1}
                className="font-bold font-roboto xl:text-3xl lg:text-2xl md:text-xl text-lg m-0"
                style={{
                  fontWeight: 800,
                  color: "#FFFFFF",
                  textShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  background: "transparent",
                }}
              >
                TechShop
              </Title>
              <span
                className="text-xs pb-1 font-medium"
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  textShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                Trang quản lý
              </span>
            </div>
          </Link>
        </div>
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
            background: "#F1F5F9",
            borderRight: `1px solid #E2E8F0"`,
            zIndex: 999,
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              padding: collapsed ? "0" : "24px",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: collapsed ? "none" : "#FEFEFE",
              margin: collapsed ? "16px 8px" : "16px",
              borderRadius: collapsed ? 12 : 16,
              boxShadow: "0 4px 16px rgba(79, 70, 229, 0.08)",
              border: `1px solid #E2E8F0"`,
              transition: "all 0.3s ease",
            }}
          >
            {collapsed ? (
              <Tooltip title="Admin User" placement="right">
                <Avatar
                  size={48}
                  style={{
                    background: `linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(99, 102, 241, 0.95) 50%, rgba(6, 182, 212, 0.95) 100%)`,

                    border: `3px solid ${"#FEFEFE"}`,
                    boxShadow: "0 4px 16px rgba(79, 70, 229, 0.2)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <UserOutlined style={{ color: "#FEFEFE" }} />
                </Avatar>
              </Tooltip>
            ) : (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Avatar
                  size={64}
                  style={{
                    background: `linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(99, 102, 241, 0.95) 50%, rgba(6, 182, 212, 0.95) 100%)`,
                    border: `3px solid ${"#FEFEFE"}`,
                    boxShadow: "0 6px 20px rgba(79, 70, 229, 0.25)",
                  }}
                >
                  <UserOutlined style={{ color: "#FEFEFE" }} />
                </Avatar>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      display: "block",
                      color: "#0F172A",
                    }}
                  >
                    Admin
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      color: "#475569",
                    }}
                  >
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
              itemStyle={{
                color: "#475569",
                borderRadius: "8px",
                margin: "4px 0",
              }}
            />
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 280,
            transition: "margin-left 0.2s",
            background: "#F8FAFC",
          }}
        >
          <Content
            style={{
              margin: "24px",
              padding: "32px",
              background: "#FEFEFE",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
              minHeight: "calc(100vh - 112px)",
              border: `1px solid #E2E8F0"`,
            }}
          >
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{
                fontSize: 14,
                color: "#475569",
              }}
            />

            <Outlet />
            <FloatButton.Group
              trigger="click"
              size="large"
              style={{
                insetInlineEnd: 24,
                insetBlockEnd: 24,
                transform: "scale(1.1)",
              }}
              icon={<ToolOutlined style={{ color: "#FEFEFE" }} />}
              type="primary"
            >
              <FloatButton
                icon={<SettingOutlined />}
                tooltip="Cài đặt"
                style={{
                  backgroundColor: "#06B6D4",
                  borderColor: "#06B6D4",
                }}
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
