import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button, message, Spin } from 'antd';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import Files from '@services/files';
import Brands from '@services/brands';
import Categories from '@services/categories';
import { useAppContext } from '@contexts';

import {
  CommonInformation,
  Specifications,
  ConnectionInformation,
  CameraInformations,
  Variants,
} from '@pages/admin/product';
import { callFetchProductDetail, callUpdateProduct } from '@/services/apis';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSideBarSelectedTab, setToastLoading, setLoadingSuccess, setLoadingError } =
    useAppContext();

  const brandDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [productError, setProductError] = useState({});
  const [productMessage, setProductMessage] = useState({});

  useEffect(() => {
    setSideBarSelectedTab('Sửa sản phẩm');
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, brs, prod] = await Promise.all([
          Categories.getAll(),
          Brands.getAll(),
          callFetchProductDetail(id),
        ]);
        setCategories(cats);
        setBrands(brs);
        setProduct(prod.data.data);
      } catch (err) {
        console.error(err);
        setLoadingError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target)) {
        setShowBrandDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = async () => {
    try {
      setToastLoading(true);
      message.loading('Đang cập nhật sản phẩm...');
      const prodSub = { ...product };
      for (let v of prodSub.variants) {
        const newImgs = [];
        for (let img of v.images) {
          if (img instanceof File) {
            newImgs.push(await Files.upload(img));
          } else {
            newImgs.push(img);
          }
        }
        v.images = newImgs;
      }

      await callUpdateProduct(prodSub);
      message.success('Cập nhật thành công!');
      setToastLoading(false);
      setLoadingSuccess(true);
      navigate('/product');
    } catch (err) {
      console.error(err);
      setToastLoading(false);
      setLoadingError(true);
      message.error('Cập nhật thất bại');
    }
  };

  if (loading || !product) {
    return <Skeleton height={600} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Chỉnh sửa sản phẩm</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
        <CommonInformation
          brands={brands}
          categories={categories}
          product={product}
          setProduct={setProduct}
          productError={productError}
          productMessage={productMessage}
          showBrandDropdown={showBrandDropdown}
          setShowBrandDropdown={setShowBrandDropdown}
          brandDropdownRef={brandDropdownRef}
          showCategoryDropdown={showCategoryDropdown}
          setShowCategoryDropdown={setShowCategoryDropdown}
          categoryDropdownRef={categoryDropdownRef}
        />
        <Specifications setProduct={setProduct} product={product} />
        <ConnectionInformation product={product} setProduct={setProduct} />
        <CameraInformations setProduct={setProduct} product={product} />
        <Variants
          product={product}
          setProduct={setProduct}
          productError={productError}
          productMessage={productMessage}
          setProductError={setProductError}
        />
      </div>
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex gap-3">
            <Button
              size="large"
              disabled={loading}
              className="mt-8 float-right"
              onClick={() => navigate(-1)}
            >
              Hủy bỏ
            </Button>
            <Button type="primary" size="large" className="mt-8 float-right" onClick={onSubmit}>
              Cập nhật
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
