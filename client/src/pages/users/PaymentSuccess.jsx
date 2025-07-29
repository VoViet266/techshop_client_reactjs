import { Link } from 'react-router-dom';
import { Flex, Typography, Button } from 'antd';
import { BsCheckCircleFill } from 'react-icons/bs';

function PaymentSuccess() {
  const { Title, Text } = Typography;
  return (
    <div className="bg-[#f5f5f5]! mt-40! w-full!">
      <Flex justify="space-between" className="bg-white rounded-xl p-30!">
        <Flex vertical gap={20}>
          <Title level={1} className="font-medium! mb-0!">
            Thanh toán thành công
          </Title>
          <Text className="text-[#6b7280]! text-base!">
            Cảm ơn quý khách đã tin tưởng TechShop, chúc quý khách có trải
            nghiệm mua sắm vui vẻ!
          </Text>
          <Link to="/">
            <Button type="primary" className="rounded-full! h-40! w-150!">
              Quay về trang chủ
            </Button>
          </Link>
        </Flex>
        <div className='mr-50!'>
          <BsCheckCircleFill size={200} className='text-green-500!' />
        </div>
      </Flex>
    </div>
  );
}

export default PaymentSuccess;
