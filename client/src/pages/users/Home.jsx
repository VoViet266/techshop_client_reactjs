import { Carousel, Image, Row, Spin } from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import Categories from '@services/categories';
import { PreviewListProducts } from '@components/products';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([
    'https://www.gizmochina.com/wp-content/uploads/2021/10/macbook-pro-2021-renders-3-1024x576.jpg?x70461',
  ]);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute right-4 hover:opacity-80 top-1/2 -translate-y-1/2 z-10 hover:text-white text-white! cursor-pointer shadow-lg p-3 transition-all text-2xl!"
      >
        <RightOutlined />
      </button>
    );
  }

  function CustomPrevArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute left-4 hover:opacity-80 top-1/2 -translate-y-1/2 z-10 hover:text-white text-white! cursor-pointer shadow-lg p-3 transition-all text-2xl!"
      >
        <LeftOutlined />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-[60%] h-300 mt-20 mb-250 ">
        <Carousel
          arrows
          autoplaySpeed={5000}
          className="rounded-md! h-full!"
          nextArrow={<CustomPrevArrow />}
          prevArrow={<CustomNextArrow />}
          autoplay={{ dotDuration: true }}
          dotPosition="bottom"
          dotStyle={{ background: '#ff5900' }} // orange dots
          activeDotStyle={{ background: '#ff5900' }} // orange active dot
        >
          {banners.map((banner, index) => (
            <Image
              key={index}
              src={banner}
              preview={false}
              className="object-cover! rounded-md! w-full! h-full!"
            />
          ))}
        </Carousel>
      </div>

      <div className="mb-50 w-full bg-white rounded-[10px] p-10">
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
                products={products.filter((product) => {
                  return product.category.name === category.name;
                })}
                title={category.name}
              />
            );
        })}
      </div>
    </>
  );
}

export default Home;
