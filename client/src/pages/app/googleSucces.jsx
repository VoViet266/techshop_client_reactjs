import { Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      navigate('/');
    } else {
      alert('Đăng nhập thất bại');
    }
  }, [location, navigate]);

  return (
    <>
      <Spin size="large" fullscreen />
    </>
  );
};

export default GoogleSuccess;
