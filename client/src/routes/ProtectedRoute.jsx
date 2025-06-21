import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Spin, Button, Alert, Result } from 'antd';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts';

import React, { useState } from 'react';

const UnauthenticatedContent = ({ redirectUrl }) => {
  const { showLogin, setShowLogin } = useAppContext();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/');
    setShowLogin(true);
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button onClick={handleLoginClick} type="primary">
          Đang nhập
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

  if (!isAuthenticated()) {
    return <UnauthenticatedContent redirectUrl={location.pathname} />;
  }

  // Kiểm tra quyền admin nếu cần
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
