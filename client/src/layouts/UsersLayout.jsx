import { SearchBox } from '@/components/app';
import { useEffect } from 'react';
import { useAppContext } from '@contexts';
import { Login, Signup } from '@pages/app';
import { ChatBot } from '@components/users';
import { Outlet, Link } from 'react-router-dom';
import { UserInformation } from '@components/users';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { Layout, Typography, Button, Flex, FloatButton, Spin } from 'antd';
import FooterComponent from './footer';

function Header() {
  const { setShowLogin, setShowSignup } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Mua sắm thả ga';
  }, []);

  return (
    <Layout.Header className="font-roboto! px-0! w-full! fixed! top-0! left-0! right-0! z-10! bg-white! h-60! flex items-center justify-center">
      <div className="w-5/6 flex! items-center! justify-between!">
        <Link to="/">
          <Typography.Title
            level={3}
            className="font-bold! mb-0! font-roboto! xl:text-3xl! lg:text-2xl! md:text-2xl! text-primary!"
          >
            TechShop
          </Typography.Title>
        </Link>
        <SearchBox />
        {localStorage.getItem('access_token') ? (
          <UserInformation />
        ) : (
          <Flex gap={8}>
            <Button
              onClick={() => {
                setShowLogin(true);
              }}
              className="border! h-36! font-roboto! border-gray-300! text-base! font-medium! hover:text-primary! hover:border-primary! min-w-100! rounded-md! cursor-pointer!"
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setShowSignup(true);
              }}
              className="text-base! h-36! font-roboto! rounded-md! min-w-100! font-medium! bg-primary! text-white! cursor-pointer!"
            >
              Đăng ký
            </Button>
          </Flex>
        )}
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
        <Layout.Content className="w-5/6 bg-[#f5f5f5]! mt-60 flex flex-col items-center rounded-[10px]">
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
