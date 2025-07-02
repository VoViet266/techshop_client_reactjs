import { useAppContext } from '@contexts';
import { ListProducts } from '@components/products';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Categories from '@services/categories';
import { callFetchProducts } from '@services/apis';

function ProductsList() {
  const { id } = useParams();
  const { message } = useAppContext();
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState({
    price: null,
    color: null,
    ram: null,
    storage: null,
  });
  const [rams, setRams] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBrand, setCurrentBrand] = useState('');

  const filteredProducts = products.filter((product) => {
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
          v.memory.ram?.toLowerCase().includes(filter.ram.label?.toLowerCase()),
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
  });

  useEffect(() => {
    if (products.length > 0 && brands.length === 0) {
      const brands = [
        'Tất cả',
        ...new Set(products.map((product) => product.brand.name)),
      ];
      setBrands(brands);

      const allRams = products.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory.ram).filter(Boolean) || [],
      );
      setRams([...new Set(allRams)]);

      const allStorages = products.flatMap(
        (product) =>
          product.variants?.map((v) => v.memory.storage).filter(Boolean) || [],
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

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 my-10">
      <ListProducts
        rams={rams}
        sort={sort}
        brands={brands}
        filter={filter}
        setSort={setSort}
        loading={loading}
        products={products}
        storages={storages}
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
