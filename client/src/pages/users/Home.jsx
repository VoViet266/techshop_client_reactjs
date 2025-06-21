import Products from '@services/products';
import { useState, useEffect } from 'react';
import Categories from '@services/categories';
import { PreviewListProducts } from '@components/products';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setProducts(products);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <>
      {/* <div className="relative w-[60%] mt-20">
        {loading ? (
          <Skeleton className="h-500" />
        ) : (
          <ImagesSlider images={[]} />
        )}
      </div> */}
      <div className="mb-50 w-full">
        {categories.map((category, index) => {
          return (
            <PreviewListProducts
              key={index}
              loading={loading}
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
