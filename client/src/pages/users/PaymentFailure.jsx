import { Link } from 'react-router-dom';
import { Flex, Typography, Button } from 'antd';
import { BsFillXCircleFill } from 'react-icons/bs';

function PaymentFailure() {
  const { Title, Text } = Typography;
  return (
    <div className="bg-[#f5f5f5]! mt-40! w-full!">
      <Flex justify="space-between" className="bg-white rounded-xl p-30!">
        <Flex vertical gap={20}>
          <Title level={1} className="font-medium! mb-0!">
            Thanh toán thất bại
          </Title>
          <Text className="text-[#6b7280]! text-base!">
            Rất tiếc vì chưa được phục vụ quý khách, xin hẹn gặp lại!
          </Text>
          <Link to="/">
            <Button type="primary" className="rounded-full! h-40! w-150!">
              Quay về trang chủ
            </Button>
          </Link>
        </Flex>
        <div className="mr-50!">
          <BsFillXCircleFill size={200} className="text-primary!" />
        </div>
      </Flex>
    </div>
  );
}

export default PaymentFailure;
