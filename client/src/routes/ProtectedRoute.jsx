import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts';

import { Button, Result, Spin } from 'antd';

const UnauthenticatedContent = () => {
  const { setShowLogin, loading } = useAppContext();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/');
    setShowLogin(true);
  };

  if (loading) return <Spin />;

  return (
    <Result
      status="403"
      title="403 - Không có quyền"
      subTitle="Bạn cần quyền để truy cập trang này!!"
      extra={
        <Button
          onClick={handleLoginClick}
          type="primary"
          size="large"
          style={{
            borderRadius: '8px',
            padding: '0 24px',
            height: '40px',
          }}
        >
          Đăng nhập ngay
        </Button>
      }
    />
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated() ) {
    return <UnauthenticatedContent  />;
  }

  // Kiểm tra quyền admin nếu cần
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
