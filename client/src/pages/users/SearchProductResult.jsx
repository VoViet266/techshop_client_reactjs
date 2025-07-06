import { Flex, Result, Button, Typography } from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PreviewListProducts, ListProducts } from '@/components/products';
import { useAppContext } from '@/contexts';
import { Content } from 'antd/es/layout/layout';

function SearchProductResult() {
  const { query } = useParams();
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBrand, setCurrentBrand] = useState('');
  const [rams, setRams] = useState([]);
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState({
    price: null,
    color: null,
    ram: null,
    storage: null,
  });
  const [brands, setBrands] = useState([]);
  const [storages, setStorages] = useState([]);
  const { message } = useAppContext();

  async function fetchSearchResult() {
    try {
      message.loading({
        content: 'Đang tìm kiếm sản phẩm...',
        key: 'search',
      });
      const result = await Products.search(query);
      message.success({ content: 'Tìm kiếm thành công', key: 'search' });
      setResult(result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error({ content: 'Không tìm thấy sản phẩm nào', key: 'search' });
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchSearchResult();
  }, [query]);

  const filteredProducts = Array.isArray(result)
    ? result.filter((product) => {
        let matchPrice = true;
        const realPrice =
          product?.variants?.[0]?.price -
          product?.variants?.[0]?.price * (product?.discount / 100);
        if (filter.price === 1) {
          matchPrice = realPrice < 10000000;
        } else if (filter.price === 2) {
          matchPrice = realPrice >= 10000000 && realPrice <= 20000000;
        } else if (filter.price === 3) {
          matchPrice = realPrice > 20000000;
        }

        let matchRam = filter.ram
          ? product.variants?.some((v) =>
              v.memory.ram
                ?.toLowerCase()
                .includes(filter.ram.label?.toLowerCase()),
            )
          : true;

        let matchStorage = filter.storage
          ? product.variants?.some((v) =>
              v.memory.storage
                ?.toLowerCase()
                .includes(filter.storage.label?.toLowerCase()),
            )
          : true;

        return matchPrice && matchRam && matchStorage;
      })
    : [];

  useEffect(() => {
    if (Array.isArray(result) && result.length > 0) {
      const brands = [
        'Tất cả',
        ...new Set(result.map((product) => product?.brand?.[0]?.name?.[0])),
      ];
      setBrands(brands);

      const allRams = result.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory.ram).filter(Boolean) || [],
      );
      setRams([...new Set(allRams)]);

      const allStorages = result.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory.storage).filter(Boolean) || [],
      );
      setStorages([...new Set(allStorages)]);
    }
  }, [result, query]);

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 my-10">
      <ListProducts
        rams={rams}
        sort={sort}
        brands={brands}
        filter={filter}
        setSort={setSort}
        loading={loading}
        title="Tìm kiếm"
        products={result}
        storages={storages}
        setFilter={setFilter}
        setProducts={setResult}
        currentBrand={currentBrand}
        setCurrentBrand={setCurrentBrand}
        filteredProducts={filteredProducts}
      />
    </div>
  );
}

export default SearchProductResult;
