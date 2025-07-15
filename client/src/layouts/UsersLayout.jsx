import { SearchBox } from '@/components/app';
import { useEffect, useState } from 'react';
import { useAppContext } from '@contexts';
import { Login, Signup } from '@pages/app';
import { ChatBot } from '@components/users';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { UserInformation } from '@components/users';
import { BsCartFill, BsList, BsSignTurnRightFill } from 'react-icons/bs';
import {
  Layout,
  Typography,
  Button,
  Flex,
  Spin,
  Grid,
  Dropdown,
  Card,
} from 'antd';
import FooterComponent from './footer';
import ForgotPasswordModal from '@/pages/app/forgotPassword';
import Branchs from '@/services/branches';
function Header() {
  const { setShowLogin, setShowSignup, user, message, setShowForgotPassword } =
    useAppContext();
  const navigate = useNavigate();
  const [allBrands, setAllBrands] = useState([]);
  const Text = Typography;
  useEffect(() => {
    document.title = 'TechShop | Mua sắm thả ga';

    fetchBranchs();
  }, []);

  const fetchBranchs = async () => {
    try {
      const res = await Branchs.getAll();
      setAllBrands(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  ///Địa chỉ chi nhánh
  const items = allBrands.map((branch, index) => ({
    key: index.toString(),
    label: (
      <Card title={branch.name} className="p-2 sm:p-4">
        <Text strong className="block text-sm sm:text-base mb-2">
          {branch.address}
        </Text>
        <Button
          icon={<BsSignTurnRightFill />}
          className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 w-full sm:w-auto rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              const origin = `${position.coords.latitude},${position.coords.longitude}`;
              const destination = '16.163951015563573,107.69555685335028';
              const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
              window.open(url, '_blank');
            });
          }}
        >
          Xem chỉ đường
        </Button>
      </Card>
    ),
  }));

  return (
    <Layout.Header className="print:hidden! font-inter! px-4! w-full! fixed! top-0! left-0! right-0! z-10! p-10! bg-primary! flex! items-center! justify-center! border-b! border-gray-200!  sm:h-20">
      <div className="w-5/6  flex items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <Link to="/">
            <Typography.Title
              level={3}
              className="font-extrabold! text-2xl! sm:text-3xl! md:text-4xl! xl:text-4xl! cursor-pointer! text-white! m-0!"
            >
              TechShop
            </Typography.Title>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-15 w-3/5 mr-[100px]">
          <div className="hidden md:flex cursor-pointer w-[20%]">
            <Dropdown
              menu={{ items }}
              trigger={['hover']}
              className="text-white flex justify-center items-center bg-[rgb(126,22,28)]! h-[44px] rounded-full  w-full"
            >
              <Text className="text-white! text-base! flex! items-center!">
                <BsList className="mr-5 font-bold text-2xl" />
                Cửa hàng
              </Text>
            </Dropdown>
          </div>
          <div className="hidden md:flex items-center flex-1 max-w-lg w-2/3 ">
            <SearchBox />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-15">
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
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="mb:hidden"
                >
                  <rect width="44" height="44" rx="22" fill="#FECAB5"></rect>
                  <path
                    d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.95"
                    d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                    fill="#13001E"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                    fill="#F37021"
                  ></path>
                  <path
                    opacity="0.3"
                    d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                    fill="#F37021"
                  ></path>
                </svg>
              </Dropdown>
            </Flex>
          )}
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
            icon={<BsCartFill />}
            className="text-white! bg-black! hover:bg-primary/80 sm:w-full! w-[44px]! h-[44px]!  rounded-full!  border-none "
          >
            <span className="hidden lg:inline ml-2 ">Giỏ hàng</span>
          </Button>
        </div>
      </div>

      <div className="md:hidden  absolute top-full left-0 right-0 bg-primary border-b border-gray-200 px-[30px] py-3">
        <SearchBox />
      </div>
    </Layout.Header>
  );
}

function UsersLayout() {
  const { showLogin, showSignup, loading, setLoading, showForgotPassword } =
    useAppContext();

  return (
    <Layout className="font-inter! relative! flex! flex-col! items-center!">
      <Header />

      {loading ? (
        <Spin />
      ) : (
        <Layout.Content className="w-5/6! bg-[#f3f4f6]! min-h-screen!  mt-[120px]!  md:mt-[60px]!  flex flex-col items-center rounded-[10px]">
          <Outlet />
          {showLogin && <Login />}
          {showSignup && <Signup />}
          {showForgotPassword && <ForgotPasswordModal />}
          <ChatBot />
        </Layout.Content>
      )}

      <FooterComponent />
    </Layout>
  );
}

export default UsersLayout;
