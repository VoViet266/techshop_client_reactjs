import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Space,
  Typography,
  Divider,
  Image,
  Rate,
  Flex,
} from 'antd';
import { callFetchStats } from '@/services/apis';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/helpers';

function CardProduct({ product = {}, className, loading = false }) {
  const [stats, setStats] = useState({});

  const fetchStats = async () => {
    try {
      const res = await callFetchStats(product._id);
      setStats(res.data.data.data);
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Link to={`/product/${product._id}`}>
      <Card
        cover={
          <div className="h-200">
            <Image
              preview={false}
              alt="Product Image"
              className="object-fill! aspect-square! mx-auto! mt-20! min-h-full! w-[50%]! border-none! transition-all! duration-300! ease-in-out! group-hover:scale-110!"
              src={
                product?.variants?.[0]?.images?.[0] ||
                'https://cdn.tgdd.vn/Products/Images/42/329138/iphone-16-plus-hong-thumb-1-600x600.jpg'
              }
            />
          </div>
        }
        className={`group ${className} rounded-xl! min-h-400! overflow-hidden! border! hover:shadow-none!`}
      >
        <Typography.Text className="text-base! font-medium!">
          {product.name || 'Sản phẩm mới'}
        </Typography.Text>
        <div className="mt-8">
          <div className="flex flex-col items-start gap-4">
            <Flex gap={8} align="center">
              <Typography.Text
                delete
                type="secondary"
                className="text-sm! font-inter!"
              >
                {`${formatCurrency(product?.variants?.[0]?.price)}đ` || ''}
              </Typography.Text>
              <Typography.Text className="font-medium! text-primary! text-sm!">
                -{product.discount}%
              </Typography.Text>
            </Flex>
            <Typography.Text className="text-base! font-bold! font-inter!">
              {`${formatCurrency(product?.variants?.[0]?.price - product?.variants?.[0]?.price * (product?.discount / 100))}đ` ||
                'Liên hệ'}
            </Typography.Text>
            <div className="flex items-center gap-8">
              <Typography.Text className="text-sm! mb-10 font-inter! text-[#059669]!">
                Giảm{' '}
                {`${formatCurrency(product?.variants?.[0]?.price - (product?.variants?.[0]?.price - product?.variants?.[0]?.price * (product?.discount / 100)))}đ`}
              </Typography.Text>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8 mb-3">
          <Rate
            disabled
            value={stats?.averageRating ? stats?.averageRating : 5}
            className="text-base!"
          />
          <Typography.Text type="secondary">
            ({stats?.totalComments})
          </Typography.Text>
        </div>
        <Button type='primary' className='w-full! mt-8! h-40!'>Xem ngay</Button>
      </Card>
    </Link>
  );
}

export default CardProduct;
