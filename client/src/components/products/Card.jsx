import { ShoppingCartOutlined } from "@ant-design/icons";
import { Card, Badge, Button, Space, Typography, Divider, Image } from "antd";

const { Text, Title } = Typography;

function CardProduct() {
  return (
    <Badge.Ribbon text="Mới" color="red" className="top-10! -right-6!">
      <Card
        hoverable
        cover={
          <Image
            preview={false}
            alt="iPhone 16 Pro Max"
            className="object-fill mx-auto mt-20 w-[80%]! h-auto rounded-xl!"
            src="https://cdn.tgdd.vn/Products/Images/42/329138/iphone-16-plus-hong-thumb-1-600x600.jpg"
          />
        }
        className="w-280 rounded-xl! overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgb(245,239,239)]"
      >
        <Divider className="mt-10!" />
        <Title level={4} className="mb-8! text-[16px]! leading-1.4!">
          iPhone 16 Pro Max 256GB | Chính hãng VN/A
        </Title>
        <div className="mb-16">
          <Space direction="vertical" size={4}>
            <div className="flex items-center gap-8">
              <Text className="text-xs! text-[#52c41a]!">
                Miễn phí vận chuyển
              </Text>
            </div>
            <div className="flex items-center gap-8">
              <Text className="text-xs! text-[#1890ff]!">
                Trả góp 0% qua thẻ tín dụng
              </Text>
            </div>
          </Space>
        </div>
        <div className="mb-10">
          <div>
            <Text className="text-xl! font-bold! text-[#d32f2f]! mr-8!">
              30.000.000₫
            </Text>
            <Text delete type="secondary" className="text-sm!">
              35.290.000₫
            </Text>
          </div>
        </div>
        <Divider className="my-12!" />
        <Space direction="vertical" size={8} className="w-full!">
          <Button
            block
            size="large"
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="h-[44]! rounded-xl! font-medium! bg-red-500!"
          >
            Mua ngay
          </Button>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
}

export default CardProduct;
