import { useAppContext } from '@/contexts';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notification } = useAppContext();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
     
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Bạn đã đăng nhập bằng tài khoản Google.',
      });
       window.location.href = '/';
    } else {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: 'Không tìm thấy mã truy cập.',
      });
    }
  }, [location, navigate]);

  return (
    <>
      <Spin size="large" fullscreen />
    </>
  );
};

export default GoogleSuccess;
