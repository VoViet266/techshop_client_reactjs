import { useEffect } from 'react';
import Users from '@services/users';
import { useAppContext } from '@/contexts';
import { useNavigate } from 'react-router-dom';

function useLogin(message) {
  const navigate = useNavigate();
  const { setShowLogin, notification } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Đăng nhập';
  }, []);

  async function handleLogin(value) {
    const usersService = new Users();
    message.loading({ content: 'Đăng nhập...', key: 'login' });

    try {
      const res = await usersService.login(value);

      if (res.data.data.access_token) {
        message.success({ content: 'Đăng nhập thành công', key: 'login' });

        localStorage.setItem('access_token', res.data.data.access_token);
        setShowLogin(false);
        window.location.reload();
        if (response.data.data.role === 'admin') {
          message.success('Đăng nhập thành công');
          navigate('/admin/dashboard');
        }
      } else {
        message.error({
          message: 'Đăng nhập thất bại',
          content: `Đăng nhập không thành công do sai tài khoản/mật khẩu!!`,
          key: 'login',
        });
      }
    } catch (error) {
      message.destroy();
      message.error('Đăng nhập thất bại');

      if (
        error.response.data.statusCode === 401 ||
        error.response.data.statusCode === 400
      ) {
        notification.warning({
          message: 'Đăng nhập thất bại',
          description: 'Sai tên đăng nhập hoặc mật khẩu!',
        });
      }
    } finally {
      message.destroy();
    }
  }

  return { handleLogin };
}

export default useLogin;
