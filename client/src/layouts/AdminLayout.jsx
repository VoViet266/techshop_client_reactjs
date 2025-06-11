import {
  UserOutlined,
  LaptopOutlined,
  ProductOutlined,
  ShoppingOutlined,
  DashboardOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, Space, Avatar, Layout, Typography, Breadcrumb } from "antd";

function AdminLayout() {
  const { Title } = Typography;
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarReference = useRef(null);
  const { Header, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCurrentWidth, setSidebarCurrentWidth] = useState(250);

  // useEffect(() => {
  //   if (sidebarReference?.current?.clientWidth)
  //     setSidebarCurrentWidth(sidebarReference.current.clientWidth);
  // }, [sidebarReference?.current?.clientWidth]);

  const sidebarItems = [
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
      {/* <Space>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={toggleMobileMenu}
            style={{ fontSize: "16px" }}
          />
        )}
        <Breadcrumb items={getBreadcrumbItems()} />
      </Space> */}
      <Layout className="mt-60! min-h-500!">
        <Sider
          width={250}
          collapsible
          theme="light"
          collapsed={collapsed}
          ref={sidebarReference}
          onCollapse={(value) => setCollapsed(value)}
          className="fixed! top-60! left-0! bottom-0!"
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
            items={sidebarItems}
            selectedKeys={[getCurrentPath()]}
            className="font-roboto! text-base!"
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Content
          className={`bg-white! transition-all! duration-300! p-20! ${collapsed ? "ml-80!" : "ml-250!"}`}
        >
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
