import { Editor } from "@components/app";
import Skeleton from "react-loading-skeleton";
import Categories from "@services/categories";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useRef, useEffect } from "react";

function AddProduct() {
  const categoryDropdownRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
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

  console.log("Categories:", categories);

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
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="tag" className="text-sm font-medium">
                Thương hiệu
              </label>
              <input
                id="tag"
                name="tag"
                type="text"
                placeholder="Chọn thương hiệu"
                className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
              />
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
                <input
                  id="nfc"
                  name="nfc"
                  type="text"
                  placeholder="Chọn NFC"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="gps" className="font-medium text-sm">
                  GPS
                </label>
                <input
                  id="gps"
                  name="gps"
                  type="text"
                  placeholder="Chọn GPS"
                  className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                />
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
        </div>
      )}

      {loading && (
        <div className="rounded-md">
          <Skeleton className="h-300" />
        </div>
      )}
    </div>
  );
}

export default AddProduct;
