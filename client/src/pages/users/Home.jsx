import { Carousel, Image, Spin, Typography, Flex, Row, Col, Card } from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import Categories from '@services/categories';
import { PreviewListProducts } from '@components/products';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { callFetchBanners } from '@/services/apis';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const fakeBanners = {
    main: [
      {
        id: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop',
        title: 'MacBook Pro 2024',
        description: 'Sức mạnh vượt trội cho mọi công việc',
      },
      {
        id: 2,
        imageUrl:
          'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=1200&h=600&fit=crop',
        title: 'iPhone 15 Pro Max',
        description: 'Đột phá công nghệ, thiết kế hoàn hảo',
      },
      {
        id: 3,
        imageUrl:
          'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&h=600&fit=crop',
        title: 'Gaming Laptop',
        description: 'Trải nghiệm game đỉnh cao',
      },
    ],
    promo: [
      {
        id: 4,
        imageUrl:
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=300&fit=crop',
        title: 'Giảm giá 50%',
        description: 'Accessories & Phụ kiện',
      },
      {
        id: 5,
        imageUrl:
          'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=300&fit=crop',
        title: 'Mua 1 tặng 1',
        description: 'Tai nghe & Loa bluetooth',
      },
      {
        id: 6,
        imageUrl:
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop',
        title: 'Trả góp 0%',
        description: 'Áp dụng cho tất cả sản phẩm',
      },
    ],
    feature: [
      {
        id: 7,
        imageUrl:
          'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop',
        title: 'Bảo hành 2 năm',
        description: 'Cam kết chất lượng',
      },
      {
        id: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=300&fit=crop',
        title: 'Giao hàng 24h',
        description: 'Miễn phí toàn quốc',
      },
    ],
  };

  async function fetchCategories() {
    try {
      const categories = await Categories.getAll();
      setCategories(categories);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function fetchProducts() {
    try {
      const products = await Products.getAll();
      setProducts(products.result);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function fetchBanner() {
    try {
      const response = await callFetchBanners();
      const allBanners = response.data.data;

      const now = new Date();

      const validBanners = allBanners.filter((banner) => {
        const start = new Date(banner.startDate);
        const end = new Date(banner.endDate);
        return (
          banner.isActive && !banner.isDeleted && now >= start && now <= end
        );
      });

      const mainBanners = validBanners.filter(
        (b) => b.position === 'HOME_MAIN',
      );
      const promoBanners = validBanners.filter(
        (b) => b.position === 'HOME_PROMO',
      );
      const featureBanners = validBanners.filter(
        (b) => b.position === 'HOME_FEATURE',
      );

      setMainBanners(mainBanners.length > 0 ? mainBanners : fakeBanners.main);
      setPromoBanners(
        promoBanners.length > 0 ? promoBanners : fakeBanners.promo,
      );
      // setFeatureBanners(
      //   featureBanners.length > 0 ? featureBanners : fakeBanners.feature,
      // );
    } catch (error) {
      console.error('Lỗi khi fetch banner:', error.message);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBanner();
  }, []);

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className={`absolute -right-5 lg:-right-1 h-[60px] w-[60px] rounded-l-full flex items-center justify-center hover:opacity-80 bg-white/30 backdrop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white   cursor-pointer shadow-lg p-7 lg:p-7 transition-all text-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <RightOutlined className="font-bold" />
      </button>
    );
  }

  function CustomPrevArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className={`absolute -left-5 lg:-left-1 h-[60px] w-[60px] rounded-r-full flex items-center justify-center hover:opacity-80 bg-white/30 backdrop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white cursor-pointer shadow-lg p-7 lg:p-7 transition-all text-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <LeftOutlined className="font-bold" />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-4 lg:px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-8 xl:px-12">
      <div className="w-full mb-8">
        <section className="flex justify-between items-center">
          <Row
            gutter={[16, 16]}
            className="relative! w-full!   mx-auto! mt-8 lg:mt-20 mb-12 lg:mb-16"
          >
            <Col xs={0} sm={0} md={3} lg={4} xl={5}>
              <Card
                bordered={false}
                className="h-full! sm:h-[200px] md:h-[300px] lg:h-[400px] bg-gray-100 flex justify-center items-center"
              >
                <Typography.Text className="text-gray-400">
                  Đây là cái menu dì dì đó để dô cho đở tróng
                </Typography.Text>
              </Card>
            </Col>

            <Col span={14} className="flex! justify-center! items-center! p-0!">
              <div
                bordered={false}
                className="w-full! h-full! p-0!"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Carousel
                  arrows
                  autoplay={{ dotDuration: true }}
                  autoplaySpeed={5000}
                  className="rounded-md! overflow-hidden! w-full! h-full! "
                  nextArrow={<CustomNextArrow />}
                  prevArrow={<CustomPrevArrow />}
                  dotPosition="bottom"
                  dotStyle={{ background: '#ff5900' }}
                  activeDotStyle={{ background: '#ff5900' }}
                >
                  {mainBanners.map((banner, index) => (
                    <div
                      key={index}
                      className="flex justify-center items-center h-full w-full"
                    >
                      <Image
                        src={banner.imageUrl}
                        preview={false}
                        className="w-full! h-full! object-cover! rounded-md!"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            </Col>

            <Col xs={0} sm={0} md={3} lg={4} xl={5}>
              <Row className="flex!">
                {promoBanners.map((banner, index) => (
                  <Col
                    key={index}
                    span={24}
                    className=" flex! h-1/3! justify-center! items-center! mb-4!"
                  >
                    <Image
                      src={banner.imageUrl}
                      preview={false}
                      className="object-cover! rounded-md!"
                    />
                  </Col>
                ))}
              </Row>
            </Col>

            <Col span={24}>
              <Image
                preview={false}
                src="https://cdn2.cellphones.com.vn/insecure/rs:fill:1200:75/q:90/plain/https://dashboard.cellphones.com.vn/storage/Special-si-tu.gif"
                className="w-full! rounded-[10px]"
              />
            </Col>
          </Row>
        </section>
        <section className="w-full mb-8">
          <Row gutter={[16, 16]} justify="center">
            <Flex gap={12} wrap="wrap" justify="center">
              {categories.map((category, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      const id = category._id;
                      navigate(`/product/all/${id}`);
                    }}
                    className="bg-white group cursor-pointer gap-8 flex w-170 p-16 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-[50%] flex justify-start">
                      <Typography.Text
                        strong
                        className="text-base! font-bold! w-[100%]!"
                      >
                        {category.name}
                      </Typography.Text>
                    </div>
                    <div className="flex-1">
                      <Image
                        preview={false}
                        className="group-hover:scale-130! transition-all! rounded-2xl"
                        src={category.logo || 'https://via.placeholder.com/150'}
                      />
                    </div>
                  </div>
                );
              })}
            </Flex>
          </Row>
        </section>

        <section className="w-full">
          {categories.map((category, index) => {
            const filteredProducts = products.filter((product) => {
              return product.category.name === category.name;
            });

            if (filteredProducts.length > 0)
              return (
                <PreviewListProducts
                  key={index}
                  loading={loading}
                  category={category}
                  products={filteredProducts}
                  title={category.name}
                />
              );
          })}
        </section>
      </div>
    </div>
  );
}

export default Home;
