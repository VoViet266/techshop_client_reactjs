import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@contexts';
import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Avatar, Flex, Typography, Skeleton } from 'antd';

function UserInformation() {
  const { user, logout, loading } = useAppContext();

  function renderInformation() {
    if (loading) {
      return (
        <>
          <Skeleton.Avatar
            active={loading}
            size="default"
            shape="circle"
            className="w-40! h-40!"
          />
        </>
      );
    }

    return (
      <>
        <Avatar
          src={user?.avatar}
          icon={<UserOutlined />}
          className="w-40! h-40!"
        />
      </>
    );
  }

  const items = [
    {
      key: '1',
      label: <Link to="/account-info">Tài khoản của tôi</Link>,
    },
    {
      key: '3',
      label: <Link to="/admin/dashboard">Quản trị viên</Link>,
    },
    {
      key: '4',
      label: <Link to="/cart">Giỏ hàng</Link>,
    },
    {
      key: '5',
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }}>
      <Flex align="center" gap={6} className="h-full! cursor-pointer!">
        {renderInformation()}
      </Flex>
    </Dropdown>
  );
}

export default UserInformation;
