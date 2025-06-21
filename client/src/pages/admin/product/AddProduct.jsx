import {
  Variants,
  Specifications,
  CommonInformation,
  CameraInformations,
  ConnectionInformation,
} from '@pages/admin/product';

import Files from '@services/files';
import Brands from '@services/brands';

import { useAppContext } from '@contexts';

import Categories from '@services/categories';
import { useNavigate } from 'react-router-dom';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState, useRef, useEffect } from 'react';
import { Button, message } from 'antd';
import Products from '@/services/products';

function AddProduct() {
  const {
    setLoadingError,
    setToastLoading,
    setLoadingSuccess,
    setSideBarSelectedTab,
  } = useAppContext();

  const navigate = useNavigate();
  const brandDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    discount: '',
    specifications: {
      weight: '',
      battery: '',
      processor: '',
      dimensions: '',
      displaySize: '',
      displayType: '',
      operatingSystem: '',
    },
    connectivity: {
      wifi: '',
      bluetooth: '',
      cellular: '',
      nfc: false,
      gps: false,
      ports: [],
    },
    camera: {
      front: {
        resolution: '',
        features: [],
        videoRecording: [],
      },
      rear: {
        resolution: '',
        features: [],
        lensCount: '',
        videoRecording: [],
      },
    },
    variants: [
      {
        name: '',
        price: '',
        color: {
          name: '',
          hex: '',
        },
        memory: {
          ram: '',
          storage: '',
        },
        images: [],
      },
    ],
  });

  const [productError, setProductError] = useState({
    name: false,
    description: false,
    category: false,
    brand: false,
    discount: false,
    variants: [
      {
        name: false,
        price: false,
        color: {
          name: false,
          hex: false,
        },
        images: false,
      },
    ],
  });

  const [productMessage, setProductMessage] = useState({
    name: 'Vui lòng nhập tên sản phẩm',
    description: 'Vui lòng nhập mô tả',
    category: 'Chọn thể loại',
    brand: 'Chọn thương hiệu',
    discount: 'Nhập phần trăm giảm giá',
    variants: {
      name: 'Nhập tên biến thể',
      price: 'Nhập giá biến thể',
      color: {
        name: 'Nhập tên màu',
        hex: 'Nhập mã màu',
      },
      images: 'Vui lòng chọn ảnh',
    },
  });

  function checkProductDataBeforeSubmit() {
    const newProductError = {
      name: false,
      description: false,
      category: false,
      brand: false,
      discount: false,
      variants: product.variants.map(() => ({
        name: false,
        price: false,
        color: {
          name: false,
          hex: false,
        },
        images: false,
      })),
    };

    if (!product.name) newProductError.name = true;
    if (!product.description) newProductError.description = true;
    if (!product.category) newProductError.category = true;
    if (!product.brand) newProductError.brand = true;
    if (!product.discount) newProductError.discount = true;

    product.variants.forEach((variant, index) => {
      if (!variant.name) newProductError.variants[index].name = true;
      if (!variant.price) newProductError.variants[index].price = true;
      if (!variant.color.name)
        newProductError.variants[index].color.name = true;
      if (!variant.color.hex) newProductError.variants[index].color.hex = true;
      if (!variant.images.length) newProductError.variants[index].images = true;
    });

    setProductError(newProductError);

    return !Object.values(newProductError).some((value) => {
      if (typeof value === 'boolean') return value;
      if (Array.isArray(value)) {
        return value.some((v) => {
          if (typeof v === 'boolean') return v;
          return Object.values(v).some((nested) => {
            if (typeof nested === 'boolean') return nested;
            return Object.values(nested).some(Boolean);
          });
        });
      }
      return false;
    });
  }

  useEffect(() => {
    setSideBarSelectedTab('Thêm sản phẩm');
  }, []);

  function removeEmptyFields(obj) {
    const filtered = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            if (value[0] instanceof File) {
              filtered[key] = value;
            } else {
              filtered[key] = value
                .map((item) =>
                  typeof item === 'object' && !(item instanceof File)
                    ? removeEmptyFields(item)
                    : item,
                )
                .filter(Boolean);
            }
          }
        } else if (typeof value === 'object' && !(value instanceof File)) {
          const nestedObj = removeEmptyFields(value);
          if (Object.values(nestedObj).length > 0) {
            filtered[key] = nestedObj;
          }
        } else if (value !== '') {
          filtered[key] = value;
        }
      }
    });

    return filtered;
  }
  async function fetchCategories() {
    try {
      setLoading(true);
      const categories = await Categories.getAll();
      setCategories(categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBrands() {
    try {
      setLoading(true);
      const brands = await Brands.getAll();
      setBrands(brands);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const onSubmit = async () => {
    const isValidData = checkProductDataBeforeSubmit();
    if (isValidData) {
      try {
        setToastLoading(true);
        message.loading('Đang thêm sản phẩm');
        const productToSubmit = removeEmptyFields({ ...product });

        for (let i = 0; i < productToSubmit.variants.length; i++) {
          const variant = productToSubmit.variants[i];
          const uploadedUrls = [];
          for (let j = 0; j < variant.images.length; j++) {
            const imageUrl = await Files.upload(variant.images[j]);
            uploadedUrls.push(imageUrl);
          }
          productToSubmit.variants[i].images = uploadedUrls;
        }

        const addProduct = await Products.add(productToSubmit);

        if (addProduct) {
          message.success('Thêm sản phẩm thành công');
          setToastLoading(false);
          navigate('/product');
          setLoadingSuccess(true);
        }
      } catch (error) {
        setToastLoading(false);
        setLoadingError(true);
        message.error('Thêm thất bại', 0, error);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Thêm sản phẩm mới
        </h1>
      </div>

      <CommonInformation
        brands={brands}
        product={product}
        categories={categories}
        setProduct={setProduct}
        productError={productError}
        productMessage={productMessage}
        showBrandDropdown={showBrandDropdown}
        categoryDropdownRef={categoryDropdownRef}
        setShowBrandDropdown={setShowBrandDropdown}
        showCategoryDropdown={showCategoryDropdown}
        setShowCategoryDropdown={setShowCategoryDropdown}
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

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex gap-3">
            <Button
              size="large"
              disabled={loading}
              className="min-w-[120px] border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 focus:border-blue-500 focus:text-blue-600"
              onClick={() => navigate(-1)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={onSubmit}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
