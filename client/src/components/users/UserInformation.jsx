import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@contexts';
import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Avatar, Flex, Typography, Skeleton } from 'antd';

function UserInformation() {
  const { user, logout, loading } = useAppContext();
  console.log('user', user?.avatar);
  function renderInformation() {
    if (loading) {
      return (
        <>
          <Skeleton.Avatar
            active={loading}
            size="default"
            shape="circle"
            className="w-34! h-34!"
          />
          <Skeleton.Input
            active={loading}
            className="w-100! h-30!"
            size="small"
          />
        </>
      );
    }

    return (
      <>
        <Avatar
          src={user.avatar}
          icon={<UserOutlined />}
          className="w-34! h-34!"
        />
        <Typography.Text className="text-base! font-normal!">
          {user?.name}
        </Typography.Text>
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
