import { SearchBox } from '@/components/app';
import { useEffect, useState } from 'react';
import { useAppContext } from '@contexts';
import { Login, Signup } from '@pages/app';
import { ChatBot } from '@components/users';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { UserInformation } from '@components/users';
import {
  CarOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Typography, Button, Flex, Spin, Grid, Dropdown } from 'antd';
import FooterComponent from './footer';
const { useBreakpoint } = Grid;
function Header() {
  const { setShowLogin, setShowSignup, user, message } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'TechShop | Mua sắm thả ga';
  }, []);

  return (
    <Layout.Header className="print:hidden! font-roboto! px-4! w-full! fixed! top-0! left-0! right-0! z-10! p-10! bg-white! flex! items-center! justify-center! border-b! border-gray-200!  sm:h-20">
      <div className="w-[90%]  flex items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <Link to="/">
            <Typography.Title
              level={3}
              className="font-extrabold! text-2xl! sm:text-3xl! md:text-4xl! xl:text-4xl! tracking-wider! cursor-pointer! text-primary! m-0!"
            >
              TECHSHOP
            </Typography.Title>
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-lg ">
          <SearchBox />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={() => {
              if (!user) {
                setShowLogin(true);
                message.warning('Vui lòng đăng nhập để mở giỏ hàng');
              } else {
                navigate('/cart');
              }
            }}
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            className="text-white!  hover:bg-primary/80 rounded-3xl!  !border-none p-10! mr-5!  "
          >
            <span className="hidden lg:inline ml-2 ">Giỏ hàng</span>
          </Button>

          {localStorage.getItem('access_token') ? (
            <UserInformation />
          ) : (
            <Flex gap={4} className="hidden sm:flex">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'login',
                      label: 'Đăng nhập',
                      onClick: () => setShowLogin(true),
                    },
                    {
                      key: 'signup',
                      label: 'Đăng ký',
                      onClick: () => setShowSignup(true),
                    },
                  ],
                }}
              >
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<UserOutlined />}
                  className="text-white!  hover:text-white! hover:bg-primary/80 !border-none"
                />
              </Dropdown>
            </Flex>
          )}
        </div>
      </div>

      <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 px-4 py-3">
        <SearchBox />
      </div>
    </Layout.Header>
  );
}

function UsersLayout() {
  const { showLogin, showSignup, loading, setLoading } = useAppContext();

  return (
    <Layout className="font-roboto! relative! flex! flex-col! items-center!">
      <Header />

      {loading ? (
        <Spin />
      ) : (
        <Layout.Content className="w-5/6! bg-[#f3f4f6]! mt-60 flex flex-col items-center rounded-[10px]">
          <Outlet />
          {showLogin && <Login />}
          {showSignup && <Signup />}
          <ChatBot />
        </Layout.Content>
      )}

      <FooterComponent />
    </Layout>
  );
}

export default UsersLayout;
