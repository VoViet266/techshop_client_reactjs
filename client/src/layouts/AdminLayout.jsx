import { useAppContext } from "@contexts";
import { Link, Outlet } from "react-router-dom";
import { Layout, Typography, Flex } from "antd";
import { HomeOutlined, ProductOutlined } from "@ant-design/icons";

function AdminLayout() {
  const { Title, Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;
  const { sideBarSelectedTab, setSideBarSelectedTab } = useAppContext();

  function highlight(text) {
    if (sideBarSelectedTab === text) return "text-primary!";
    return "text-black! hover:text-primary!";
  }

  return (
    <Layout className="w-full!">
      <Header className="font-roboto! xl:px-50! lg:px-30! md:px-20! w-full! fixed! top-0! left-0! right-0! z-100! bg-white! border-b! border-b-gray-300! h-60! flex! items-center! justify-between!">
        <Link to="/dashboard">
          <Title
            level={3}
            className="font-bold! font-roboto! xl:text-3xl! lg:text-2xl! md:text-2xl! m-0! text-primary!"
          >
            TechShop
          </Title>
        </Link>
      </Header>
      <Layout className="mt-60! min-h-500!">
        <Sider
          width="300px"
          className="xl:pl-50! max-w-[40%]! pt-20 w-300! border-r! fixed! top-60! left-0! bottom-0! border-r-gray-300! bg-white! flex! flex-col! gap-10!"
        >
          <Flex vertical gap={10}>
            <Link to="/dashboard">
              <Flex gap={6} onClick={() => setSideBarSelectedTab("Trang chủ")}>
                <Text
                  className={`font-roboto! text-base! flex! gap-6! font-medium! ${highlight(
                    "Trang chủ"
                  )}`}
                >
                  <HomeOutlined />
                  Trang chủ
                </Text>
              </Flex>
            </Link>
            <Flex vertical>
              <Flex
                gap={6}
                onClick={() => setSideBarSelectedTab("Quản lý sản phẩm")}
              >
                <Text className="font-roboto! text-base! flex! items-center! gap-6! cursor-pointer! font-medium!">
                  <ProductOutlined />
                  Quản lý sản phẩm
                </Text>
              </Flex>
              <Flex vertical align="start" gap={10} className="ml-30! mt-10!">
                <Link to="/product/add">
                  <Text
                    onClick={() => setSideBarSelectedTab("Thêm sản phẩm")}
                    className={`${highlight("Thêm sản phẩm")} cursor-pointer! font-roboto! font-medium! hover:text-primary!`}
                  >
                    Thêm sản phẩm
                  </Text>
                </Link>
                <Link to="/product/all">
                  <Text
                    onClick={() => setSideBarSelectedTab("Danh sách sản phẩm")}
                    className={`${highlight("Danh sách sản phẩm")} cursor-pointer! font-roboto! font-medium! hover:text-primary!`}
                  >
                    Danh sách sản phẩm
                  </Text>
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Sider>
        <Content className="bg-white! p-20! ml-300!">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
