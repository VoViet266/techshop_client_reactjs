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
} from "@ant-design/icons";
import { useEffect, useState } from "react";

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;
  const { sideBarSelectedTab, setSideBarSelectedTab } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  function highlight(text) {
    if (sideBarSelectedTab === text) return "text-primary!";
    return "text-black! hover:text-primary!";
  }
  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "product",
      label: "Quản lý sản phẩm",
      icon: <ProductOutlined />,
      children: [
        {
          key: "addproduct",
          label: "Thêm sản phẩm",
          onClick: () => navigate("/product/add"),
        },
        {
          key: "allproducts",
          label: "Danh sách sản phẩm",
          onClick: () => navigate("/product/all"),
        },
      ],
    },
    {
      key: "category",
      label: "Categories",
      icon: <LaptopOutlined />,
      onClick: () => navigate("/categories"),
    },
    {
      key: "brand",
      label: "Brands",
      icon: <NotificationOutlined />,
      onClick: () => navigate("/brands"),
    },
    {
      key: "user",
      label: "Users",
      icon: <UserOutlined />,
      onClick: () => navigate("/users"),
    },
    {
      key: "order",
      label: "Orders",
      icon: <ShoppingOutlined />,
      onClick: () => navigate("/admin/order"),
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

  const getCurrentPath = () => {
    const path = location.pathname.split("/");
    return path.length > 2 ? path[2] : "";
  };

  return (
    <Layout className="w-full!">
      <Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-100! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! justify-between!">
        <Link to="/dashboard">
          <Title
            level={3}
            className="font-bold! font-roboto! xl:text-3xl! lg:text-2xl! md:text-2xl! m-0! text-primary!"
          >
            TechShop
          </Title>
        </Link>
      </Header>
      <Space>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={toggleMobileMenu}
            style={{ fontSize: "16px" }}
          />
        )}
        <Breadcrumb items={getBreadcrumbItems()} />
      </Space>
      <Layout className="mt-60! min-h-500!">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          width={250}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: collapsed ? "16px 0" : "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {collapsed ? (
              <Avatar size={40}>
                <UserOutlined />
              </Avatar>
            ) : (
              <Space direction="vertical" align="center">
                <Avatar size={64}>
                  <UserOutlined />
                </Avatar>
              </Space>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getCurrentPath()]}
            items={navItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Content className="bg-white! p-20! m-20!">
          <Space>
            <Breadcrumb items={getBreadcrumbItems()} />
          </Space>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
