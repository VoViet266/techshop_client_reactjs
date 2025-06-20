import { Dropdown, Space, Avatar, Flex, Typography, Skeleton } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAppContext } from "@/contexts";
function UserInformation() {
  const { user, logout, loading } = useAppContext();

  console.log("User:", user);

  const items = [
    {
      key: "1",
      label: "Tài khoản của tôi",
    },
    // {
    //   type: "divider",
    // },
    {
      key: "3",
      label: <Link to="/admin/dashboard">Quản trị viên</Link>,
    },
    {
      key: "4",
      label: "Đăng xuất",
      onClick: logout,
    },
  ];
  return (
    <Dropdown menu={{ items }}>
      <Space>
        {loading && (
          <div>
            <Skeleton />
          </div>
        )}
        {!loading && (
          <Flex align="center" gap={6} className="cursor-pointer!">
            <Avatar icon={<UserOutlined />} />
            <Typography.Text className="">{user?.name}</Typography.Text>
          </Flex>
        )}
      </Space>
    </Dropdown>
  );
}

export default UserInformation;
