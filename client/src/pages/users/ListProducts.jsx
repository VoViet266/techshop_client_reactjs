import { useAppContext } from '@contexts';
import { ListProducts } from '@components/products';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Categories from '@services/categories';
import { callFetchProducts } from '@services/apis';
import { ReloadOutlined } from '@ant-design/icons';

import {
  Col,
  Row,
  Tag,
  Flex,
  Empty,
  Space,
  Select,
  Button,
  Skeleton,
  Typography,
  Pagination,
} from 'antd';

function ProductsList() {
  const { id } = useParams();
  const { message } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [rams, setRams] = useState([]);
  const [sort, setSort] = useState(null);
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storages, setStorages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [currentBrand, setCurrentBrand] = useState('');
  const [filter, setFilter] = useState({
    price: null,
    color: null,
    ram: null,
    storage: null,
  });

  const filteredProducts = products.filter((product) => {
    // Lọc theo giá
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

    // Lọc theo màu
    let matchColor = filter.color
      ? product.variants?.some((v) => v.color.name === filter.color)
      : true;
    // Lọc theo RAM
    let matchRam = filter.ram
      ? product.variants?.some((v) => v.memory.ram === filter.ram)
      : true;
    // Lọc theo bộ nhớ trong
    let matchStorage = filter.storage
      ? product.variants?.some((v) => v.memory.storage === filter.storage)
      : true;

    return matchPrice && matchColor && matchRam && matchStorage;
  });

  useEffect(() => {
    if (products.length > 0 && brands.length === 0) {
      const brands = [
        'Tất cả',
        ...new Set(products.map((product) => product.brand.name)),
      ];
      setBrands(brands);

      const colors = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.color))
            .filter(Boolean),
        ),
      ];
      setColors(colors);

      const rams = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.memory.ram))
            .filter(Boolean),
        ),
      ];
      setRams(rams);

      const storages = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.memory.storage))
            .filter(Boolean),
        ),
      ];
      setStorages(storages);
    }
  }, [products]);

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

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 my-10">
      <ListProducts
        rams={rams}
        sort={sort}
        brands={brands}
        colors={colors}
        filter={filter}
        setSort={setSort}
        loading={loading}
        storages={storages}
        products={products}
        setFilter={setFilter}
        title={category?.name}
        setProducts={setProducts}
        currentPage={currentPage}
        currentBrand={currentBrand}
        setCurrentPage={setCurrentPage}
        setCurrentBrand={setCurrentBrand}
        filteredProducts={filteredProducts}
      />
    </div>
  );
}

export default ProductsList;
