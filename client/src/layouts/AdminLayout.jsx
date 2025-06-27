import { useAppContext } from '@contexts';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  message,
} from 'antd';
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
  CustomerServiceOutlined,
  ToolOutlined,
  SafetyOutlined,
  PlaySquareOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { callLogout } from '@/services/apis';
import useMessage from '@/hooks/useMessage';

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  const location = useLocation();
  const { user, message } = useAppContext();

  const navItems = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: <DashboardOutlined />,
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'product',
      label: 'Sản phẩm',
      icon: <ProductOutlined />,
      children: [
        {
          key: 'allproducts',
          label: 'Danh sách sản phẩm',
          onClick: () => navigate('/admin/product'),
        },
        {
          key: 'addproduct',
          label: 'Thêm sản phẩm',
          onClick: () => navigate('/admin/product/add'),
        },
      ],
    },
    {
      key: 'inventory',
      label: 'Kho hàng',
      icon: <ContainerOutlined />,
      children: [
        {
          key: 'allinventory',
          label: 'Danh sách kho hàng',
          onClick: () => navigate('/admin/warehouse'),
        },
        {
          key: 'importinventory',
          label: 'Nhập hàng',
          onClick: () => navigate('/admin/warehouse/import'),
        },
        {
          key: 'exportinventory',
          label: 'Xuất hàng',
          onClick: () => navigate('/admin/warehouse/export'),
        },
        {
          key: 'transferinventory',
          label: 'Chuyển kho',
          onClick: () => navigate('/admin/warehouse/transfer'),
        },
      ],
    },
    {
      key: 'order',
      label: 'Đơn hàng',
      icon: <ShoppingOutlined />,
      onClick: () => navigate('/admin/order'),
    },
    {
      type: 'divider',
    },
    {
      key: 'branch',
      label: 'Chi nhánh',
      icon: <HomeOutlined />,
      onClick: () => navigate('/admin/branch/management'),
    },
    {
      key: 'category',
      label: 'Danh mục',
      icon: <ShoppingOutlined />,
      onClick: () => navigate('/admin/category/management'),
    },
    {
      key: 'brand',
      label: 'Thương hiệu',
      icon: <TagsOutlined />,
      onClick: () => navigate('/admin/brand/management'),
    },
    {
      type: 'divider',
    },
    {
      key: 'user',
      label: 'Người dùng',
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/user/management'),
    },
    {
      key: 'permission',
      label: 'Phân quyền',
      icon: <SafetyOutlined />,

      children: [
        {
          key: 'role',
          label: 'Vai trò',
          onClick: () => navigate('/admin/authorization/role/management'),
        },
        {
          key: 'permission',
          label: 'Phân quyền hạn',
          onClick: () => navigate('/admin/authorization/permission/management'),
        },
        {
          key: 'user-role',
          label: 'Vai trò người dùng',
          onClick: () => navigate('/admin/authorization/roleuser/management'),
        },
      ],
    },
    {
      type: 'divider',
    },

    {
      key: 'banner',
      label: 'BANNER',
      icon: <SlidersOutlined />,
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const breadcrumbItems = [
      {
        title: <Link to="/admin/dashboard">Admin</Link>,
      },
    ];

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title =
        pathSnippets[index].charAt(0).toUpperCase() +
        pathSnippets[index].slice(1);

      if (index > 0) {
        breadcrumbItems.push({
          title: (
            <Link to={url} style={{ color: '#475569' }}>
              {title}
            </Link>
          ),
        });
      }
    });

    return breadcrumbItems;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await callLogout();
    localStorage.removeItem('access_token');
    message.success('Đăng xuất thành công');

    navigate('/');
  };

  return (
    <Layout className="w-full!">
      <Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-10! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! justify-between!">
        <div className="flex items-center space-x-4">
          <Button
            type="default"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '20px',
              width: 50,
              height: 50,

              border: `1px solid rgba(255, 255, 255, 0.25)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          <Link to="/admin/dashboard">
            <div className="flex items-end space-x-3 cursor-pointer">
              <Title
                level={1}
                className="font-bold! mb-0! font-roboto! xl:text-3xl! lg:text-2xl! md:text-2xl! text-primary!"
              >
                TechShop
              </Title>
              <Text
                type="secondary"
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                trang quản lý
              </Text>{' '}
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
            overflow: 'auto',
            height: '100vh',
            maxHeight: '100vh',
            position: 'fixed',
            left: 0,
            top: 50,
            bottom: 0,
            background: '#F1F5F9',
            borderRight: `1px solid #E2E8F0"`,
            transition: 'all 0.3s ease',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            style={{
              padding: collapsed ? '0' : '24px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: collapsed ? 'none' : '#FEFEFE',
              margin: collapsed ? '16px 8px' : '16px',
              borderRadius: collapsed ? 12 : 16,
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.08)',
              border: `1px solid #E2E8F0"`,
              transition: 'all 0.3s ease',
            }}
          >
            {collapsed ? (
              <Tooltip title="Admin User" placement="right">
                <Avatar src={user?.avatar} size={48}>
                  {/* <UserOutlined style={{ color: '#FEFEFE' }} /> */}
                </Avatar>
              </Tooltip>
            ) : (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Avatar src={user?.avatar} size={64}>
                  <UserOutlined style={{ color: '#FEFEFE' }} />
                </Avatar>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      display: 'block',
                      color: '#0F172A',
                    }}
                  >
                    {user?.name}
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    {user?.email}
                  </Text>
                </div>
              </Space>
            )}
          </div>
          <div style={{ padding: collapsed ? '0 8px' : '0 16px' }}>
            <Menu
              mode="inline"
              items={navItems}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 14,
              }}
              theme="light"
            />
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 280,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content
            style={{
              margin: '24px',
              padding: '32px',
              background: 'rgb(255, 255, 255)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              minHeight: 'calc(100vh - 112px)',
              border: `1px solid #E2E8F0"`,
            }}
          >
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{
                fontSize: 14,
                color: '#475569',
              }}
            />

            <Outlet />
            <FloatButton.Group
              trigger="click"
              size="medium"
              style={{
                insetInlineEnd: 24,
                insetBlockEnd: 24,
                transform: 'scale(1.1)',
              }}
              icon={<ToolOutlined style={{ color: '#FEFEFE' }} />}
              type="primary"
            >
              <FloatButton
                icon={<SettingOutlined />}
                tooltip="Cài đặt"
                style={{
                  backgroundColor: '#06B6D4',
                  borderColor: '#06B6D4',
                }}
                onClick={() => {
                  console.log('Cài đặt');
                }}
              />
              <FloatButton
                shape="circle"
                icon={<UserOutlined />}
                tooltip="Trang người dùng"
                type="default"
                onClick={() => navigate('/')}
              />
              <FloatButton
                shape="circle"
                icon={<LogoutOutlined />}
                tooltip="Đăng xuất"
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
