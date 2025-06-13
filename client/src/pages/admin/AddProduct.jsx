import {
  Variants,
  Specifications,
  CommonInformation,
  CameraInformations,
  ConnectionInformation,
} from "@pages/admin";

import Files from "@services/files";
import Brands from "@services/brands";
import Products from "@services/products";
import { useAppContext } from "@contexts";
import Skeleton from "react-loading-skeleton";
import Categories from "@services/categories";
import { useNavigate } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useRef, useEffect } from "react";
import { Button, message } from "antd";

function AddProduct() {
  const {
    setMessage,
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
    name: "",
    description: "",
    category: "",
    brand: "",
    discount: "",
    specifications: {
      weight: "",
      battery: "",
      processor: "",
      dimensions: "",
      displaySize: "",
      displayType: "",
      operatingSystem: "",
    },
    connectivity: {
      wifi: "",
      bluetooth: "",
      cellular: "",
      nfc: false,
      gps: false,
      ports: [],
    },
    camera: {
      front: {
        resolution: "",
        features: [],
        videoRecording: [],
      },
      rear: {
        resolution: "",
        features: [],
        lensCount: "",
        videoRecording: [],
      },
    },
    variants: [
      {
        name: "",
        price: "",
        color: {
          name: "",
          hex: "",
        },
        memory: {
          ram: "",
          storage: "",
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
    name: "Vui lòng nhập tên sản phẩm",
    description: "Vui lòng nhập mô tả",
    category: "Chọn thể loại",
    brand: "Chọn thương hiệu",
    discount: "Nhập phần trăm giảm giá",
    variants: {
      name: "Nhập tên biến thể",
      price: "Nhập giá biến thể",
      color: {
        name: "Nhập tên màu",
        hex: "Nhập mã màu",
      },
      images: "Vui lòng chọn ảnh",
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
      if (typeof value === "boolean") return value;
      if (Array.isArray(value)) {
        return value.some((v) => {
          if (typeof v === "boolean") return v;
          return Object.values(v).some((nested) => {
            if (typeof nested === "boolean") return nested;
            return Object.values(nested).some(Boolean);
          });
        });
      }
      return false;
    });
  }

  useEffect(() => {
    setSideBarSelectedTab("Thêm sản phẩm");
  }, []);

  function removeEmptyFields(obj) {
    const filtered = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (value !== null && value !== undefined) {
        // Xử lý arrays
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Kiểm tra nếu là mảng File objects thì giữ nguyên
            if (value[0] instanceof File) {
              filtered[key] = value;
            } else {
              filtered[key] = value
                .map((item) =>
                  typeof item === "object" && !(item instanceof File)
                    ? removeEmptyFields(item)
                    : item
                )
                .filter(Boolean);
            }
          }
        }
        // Xử lý objects
        else if (typeof value === "object" && !(value instanceof File)) {
          const nestedObj = removeEmptyFields(value);
          if (Object.values(nestedObj).length > 0) {
            filtered[key] = nestedObj;
          }
        }
        // Xử lý strings và các kiểu dữ liệu khác
        else if (value !== "") {
          filtered[key] = value;
        }
      }
    });

    return filtered;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }

      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
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

    fetchCategories();
  }, []);

  useEffect(() => {
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

    fetchBrands();
  }, []);
  const onSubmit = async () => {
    const isValidData = checkProductDataBeforeSubmit();
    if (isValidData) {
      try {
        setToastLoading(true);
        message.loading("Đang thêm sản phẩm");
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
          message.success("Thêm sản phẩm thành công");
          setToastLoading(false);
          navigate("/product/add");
          setLoadingSuccess(true);
        }
      } catch (error) {
        setToastLoading(false);
        setLoadingError(true);
        message.error("Thêm thất bại", 0, error);
      }
    }
  };
  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Thêm sản phẩm
          </h1>
        </div>
        {!loading && (
          <div className="flex flex-col gap-8 border border-gray-200 bg-white p-6 rounded-lg shadow-sm">
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

            <CameraInformations setProduct={setProduct}  product={product}/>
 
            <Variants
              product={product}
              setProduct={setProduct}
              productError={productError}
              productMessage={productMessage}
              setProductError={setProductError}
            />
          </div>
        )}

        {loading && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <Skeleton className="h-[700px]" />
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={loading}
          type="primary"
          size="large"
          style={{
            margin: "20px 10px 5px 0",
            width: 200,
          }}
          className="mt-8 rounded-lg font-medium cursor-pointer float-right min-w-[100px] bg-blue-600 text-white py-2 px-4 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý..." : "Thêm"}
        </Button>
      </div>
    </>
  );
}

export default AddProduct;
