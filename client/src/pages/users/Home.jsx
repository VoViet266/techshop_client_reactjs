import { Carousel, Image, Spin, Typography, Flex, Row, Col, Card } from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import Categories from '@services/categories';
import { PreviewListProducts } from '@components/products';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { callFetchBanners } from '@/services/apis';
import { DotDuration } from 'antd/es/carousel/style';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [featureBanners, setFeatureBanners] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback banners for development/testing
  const fallbackBanners = {
    main: [
      {
        id: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop',
        title: 'MacBook Pro 2024',
        description: 'Sức mạnh vượt trội cho mọi công việc',
        link: '/products/macbook',
      },
      {
        id: 2,
        imageUrl:
          'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=1200&h=600&fit=crop',
        title: 'iPhone 15 Pro Max',
        description: 'Đột phá công nghệ, thiết kế hoàn hảo',
        link: '/products/iphone',
      },
      {
        id: 3,
        imageUrl:
          'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&h=600&fit=crop',
        title: 'Gaming Laptop',
        description: 'Trải nghiệm game đỉnh cao',
        link: '/products/gaming',
      },
    ],
    promo: [
      {
        id: 4,
        imageUrl:
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=300&fit=crop',
        title: 'Giảm giá 50%',
        description: 'Accessories & Phụ kiện',
        link: '/promotions/accessories',
      },
      {
        id: 5,
        imageUrl:
          'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=300&fit=crop',
        title: 'Mua 1 tặng 1',
        description: 'Tai nghe & Loa bluetooth',
        link: '/promotions/audio',
      },
      {
        id: 6,
        imageUrl:
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=300&fit=crop',
        title: 'Trả góp 0%',
        description: 'Áp dụng cho tất cả sản phẩm',
        link: '/promotions/installment',
      },
    ],
    // feature: [
    //   {
    //     id: 7,
    //     imageUrl:
    //       'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop',
    //     title: 'Bảo hành 2 năm',
    //     description: 'Cam kết chất lượng',
    //     link: '/warranty',
    //   },
    //   {
    //     id: 8,
    //     imageUrl:
    //       'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=300&fit=crop',
    //     title: 'Giao hàng 24h',
    //     description: 'Miễn phí toàn quốc',
    //     link: '/shipping',
    //   },
    // ],
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const categories = await Categories.getAll();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await Products.getAll();
      setProducts(response.result || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch banners with better error handling
  const fetchBanners = async () => {
    try {
      const response = await callFetchBanners();
      const allBanners = response?.data?.data || [];

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

      // Use fallback if no banners available
      setMainBanners(
        mainBanners.length > 0 ? mainBanners : fallbackBanners.main,
      );
      console.log('mainBanners', mainBanners);
      setPromoBanners(
        promoBanners.length > 0 ? promoBanners : fallbackBanners.promo,
      );
      setFeatureBanners(
        featureBanners.length > 0 ? featureBanners : fallbackBanners.feature,
      );
    } catch (error) {
      console.error('Error fetching banners:', error.message);
      setMainBanners(fallbackBanners.main);
      setPromoBanners(fallbackBanners.promo);
      setFeatureBanners(fallbackBanners.feature);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchCategories(), fetchProducts(), fetchBanners()]);
    };

    initializeData();
  }, []);

  // Custom carousel arrows
  const CustomNextArrow = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -right-5 lg:-right-1 h-[60px] w-[60px] rounded-l-full flex items-center justify-center hover:opacity-80 bg-white/30 backdrop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white cursor-pointer shadow-lg transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Next slide"
    >
      <RightOutlined className="text-lg font-bold" />
    </button>
  );

  const CustomPrevArrow = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -left-5 lg:-left-1 h-[60px] w-[60px] rounded-r-full flex items-center justify-center hover:opacity-80 bg-white/30 backdrop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white cursor-pointer shadow-lg transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Previous slide"
    >
      <LeftOutlined className="text-lg font-bold" />
    </button>
  );

  const handleBannerClick = (banner) => {
    if (banner.link) {
      navigate(banner.link);
    }
  };
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <section className="w-full px-4 lg:px-8 xl:px-12 py-4 lg:py-8">
        <Row gutter={[16, 16]} className="w-full! mx-auto">
          <Col xs={0} sm={0} md={4} lg={4} xl={5}>
            <Card
              className="h-full bg-white shadow-sm border-0"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="space-y-3">
                {/* {categories.slice(0, 8).map((category) => (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/product/all/${category._id}`)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Image
                      src={category.logo || 'https://via.placeholder.com/24'}
                      alt={category.name}
                      width={24}
                      height={24}
                      preview={false}
                      className="rounded"
                    />
                    <Typography.Text className="text-sm text-gray-700">
                      {category.name}
                    </Typography.Text>
                  </div>
                ))} */}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={14} lg={14} xl={14}>
            <div
              className="relative h-[200px] md:h-[300px] lg:h-[400px] rounded-lg overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Carousel
                arrows
                autoplay={{ dotDuration: true }}
                autoplaySpeed={5000}
                infinite
                slidesToShow={1}
                nextArrow={<CustomNextArrow />}
                prevArrow={<CustomPrevArrow />}
                dotPosition="bottom"
                className="h-full"
              >
                {mainBanners.map((banner, index) => (
                  <div key={index} className="h-full w-full">
                    <div
                      className="relative h-full w-full cursor-pointer"
                      onClick={() => handleBannerClick(banner)}
                    >
                      <Image
                        src={banner.imageUrl}
                        alt={`Banner ${index}`}
                        preview={false}
                        className="w-full h-full object-contain!"
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </Col>

          <Col xs={0} sm={0} md={6} lg={6} xl={5}>
            <div className="space-y-4 h-[200px] md:h-[300px] lg:h-[400px]">
              {promoBanners.slice(0, 3).map((banner, index) => (
                <div
                  key={banner.id}
                  className="h-1/3 cursor-pointer group"
                  onClick={() => handleBannerClick(banner)}
                >
                  <div className="relative h-full w-full rounded-lg overflow-hidden ">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      preview={false}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="text-center text-white px-2">
                      <Typography.Text
                        strong
                        className="text-white block text-sm"
                      >
                        {banner.title}
                      </Typography.Text>
                      <Typography.Text className="text-white/90 text-xs">
                        {banner.description}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </section>
      <section className="w-full px-4 lg:px-8 xl:px-12 mb-8">
        <div className="max-w-7xl mx-auto">
          <Image
            preview={false}
            src="https://cdn2.cellphones.com.vn/insecure/rs:fill:1200:75/q:90/plain/https://dashboard.cellphones.com.vn/storage/Special-si-tu.gif"
            alt="Special promotion"
            className="w-full rounded-lg shadow-sm"
          />
        </div>
      </section>
      <section className="w-full px-4 lg:px-8 xl:px-12 mb-12">
        <div className="mx-auto">
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
                    className="bg-white group cursor-pointer gap-8 flex w-200 p-16 rounded-xl hover:shadow-md transition-shadow shadow-sm"
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
        </div>
      </section>
      <section className="w-full px-4 lg:px-8 xl:px-12 pb-12">
        <div className=" mx-auto space-y-12">
          {categories.map((category) => {
            const filteredProducts = products.filter(
              (product) => product.category?.name === category.name,
            );

            if (filteredProducts.length === 0) return null;

            return (
              <PreviewListProducts
                key={category._id}
                loading={false}
                category={category}
                products={filteredProducts}
                title={category.name}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
