import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts';
import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Space, Avatar, Flex, Typography, Skeleton } from 'antd';

function UserInformation() {
  const { user, logout, loading } = useAppContext();

  function renderInformation() {
    if (loading) {
      return (
        <div>
          <Skeleton />
        </div>
      );
    }

    return (
      <Flex align="center" gap={6} className="cursor-pointer!">
        <Avatar icon={<UserOutlined />} />
        <Typography.Text className="">{user?.name}</Typography.Text>
      </Flex>
    );
  }

  const items = [
    {
      key: '1',
      label: 'Tài khoản của tôi',
    },
    {
      key: '3',
      label: <Link to="/admin/dashboard">Quản trị viên</Link>,
    },
    {
      key: '4',
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }}>
      <Space>
        {/* {loading && (
          <div>
            <Skeleton />
          </div>
        )}
        {!loading && (
          <Flex align="center" gap={6} className="cursor-pointer!">
            <Avatar icon={<UserOutlined />} />
            <Typography.Text className="">{user?.name}</Typography.Text>
          </Flex>
        )} */}

        {renderInformation()}
      </Space>
    </Dropdown>
  );
}

export default UserInformation;
