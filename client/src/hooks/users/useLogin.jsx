import { useEffect } from 'react';
import Users from '@services/users';
import { useAppContext } from '@/contexts';
import { useNavigate } from 'react-router-dom';

function useLogin(message) {
  const navigate = useNavigate();
  const { setShowLogin } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Đăng nhập';
  }, []);

  function handleLogin(value) {
    const usersService = new Users();
    message.loading('Đang đăng nhập');

    usersService
      .login(value)
      .then((response) => {
        message.destroy();
        if (response.status === 201) {
          const accessToken = response.data.data.access_token;
          localStorage.setItem('access_token', accessToken);
          if (response.data.data.role === 'admin') {
            message.success('Đăng nhập thành công');
            navigate('/admin/dashboard');
          }
          window.location.reload();
        }
      })
      .catch((error) => {
        message.destroy();
        message.error(`Lỗi: ${error.message}`);
      });
  }

  return { handleLogin };
}

export default useLogin;
