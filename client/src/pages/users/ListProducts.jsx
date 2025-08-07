import { useAppContext } from '@contexts';
import { ListProducts } from '@components/products';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Categories from '@services/categories';
import { callFetchProducts } from '@services/apis';
import { Spin } from 'antd';

function ProductsList() {
  const { id } = useParams();
  const { message } = useAppContext();
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState({
    price: null,
    color: null,
    ram: null,
    storage: null,
    priceRange: null,
  });
  const [rams, setRams] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBrand, setCurrentBrand] = useState('');
  const [productType, setProductType] = useState('phone');
  const filteredProducts = products.filter((product) => {
    if (currentBrand && currentBrand !== 'Tất cả') {
      if (product.brand.name !== currentBrand.name) {
        return false;
      }
    }

    let matchPrice = true;
    const realPrice =
      product?.variants?.[0]?.price -
      product?.variants?.[0]?.price * (product?.discount / 100);
    if (filter.price && Array.isArray(filter.price)) {
      const [minPrice, maxPrice] = filter.price;
      matchPrice = realPrice >= minPrice && realPrice <= maxPrice;
    }
    if (filter.priceRange && Array.isArray(filter.priceRange)) {
      const [minPrice, maxPrice] = filter.priceRange;
      matchPrice = realPrice >= minPrice && realPrice <= maxPrice;
    }

    const matchesFilter = (product, key, value) => {
      const data =
        product.variants?.[0]?.memory?.[key] ?? product?.attributes?.[key];

      if (typeof data === 'boolean') {
        if (typeof value === 'boolean') {
          return data === value;
        }
        if (typeof value.label === 'boolean') {
          return data === value.label;
        }
        if (typeof value.label === 'string') {
          return data === (value.label.trim().toLowerCase() === 'true');
        }
      }

      return (
        data &&
        data
          ?.toString()
          .toLowerCase()
          .includes(value.label?.trim().toLowerCase())
      );
    };

    const keys = Object.keys(filter).filter(
      (key) => filter[key] && key !== 'price' && key !== 'priceRange',
    );

    const allOtherFiltersMatch = keys.every((key) => {
      return matchesFilter(product, key, filter[key]);
    });

    return matchPrice && allOtherFiltersMatch;
  });

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 1) {
      const priceA =
        a.variants[0].price - a.variants[0].price * (a.discount / 100);
      const priceB =
        b.variants[0].price - b.variants[0].price * (b.discount / 100);
      return priceA - priceB;
    } else if (sort === 2) {
      const priceA =
        a.variants[0].price - a.variants[0].price * (a.discount / 100);
      const priceB =
        b.variants[0].price - b.variants[0].price * (b.discount / 100);
      return priceB - priceA;
    }
    return 0;
  });

  useEffect(() => {
    if (products.length > 0 && brands.length === 0) {
      const uniqueBrands = Object.values(
        products.reduce((acc, product) => {
          if (product.brand && product.brand._id) {
            acc[product.brand._id] = product.brand;
          }
          return acc;
        }, {}),
      );

      setBrands(uniqueBrands);

      const allRams = products.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory?.ram).filter(Boolean) || [],
      );
      setRams([...new Set(allRams)]);

      const allStorages = products.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory?.storage).filter(Boolean) || [],
      );
      setStorages([...new Set(allStorages)]);
    }
  }, [products]);

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  useEffect(() => {
    const categoriesService = new Categories();

    categoriesService
      .findOne(id)
      .then((response) => {
        setCategory(response.data.data);
      })
      .catch(() => {
        message.error('Không thể lấy thể loại');
      });
  }, []);

  useEffect(() => {
    if (category) {
      callFetchProducts(currentPage, 10, category.name, currentBrand)
        .then((response) => {
          setProducts(response.data.data.result);
        })
        .catch(() => {
          message.error('Không thể lấy danh sách sản phẩm');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [category, currentBrand, currentPage]);

  useEffect(() => {
    document.title = 'Danh mục sản phẩm';
  }, []);
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className="w-full mt-10">
      <ListProducts
        rams={rams}
        sort={sort}
        brands={brands}
        filter={filter}
        setSort={setSort}
        // loading={loading}
        products={products}
        storages={storages}
        setFilter={setFilter}
        title={category?.name}
        setProducts={setProducts}
        currentPage={currentPage}
        currentBrand={currentBrand}
        setCurrentPage={setCurrentPage}
        setCurrentBrand={setCurrentBrand}
        filteredProducts={sortedAndFilteredProducts}
        productType={productType}
        setProductType={setProductType}
        categoryConfig={category}
      />
    </div>
  );
}

export default ProductsList;
