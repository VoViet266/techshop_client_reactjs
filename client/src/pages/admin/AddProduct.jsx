import Brands from "@services/brands";
import { Editor } from "@components/app";
import { useAppContext } from "@contexts";
import Skeleton from "react-loading-skeleton";
import Categories from "@services/categories";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useRef, useEffect } from "react";
import { AiFillCheckCircle, AiOutlineClose } from "react-icons/ai";

function AddProduct() {
  const { setSideBarSelectedTab } = useAppContext();
  const categoryDropdownRef = useRef(null);
  const brandDropdownRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
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
      },
      rear: {
        resolution: "",
        features: [],
      },
      videoRecording: [],
    },
    variants: [
      {
        name: "",
        price: "",
        compareAtPrice: "",
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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleFileChange = (event, variantIndex) => {
    const files = Array.from(event.target.files);

    const oldVariant = product.variants[variantIndex];
    if (oldVariant.images && oldVariant.images.length > 0) {
      oldVariant.images.forEach((image) => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    }

    setProduct((currentProduct) => {
      const newProduct = { ...currentProduct };
      newProduct.variants[variantIndex].images = files;
      return newProduct;
    });
  };

  const handleRemoveImage = (variantIndex, imageIndex) => {
    const image = product.variants[variantIndex].images[imageIndex];
    if (image instanceof File) {
      URL.revokeObjectURL(URL.createObjectURL(image));
    }

    setProduct((currentProduct) => {
      const newProduct = { ...currentProduct };
      newProduct.variants[variantIndex].images.splice(imageIndex, 1);
      return newProduct;
    });
  };

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

  return (
    <div className="">
      <div className="mb-10">
        <h1 className="text-xl">Thêm sản phẩm</h1>
      </div>
      {!loading && (
        <div className="flex flex-col gap-10 border border-gray-300 p-10 rounded-md">
          <div className="flex gap-10">
            <div className="flex w-[60%] flex-col gap-2">
              <label htmlFor="name" className="font-medium text-sm">
                Tên sản phẩm
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Nhập tên sản phẩm"
                className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 relative">
              <label htmlFor="tag" className="text-sm font-medium">
                Thể loại
              </label>
              <input
                id="tag"
                readOnly
                name="tag"
                type="text"
                placeholder="Chọn thể loại"
                value={product.category || ""}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="border border-gray-300 hover:border-gray-400 cursor-pointer outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
              />
              {showCategoryDropdown && (
                <ul
                  ref={categoryDropdownRef}
                  className="absolute left-0 right-0 z-10 top-full rounded-md mt-4 p-6 bg-white border border-gray-200"
                >
                  {categories.map((category, index) => (
                    <li
                      key={index}
                      onClick={(event) => {
                        setProduct({
                          ...product,
                          category: event.target.textContent,
                        });
                        setShowCategoryDropdown(false);
                      }}
                      className={`px-8 my-2 py-4 rounded-sm hover:bg-gray-200 cursor-pointer ${product.category === category.name ? "bg-gray-200" : ""}`}
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 relative">
              <label htmlFor="brand" className="text-sm font-medium">
                Thương hiệu
              </label>
              <input
                id="brand"
                readOnly
                name="brand"
                value={product.brand || ""}
                type="text"
                placeholder="Chọn thương hiệu"
                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                className="border border-gray-300 cursor-pointer hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
              />
              {showBrandDropdown && (
                <ul
                  ref={brandDropdownRef}
                  className="absolute left-0 right-0 z-10 top-full rounded-md mt-4 p-6 bg-white border border-gray-200"
                >
                  {brands.map((brand, index) => (
                    <li
                      key={index}
                      onClick={(event) => {
                        setProduct({
                          ...product,
                          brand: event.target.textContent,
                        });
                        setShowBrandDropdown(false);
                      }}
                      className={`px-8 my-2 py-4 rounded-sm hover:bg-gray-200 cursor-pointer ${product.brand === brand.name ? "bg-gray-200" : ""}`}
                    >
                      {brand.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </label>
            <Editor setProduct={setProduct} height="200px" />
          </div>

          <div className="flex flex-col gap-10 mt-20">
            <div className="flex gap-12 items-center">
              <span className="text-sm font-medium">Thông số kỹ thuật</span>
              <div className="flex-1 border-t border-t-gray-300"></div>
            </div>

            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label htmlFor="processor" className="font-medium text-sm">
                  Vi xử lý
                </label>
                <input
                  id="processor"
                  name="processor"
                  type="text"
                  placeholder="Nhập tên vi xử lý"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="displayType" className="font-medium text-sm">
                  Loại màn hình
                </label>
                <input
                  id="displayType"
                  name="displayType"
                  type="text"
                  placeholder="Nhập loại màn hình"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="operatingSystem"
                  className="font-medium text-sm"
                >
                  Hệ điều hành
                </label>
                <input
                  id="operatingSystem"
                  name="operatingSystem"
                  type="text"
                  placeholder="Nhập hệ điều hành"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label htmlFor="displaySize" className="font-medium text-sm">
                  Kích thước màn hình
                </label>
                <input
                  id="displaySize"
                  name="displaySize"
                  type="text"
                  placeholder="Nhập kích thước màn hình"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="battery" className="font-medium text-sm">
                  Pin
                </label>
                <input
                  id="battery"
                  name="battery"
                  type="text"
                  placeholder="Nhập thông tin pin"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="weight" className="font-medium text-sm">
                  Khối lượng
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  placeholder="Nhập thông tin khối lượng"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 mt-20">
            <div className="flex gap-12 items-center">
              <span className="text-sm font-medium">Thông tin kết nối</span>
              <div className="flex-1 border-t border-t-gray-300"></div>
            </div>

            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label htmlFor="wifi" className="font-medium text-sm">
                  Wifi
                </label>
                <input
                  id="wifi"
                  name="wifi"
                  type="text"
                  placeholder="Nhập thông tin Wifi"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="bluetooth" className="font-medium text-sm">
                  Bluetooth
                </label>
                <input
                  id="bluetooth"
                  name="bluetooth"
                  type="text"
                  placeholder="Nhập thông tin Bluetooth"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cellular" className="font-medium text-sm">
                  Công nghệ di động
                </label>
                <input
                  id="cellular"
                  name="cellular"
                  type="text"
                  placeholder="Nhập công nghệ di động"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label htmlFor="nfc" className="font-medium text-sm">
                  NFC
                </label>
                <div className="cursor-pointer relative">
                  <input
                    id="nfc"
                    name="nfc"
                    type="text"
                    placeholder="Chọn NFC"
                    readOnly
                    value={product.connectivity.nfc ? "Có" : "Không"}
                    onClick={() =>
                      setProduct({
                        ...product,
                        connectivity: {
                          ...product.connectivity,
                          nfc: !product.connectivity.nfc,
                        },
                      })
                    }
                    className="border w-full cursor-pointer border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <AiFillCheckCircle
                      className={`${product.connectivity.nfc ? "text-green-500" : "text-gray-500"}`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="gps" className="font-medium text-sm">
                  GPS
                </label>
                <div className="cursor-pointer relative">
                  <input
                    id="gps"
                    name="gps"
                    type="text"
                    placeholder="Chọn GPS"
                    readOnly
                    value={product.connectivity.gps ? "Có" : "Không"}
                    onClick={() =>
                      setProduct({
                        ...product,
                        connectivity: {
                          ...product.connectivity,
                          gps: !product.connectivity.gps,
                        },
                      })
                    }
                    className="border w-full cursor-pointer border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <AiFillCheckCircle
                      className={`${product.connectivity.gps ? "text-green-500" : "text-gray-500"}`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="ports" className="font-medium text-sm">
                  Cổng kết nối
                </label>
                <input
                  id="ports"
                  name="ports"
                  type="text"
                  placeholder="Nhập thông tin cổng kết nối"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 mt-20">
            <div className="flex gap-12 items-center">
              <span className="text-sm font-medium">Camera trước</span>
              <div className="flex-1 border-t border-t-gray-300"></div>
            </div>

            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="front-camera-resolution"
                  className="font-medium text-sm"
                >
                  Độ phân giải
                </label>
                <input
                  id="front-camera-resolution"
                  name="front-camera-resolution"
                  type="text"
                  placeholder="Nhập độ phân giải camera trước"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="front-camera-feature"
                  className="font-medium text-sm"
                >
                  Tính năng
                </label>
                <input
                  id="front-camera-feature"
                  name="front-camera-feature"
                  type="text"
                  placeholder="Nhập tính năng camera trước"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="front-camera-videoRecording"
                  className="font-medium text-sm"
                >
                  Quay phim
                </label>
                <input
                  id="front-camera-videoRecording"
                  name="front-camera-videoRecording"
                  type="text"
                  placeholder="Nhập tính năng quay phim camera trước"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 mt-20">
            <div className="flex gap-12 items-center">
              <span className="text-sm font-medium">Camera sau</span>
              <div className="flex-1 border-t border-t-gray-300"></div>
            </div>

            <div className="grid grid-cols-3 gap-10">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="rear-camera-resolution"
                  className="font-medium text-sm"
                >
                  Độ phân giải
                </label>
                <input
                  id="rear-camera-resolution"
                  name="rear-camera-resolution"
                  type="text"
                  placeholder="Nhập độ phân giải camera sau"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="rear-camera-feature"
                  className="font-medium text-sm"
                >
                  Tính năng
                </label>
                <input
                  id="rear-camera-feature"
                  name="rear-camera-feature"
                  type="text"
                  placeholder="Nhập tính năng camera sau"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="rear-camera-videoRecording"
                  className="font-medium text-sm"
                >
                  Quay phim
                </label>
                <input
                  id="rear-camera-videoRecording"
                  name="rear-camera-videoRecording"
                  type="text"
                  placeholder="Nhập tính năng camera sau"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-10 mt-20">
            <div className="flex gap-12 items-center">
              <span className="text-sm font-medium">Biến thể</span>
              <div className="flex-1 border-t border-t-gray-300"></div>
            </div>

            {product.variants.map((variant, index) => {
              return (
                <div className="grid grid-cols-3 gap-10">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-name`}
                      className="font-medium text-sm"
                    >
                      Tên biến thể
                    </label>
                    <input
                      id={`variant-${index}-name`}
                      name="name"
                      value={variant.name}
                      type="text"
                      placeholder="Nhập tên biến thể"
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-price`}
                      className="font-medium text-sm"
                    >
                      Giá
                    </label>
                    <input
                      id={`variant-${index}-price`}
                      value={variant.price}
                      name="price"
                      type="text"
                      placeholder="Nhập giá của biến thể"
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-compareAtPrice`}
                      className="font-medium text-sm"
                    >
                      Giá so sánh
                    </label>
                    <input
                      id={`variant-${index}-compareAtPrice`}
                      name="compareAtPrice"
                      type="text"
                      placeholder="Nhập giá so sánh của biến thể"
                      value={variant.compareAtPrice}
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                </div>
              );
            })}

            {product.variants.map((variant, index) => {
              return (
                <div className="grid grid-cols-4 gap-10">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-colorName`}
                      className="font-medium text-sm"
                    >
                      Tên màu
                    </label>
                    <input
                      id={`variant-${index}-colorName`}
                      name="name"
                      value={variant.color.name}
                      type="text"
                      placeholder="Nhập tên màu biến thể"
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-hex`}
                      className="font-medium text-sm"
                    >
                      Mã màu
                    </label>
                    <input
                      id={`variant-${index}-hex`}
                      value={variant.color.hex}
                      name="hex"
                      type="text"
                      placeholder="Nhập mã màu của biến thể"
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-RAM`}
                      className="font-medium text-sm"
                    >
                      RAM
                    </label>
                    <input
                      id={`variant-${index}-RAM`}
                      name="RAM"
                      type="text"
                      placeholder="Nhập RAM của biến thể"
                      value={variant.memory.ram}
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-storage`}
                      className="font-medium text-sm"
                    >
                      Bộ nhớ trong
                    </label>
                    <input
                      id={`variant-${index}-storage`}
                      name="storage"
                      type="text"
                      placeholder="Nhập bộ nhớ trong của biến thể"
                      value={variant.memory.storage}
                      className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                    />
                  </div>
                </div>
              );
            })}

            {product.variants.map((variant, index) => {
              return (
                <div className="grid grid-cols-1 gap-10" key={index}>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`variant-${index}-image`}
                      className="font-medium text-sm"
                    >
                      Hình ảnh
                    </label>
                    <div className="w-full min-h-[200px] focus:border-gray-400 rounded-md p-6 border border-gray-300 hover:border-gray-400">
                      {variant.images && variant.images.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                          {variant.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="relative group">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${imageIndex}`}
                                className="w-full object-cover rounded-md"
                              />
                              <button
                                onClick={() =>
                                  handleRemoveImage(index, imageIndex)
                                }
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <AiOutlineClose size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-500">
                            Chọn ảnh để xem trước
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      multiple
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`variant-${index}-image`}
                      onChange={(event) => handleFileChange(event, index)}
                    />
                    <label
                      htmlFor={`variant-${index}-image`}
                      className="mt-2 inline-block px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 text-center"
                    >
                      Chọn ảnh
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-md">
          <Skeleton className="h-700" />
        </div>
      )}
    </div>
  );
}

export default AddProduct;
