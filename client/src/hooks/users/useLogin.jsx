import Users from '@services/users';
import { useAppContext } from '@/contexts';
import { useNavigate } from 'react-router-dom';

function useLogin(message) {
  const navigate = useNavigate();
  const { setShowLogin } = useAppContext();

  const handleLogin = (user) => {
    const usersService = new Users();

    message.loading('Đang đăng nhập');

    usersService
      .login(user)
      .then((response) => {
        message.destroyLoading();
        if (response.status === 201) {
          const accessToken = response.data.data.access_token;
          navigate('/');
          setShowLogin(false);
          localStorage.setItem('access_token', accessToken);
        }
        message.success('Đăng nhập thành công');
      })
      .catch((error) => {
        message.destroyLoading();
        message.error(`Lỗi: ${error.message}`);
      });
  };

  return { handleLogin };
}

export default useLogin;
