import {
  Carousel,
  Image,
  Spin,
  Typography,
  Flex,
  Row,
  Col,
  Card,
  Button,
  Empty,
  Skeleton,
} from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import Categories from '@services/categories';
import { PreviewListProducts } from '@components/products';

import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { callFetchBanners } from '@/services/apis';
import { DotDuration } from 'antd/es/carousel/style';
import { useAppContext } from '@/contexts';
import Recomment from '@/services/recommend';
import CardProduct from '@/components/products/Card';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [mainBanners, setMainBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [featureBanners, setFeatureBanners] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [recommentProducts, setRecommentProducts] = useState([]);
  const { user } = useAppContext();

  const fallbackBanners = {
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
  };

  const fetchCategories = async () => {
    try {
      const categories = await Categories.getAll();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await Products.getAll();
      setProducts(response.result || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

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

      setMainBanners(
        mainBanners.length > 0 ? mainBanners : fallbackBanners.main,
      );

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
  useEffect(() => {
    const fetchRecommendationsByUser = async () => {
      if (user) {
        try {
          const res = await Recomment.getRecommendationsByUser(user._id);
          setRecommentProducts(res);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error('Error fetching recommendations:', error);
        }
      } else {
        const res = await Recomment.getRecommendationsPopular();
        setRecommentProducts(res);

        setLoading(false);
      }
    };
    fetchRecommendationsByUser();
  }, [user]);

  useEffect(() => {
    document.title = 'Trang chủ';
    const initializeData = async () => {
      await Promise.all([fetchCategories(), fetchProducts(), fetchBanners()]);
    };

    initializeData();
  }, []);

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
    console.log(banner);
    if (banner.linkTo) {
      window.location.href = banner.linkTo;
    }
  };
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
        <Spin size="large" tip="Đang tải..." delay={1000} fullscreen />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen ">
      <section className="w-full my-15">
        <Row gutter={[10]} className="w-full! h-full! mx-auto!">
          <Col xs={24} sm={24} md={14} lg={14} xl={19}>
            <div
              className="relative rounded-lg overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Carousel
                arrows
                autoplay={{ dotDuration: true }}
                autoplaySpeed={5000}
                infinite
                slidesToShow={1}
                dots
                nextArrow={<CustomNextArrow />}
                prevArrow={<CustomPrevArrow />}
                dotPosition="bottom"
              >
                {mainBanners.map((banner, index) => (
                  <div
                    key={index}
                    className="relative h-[180px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[500px]  cursor-pointer"
                    onClick={() => handleBannerClick(banner)}
                  >
                    <img
                      src={banner.imageUrl}
                      alt={`Banner ${index}`}
                      className="w-full h-full object-fit"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </Col>

          <Col xs={0} sm={0} md={6} lg={6} xl={5} className="p-0! ">
            <div className="flex flex-col h-full gap-6">
              {promoBanners.slice(0, 3).map((banner, index) => (
                <div
                  key={banner.id}
                  className="h-1/3 cursor-pointer "
                  onClick={() => handleBannerClick(banner)}
                >
                  <div className="relative h-full w-full rounded-xl overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full! h-full! object-cover "
                    />
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </section>
      {!loading ? (
        <section className="w-full xl:p-20 mb-12 bg-[#ffffff] rounded-xl">
          {recommentProducts.length > 0 ? (
            <>
              <div className="flex mb-10 items-center justify-between">
                <Typography.Title
                  level={3}
                  className="font-inter! uppercase! font-bold! text-primary! ml-2! sm:ml-4! lg:ml-8! mb-0! text-lg! sm:text-xl! lg:text-2xl!"
                >
                  Sản phẩm có thể phù hợp với bạn
                </Typography.Title>
              </div>

              <Row className="w-full mx-auto" gutter={[10]}>
                {recommentProducts?.map((product, index) => (
                  <Col
                    key={index}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    xl={6}
                    className="mb-6"
                  >
                    <CardProduct
                      product={product}
                      loading={loading}
                      className="w-full transform transition-all duration-300 hover:shadow-xl"
                    />
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <div className="w-full min-h-300 flex items-center justify-center">
              <Spin />
            </div>
          )}
        </section>
      ) : (
        <section className="w-full mb-12 bg-[#ffffff] rounded-xl">
          <div className="flex mb-10 items-center justify-between">
            <Typography.Title
              level={3}
              className="font-inter! uppercase! font-extrabold!  m-10! text-primary! text-2xl"
            >
              Sản phẩm có thể phù hợp với baise
            </Typography.Title>
          </div>
          <Empty />
        </section>
      )}

      <section className="w-full">
        <div className="mx-auto ">
          <Row justify="center" gutter={[10]} className="flex! flex-1/2">
            {categories?.map((category, index) => {
              return (
                <Col
                  key={index}
                  xs={12}
                  sm={12}
                  md={8}
                  lg={6}
                  xl={4}
                  className="mb-6"
                >
                  <div
                    key={index}
                    onClick={() => {
                      const id = category._id;
                      navigate(`/product/all/${id}`);
                    }}
                    className={`bg-white group cursor-pointer flex w-full h-full p-16 rounded-xl hover:shadow-md transition-shadow`}
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
                        className="group-hover:scale-105! transition-all! rounded-2xl"
                        src={category.logo || 'https://via.placeholder.com/150'}
                      />
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>
      <section className="w-full pb-12">
        <div className=" mx-auto space-y-12">
          {categories?.map((category) => {
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
