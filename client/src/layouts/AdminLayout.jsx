import {
  UserOutlined,
  LaptopOutlined,
  ProductOutlined,
  ShoppingOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  TagsOutlined,
  ContainerOutlined,
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

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Quản lý hệ thống",
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
        // {
        //   key: "editproduct",
        //   label: "Sửa sản phẩm",
        //   onClick: () => navigate("/product/edit"),
        // },
        {
          key: "allproducts",
          label: "Danh sách sản phẩm",
          onClick: () => navigate("/product/all"),
        },
      ],
    },
    {
      key: "inventory",
      label: "Quản lý kho hàng",
      icon: <ContainerOutlined />,
      children: [
        {
          key: "allinventory",
          label: "Danh sách kho hàng",
          onClick: () => navigate("/inventory/all"),
        },
        // {
        //   key: "addinventory",
        //   label: "Thêm kho hàng",
        //   onClick: () => navigate("/inventory/add"),
        // },
        {
          key: "importinventory",
          label: "Nhập hàng",
          onClick: () => navigate("/inventory/import"),
        },
        // {
        //   key: "exportinventory",
        //   label: "Xuất hàng",
        //   onClick: () => navigate("/inventory/export"),
        // },
        {
          key: "transferinventory",
          label: "Chuyển kho",
          onClick: () => navigate("/inventory/transfer"),
        },
      ],
    },
    {
      key: "branch",
      label: "Quản lý chi nhánh",
      icon: <HomeOutlined />,
      onClick: () => navigate("/branch"),
    },
    {
      key: "category",
      label: "Quản lý danh mục",
      icon: <ShoppingOutlined />,
      onClick: () => navigate("/category"),
    },
    {
      key: "brand",
      label: "Quản lý thương hiệu",
      icon: <TagsOutlined />,
      onClick: () => navigate("/brand"),
    },
    {
      key: "user",
      label: "Quản lý người dùng",
      icon: <UserOutlined />,
      onClick: () => navigate("/user"),
    },
    {
      key: "order",
      label: "Quản lý đơn hàng",
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

  // useEffect(() => {
  //   navigate("/dashboard");
  // }, []);

  const getCurrentPath = () => {
    const path = location.pathname.split("/");
    return path.length > 2 ? path[2] : "";
  };

  return (
    <Layout className="w-full!">
      <Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-100! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! justify-between!">
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
      <Layout className="mt-60! min-h-700!">
        <Sider
          width={250}
          style={{
            overflow: "clip",
            alignSelf: "flex-start",
            height: "100vh",
            position: "sticky",
            marginTop: "20px",
            insetInlineStart: 1,
            top: 80,
            bottom: 0,
          }}
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
    
            style={{ height: "100vh", borderRight: 0 }}
          />
        </Sider>
        <Content
          className={`bg-white! transition-all! min-h-[calc(100vh-60px)]! border-gray-300 border-l duration-250! p-20! ${collapsed ? "ml-80!" : "ml-250!"}`}
        >
          {/* <Space>
            <Breadcrumb items={getBreadcrumbItems()} />
          </Space> */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
