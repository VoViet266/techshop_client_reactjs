import { useAppContext } from '@contexts';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
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
  Flex,
} from 'antd';
import {
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
import '@styles/admin-layout.css';
import { useEffect, useMemo, useState } from 'react';
import { callLogout } from '@/services/apis';
import { hasPermission } from '@/helpers';
import { Actions, Subjects } from '@/constants/permissions';
import { AvatarDefault } from '@/components/app';

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLast, setIsLast] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, message, permissions } = useAppContext();

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

      hasPermission(permissions, Subjects.Product, Actions.Read) &&
        ({ type: 'divider' },
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
            hasPermission(permissions, Subjects.Product, Actions.Create) && {
              key: 'addproduct',
              label: 'Thêm sản phẩm',
              onClick: () => {
                navigate('/admin/product/add');
                setDrawerVisible(false);
              },
            },
          ],
        }),
      hasPermission(permissions, Subjects.Inventory, Actions.Read) && {
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
          hasPermission(permissions, Subjects.Inventory, Actions.Create) && {
            key: 'importinventory',
            label: 'Nhập hàng',
            onClick: () => {
              navigate('/admin/warehouse/import');
              setDrawerVisible(false);
            },
          },
          hasPermission(permissions, Subjects.Inventory, Actions.Create) && {
            key: 'exportinventory',
            label: 'Xuất hàng',
            onClick: () => {
              navigate('/admin/warehouse/export');
              setDrawerVisible(false);
            },
          },
          hasPermission(permissions, Subjects.Transfer, Actions.Read) && {
            key: 'transferinventory',
            label: 'Chuyển kho',
            onClick: () => {
              navigate('/admin/warehouse/transfer');
              setDrawerVisible(false);
            },
          },
        ],
      },
      hasPermission(permissions, Subjects.Order, Actions.Read) && {
        key: 'order',
        label: 'Đơn hàng',
        icon: <ShoppingOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/order');
          setDrawerVisible(false);
        },
      },

      hasPermission(permissions, Subjects.Branch, Actions.Read) &&
        ({
          type: 'divider',
        },
        {
          key: 'branch',
          label: 'Chi nhánh',
          icon: <BranchesOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
          onClick: () => {
            navigate('/admin/branch/management');
            setDrawerVisible(false);
          },
        }),
      hasPermission(permissions, Subjects.Category, Actions.Read) && {
        key: 'category',
        label: 'Danh mục',
        icon: <ShoppingOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/category/management');
          setDrawerVisible(false);
        },
      },
      hasPermission(permissions, Subjects.Brand, Actions.Read) && {
        key: 'brand',
        label: 'Thương hiệu',
        icon: <TagsOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
        onClick: () => {
          navigate('/admin/brand/management');
          setDrawerVisible(false);
        },
      },

      hasPermission(permissions, Subjects.User, Actions.Read) &&
        ({
          type: 'divider',
        },
        {
          key: 'user',
          label: 'Người dùng',
          icon: <UserOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
          onClick: () => {
            navigate('/admin/user/management');
            setDrawerVisible(false);
          },
        }),
      {
        key: 'permissions',
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

      hasPermission(permissions, Subjects.Benefit, Actions.Read) &&
        ({
          type: 'divider',
        },
        {
          key: 'policy',
          label: 'Chính sách ',
          icon: <SafetyOutlined style={{ color: '#dc2626', fontSize: 15 }} />,
          children: [
            {
              key: 'warranty',
              label: 'Chính sách bảo hành',
              onClick: () => {
                navigate('/admin/policy/warranty/management');
                setDrawerVisible(false);
              },
            },
            {
              key: 'promotion',
              label: 'Khuyến mãi',
              onClick: () => {
                navigate('/admin/policy/promotion/management');
                setDrawerVisible(false);
              },
            },
          ],
        }),
      hasPermission(permissions, Subjects.Banner, Actions.Read) && {
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
    <div className="h-full flex flex-col">
      <div
        className={`
        text-center flex justify-center items-center
        ${collapsed && !isMobile ? 'my-4 mx-2' : 'my-[16px] mx-6'}
      `}
      >
        {collapsed && !isMobile ? (
          <Tooltip title="Admin User" placement="right">
            {user?.avatar ? (
              <Avatar src={user?.avatar} size={48} />
            ) : (
              <AvatarDefault width={48} height={48} />
            )}
          </Tooltip>
        ) : (
          <div className="w-full space-y-2">
            <div className="flex justify-center">
              {user?.avatar ? (
                <Avatar src={user?.avatar} size={48} />
              ) : (
                <AvatarDefault width={48} height={48} />
              )}
            </div>
            <div className="text-center">
              <div className="text-slate-900 font-semibold text-base block">
                {user?.name}
              </div>
              <div className="text-slate-500 text-xs">{user?.email}</div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`
        flex-1 overflow-y-auto
        ${collapsed && !isMobile ? 'px-2' : 'px-4'}
      `}
      >
        <Menu
          mode="inline"
          items={navItems}
          className="border-none bg-transparent text-sm"
          theme="light"
        />
      </div>
      <div className="p-4 mt-auto">
        <Button
          type="default"
          className="w-full!  border-primary! text-primary! hover:bg-primary! hover:text-white! hover:shadow-xl! rounded-lg!"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          {collapsed && !isMobile ? null : 'Đăng xuất'}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout className="w-full ">
      <Header
        className="font-inter!"
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
          height: isMobile ? 56 : 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center space-x-4">
          <Button
            type="default"
            className="shadow-none! bg-gray-100! rounded-lg! mr-10!"
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
              overflow: 'hidden',
              height: 'calc(100vh - 64px)',
              position: 'fixed',
              left: 0,
              top: 64,
              background: 'rgb(255, 255, 255)',
              borderRight: `1px solid #E2E8F0`,
              transition: 'all 0.3s ease',

              zIndex: 1000,
            }}
          >
            <div
              style={{
                height: '100%',
                overflow: 'auto',
              }}
            >
              <SidebarContent />
            </div>
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
            styles={{
              body: {
                padding: 0, // Loại bỏ padding mặc định
                height: '100%',
                overflow: 'auto',
              },
            }}
          >
            <SidebarContent />
          </Drawer>
        )}

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
            transition: 'margin-left 0.2s',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Content
            style={{
              // margin: isMobile ? '16px' : '24px',
              padding: isMobile ? '5x' : '10px',
              background: '#f5f5f5',
              // borderRadius: 10,
              // boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              minHeight: 'calc(100vh - 64px - 48px)', // Tính toán chính xác
              // border: `1px solid #E2E8F0`,
              overflow: 'auto', // Cho phép scroll nội dung chính
            }}
          >
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
