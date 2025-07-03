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
  Drawer,
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
  BranchesOutlined,
  LockOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { callLogout } from '@/services/apis';
import useMessage from '@/hooks/useMessage';

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, message } = useAppContext();

  const navItems = useMemo(
    () => [
      {
        key: 'dashboard',
        label: 'Tổng quan',
        icon: <BarChartOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/dashboard');
          setDrawerVisible(false);
        },
      },
      { type: 'divider' },
      {
        key: 'product',
        label: 'Sản phẩm',
        icon: <ProductOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        children: [
          {
            key: 'allproducts',
            label: 'Danh sách sản phẩm',
            onClick: () => {
              navigate('/admin/product');
              setDrawerVisible(false);
            },
          },
          {
            key: 'addproduct',
            label: 'Thêm sản phẩm',
            onClick: () => {
              navigate('/admin/product/add');
              setDrawerVisible(false);
            },
          },
        ],
      },
      {
        key: 'inventory',
        label: 'Kho hàng',
        icon: <ContainerOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        children: [
          {
            key: 'allinventory',
            label: 'Danh sách kho hàng',
            onClick: () => {
              navigate('/admin/warehouse');
              setDrawerVisible(false);
            },
          },
          {
            key: 'importinventory',
            label: 'Nhập hàng',
            onClick: () => {
              navigate('/admin/warehouse/import');
              setDrawerVisible(false);
            },
          },
          {
            key: 'exportinventory',
            label: 'Xuất hàng',
            onClick: () => {
              navigate('/admin/warehouse/export');
              setDrawerVisible(false);
            },
          },
          {
            key: 'transferinventory',
            label: 'Chuyển kho',
            onClick: () => {
              navigate('/admin/warehouse/transfer');
              setDrawerVisible(false);
            },
          },
        ],
      },
      {
        key: 'order',
        label: 'Đơn hàng',
        icon: <ShoppingOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/order');
          setDrawerVisible(false);
        },
      },
      { type: 'divider' },
      {
        key: 'branch',
        label: 'Chi nhánh',
        icon: <BranchesOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/branch/management');
          setDrawerVisible(false);
        },
      },
      {
        key: 'category',
        label: 'Danh mục',
        icon: <ShoppingOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/category/management');
          setDrawerVisible(false);
        },
      },
      {
        key: 'brand',
        label: 'Thương hiệu',
        icon: <TagsOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/brand/management');
          setDrawerVisible(false);
        },
      },
      { type: 'divider' },
      {
        key: 'user',
        label: 'Người dùng',
        icon: <UserOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/user/management');
          setDrawerVisible(false);
        },
      },
      {
        key: 'permission',
        label: 'Phân quyền',
        icon: <LockOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        children: [
          {
            key: 'role',
            label: 'Vai trò',
            onClick: () => {
              navigate('/admin/authorization/role/management');
              setDrawerVisible(false);
            },
          },
          {
            key: 'permission',
            label: 'Phân quyền hạn',
            onClick: () => {
              navigate('/admin/authorization/permission/management');
              setDrawerVisible(false);
            },
          },
          {
            key: 'user-role',
            label: 'Vai trò người dùng',
            onClick: () => {
              navigate('/admin/authorization/roleuser/management');
              setDrawerVisible(false);
            },
          },
        ],
      },
      { type: 'divider' },
      {
        key: 'banner',
        label: 'Banner',
        icon: <SlidersOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/banner/management');
          setDrawerVisible(false);
        },
      },
    ],
    [navigate],
  );

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
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 1200) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); // Call on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await callLogout();
    localStorage.removeItem('access_token');
    message.success('Đăng xuất thành công');
    navigate('/');
  };

  const handleMenuToggle = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const SidebarContent = () => (
    <>
      <div
        style={{
          padding: collapsed && !isMobile ? '0' : '24px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: collapsed && !isMobile ? 'none' : '#FEFEFE',
          margin: collapsed && !isMobile ? '16px 8px' : '16px',
          borderRadius: collapsed && !isMobile ? 12 : 16,
          boxShadow: '0 4px 16px rgba(79, 70, 229, 0.08)',
          border: `1px solid #E2E8F0`,
          transition: 'all 0.3s ease',
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip title="Admin User" placement="right">
            <Avatar src={user?.avatar} size={48}>
              <UserOutlined style={{ color: '#FEFEFE' }} />
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
      <div style={{ padding: collapsed && !isMobile ? '0 8px' : '0 16px' }}>
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
    </>
  );

  return (
    <Layout className="w-full">
      <Header
        className="font-roboto"
        style={{
          padding: isMobile ? '0 16px' : '0 24px',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e8e8e8',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center space-x-4">
          <Button
            type="default"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleMenuToggle}
            style={{
              fontSize: isMobile ? '16px' : '20px',
              width: isMobile ? 40 : 50,
              height: isMobile ? 40 : 50,
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
                style={{
                  fontWeight: 'bold',
                  margin: 0,
                  fontFamily: 'Roboto',
                  color: '#dc2626',
                  fontSize: isMobile ? '20px' : '40px',
                }}
              >
                TechShop
              </Title>
              {!isMobile && (
                <Text
                  type="secondary"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  trang quản lý
                </Text>
              )}
            </div>
          </Link>
        </div>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        {!isMobile && (
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
              top: 64,
              bottom: 0,
              background: 'rgb(255, 255, 255)',
              borderRight: `1px solid #E2E8F0`,
              transition: 'all 0.3s ease',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <SidebarContent />
          </Sider>
        )}
        {isMobile && (
          <Drawer
            title={
              <div className="flex items-center space-x-3">
                <Title level={4} style={{ margin: 0, color: '#dc2626' }}>
                  TechShop
                </Title>
                <Text type="secondary">Admin</Text>
              </div>
            }
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
          >
            <SidebarContent />
          </Drawer>
        )}

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content
            style={{
              margin: isMobile ? '16px' : '24px',
              padding: isMobile ? '16px' : '32px',
              background: 'rgb(255, 255, 255)',
              borderRadius: 10,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              minHeight: 'calc(100vh - 112px)',
              border: `1px solid #E2E8F0`,
            }}
          >
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{
                fontSize: isMobile ? 12 : 14,
                color: '#475569',
                marginBottom: isMobile ? 16 : 24,
              }}
            />

            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <FloatButton.Group
        trigger="click"
        size={isMobile ? 'small' : 'medium'}
        style={{
          insetInlineEnd: isMobile ? 16 : 24,
          insetBlockEnd: isMobile ? 16 : 24,
          transform: isMobile ? 'scale(0.9)' : 'scale(1.1)',
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
    </Layout>
  );
}

export default AdminLayout;
