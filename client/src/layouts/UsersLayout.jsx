import {
  SearchBox,
  ErrorToast,
  LoadingToast,
  SuccessToast,
} from '@/components/app';
import { useEffect } from 'react';
import { useAppContext } from '@contexts';
import { Login, Signup } from '@pages/app';
import { Outlet, Link } from 'react-router-dom';
import { UserInformation } from '@components/users';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { Layout, Typography, Button, Flex, FloatButton } from 'antd';

function Header() {
  const { setShowLogin, setShowSignup } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Mua sắm thả ga';
  }, []);

  return (
    <Layout.Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-10! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! justify-between!">
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
    </Layout.Header>
  );
}

function UsersLayout() {
  const {
    message,
    showLogin,
    showSignup,
    toastLoading,
    loadingError,
    loadingSuccess,
  } = useAppContext();

  return (
    <Layout className="font-roboto! relative! flex! flex-col! items-center!">
      {message.contextHolder}
      <Header />
      <Layout.Content className="w-full! bg-white! mt-60! flex! flex-col! items-center!">
        <Outlet />
        {showLogin && <Login />}
        {showSignup && <Signup />}
        <FloatButton
          type="primary"
          shape="circle"
          icon={<CustomerServiceOutlined />}
        />
      </Layout.Content>
      {loadingError && <ErrorToast />}
      {toastLoading && <LoadingToast />}
      {loadingSuccess && <SuccessToast />}
      {/* <footer>Footer</footer> */}
    </Layout>
  );
}

export default UsersLayout;
