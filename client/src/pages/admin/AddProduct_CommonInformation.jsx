import Files from "@services/files";
import { useCallback } from "react";
import { Editor } from "@components/app";
import { AiFillWarning } from "react-icons/ai";

function CommonInformation({
  brands,
  product,
  categories,
  setProduct,
  productError,
  productMessage,
  showBrandDropdown,
  categoryDropdownRef,
  setShowBrandDropdown,
  showCategoryDropdown,
  setShowCategoryDropdown,
}) {
  const handleImageUpload = useCallback(async (files, info, uploadHandler) => {
    try {
      const file = files[0];

      if (!file) {
        throw new Error("No file selected");
      }

      const imageUrl = await Files.upload(file);

      if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
        uploadHandler({
          result: [
            {
              url: imageUrl,
              name: file.name,
              size: file.size,
            },
          ],
        });
      } else {
        throw new Error("Invalid image URL");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      uploadHandler({
        errorMessage: "Upload failed: " + (error.message || "Unknown error"),
      });
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">
            Thông tin chung
          </span>
          <div className="flex-1 border-t border-t-gray-300"></div>
        </div>

        <div className="flex gap-10">
          <div className="flex w-[50%] flex-col gap-2">
            <label htmlFor="name" className="font-medium text-sm">
              Tên sản phẩm
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return { ...currentProduct, name: event.target.value };
                });
              }}
              placeholder="Nhập tên sản phẩm"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
            {productError.name && (
              <span className="text-sm flex items-center gap-4 text-red-500">
                <AiFillWarning />
                {productMessage.name}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="discount" className="font-medium text-sm">
              Giảm giá
            </label>
            <input
              id="discount"
              name="discount"
              type="text"
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    discount: parseInt(event.target.value),
                  };
                });
              }}
              placeholder="Nhập phần trăm giảm giá"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
            {productError.discount && (
              <span className="text-sm flex items-center gap-4 text-red-500">
                <AiFillWarning />
                {productMessage.discount}
              </span>
            )}
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
              value={
                categories.find((c) => c._id === product.category)?.name || ""
              }
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="border border-gray-300 hover:border-gray-400 cursor-pointer outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
            {productError.category && (
              <span className="text-sm flex items-center gap-4 text-red-500">
                <AiFillWarning />
                {productMessage.category}
              </span>
            )}
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
                        category: category._id,
                      });
                      setShowCategoryDropdown(false);
                    }}
                    className={`px-8 my-2 py-4 rounded-sm hover:bg-gray-200 cursor-pointer ${product.category === category._id ? "bg-gray-200" : ""}`}
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
              value={brands.find((b) => b._id === product.brand)?.name || ""}
              type="text"
              placeholder="Chọn thương hiệu"
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
              className="border border-gray-300 cursor-pointer hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
            {productError.brand && (
              <span className="text-sm flex items-center gap-4 text-red-500">
                <AiFillWarning />
                {productMessage.brand}
              </span>
            )}
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
                        brand: brand._id,
                      });
                      setShowBrandDropdown(false);
                    }}
                    className={`px-8 my-2 py-4 rounded-sm hover:bg-gray-200 cursor-pointer ${product.brand === brand._id ? "bg-gray-200" : ""}`}
                  >
                    {brand.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Mô tả
        </label>
        <Editor
          height="200px"
          setProduct={setProduct}
          onImageUploadBefore={handleImageUpload}
        />
        {productError.description && (
          <span className="text-sm flex items-center gap-4 text-red-500">
            <AiFillWarning />
            {productMessage.description}
          </span>
        )}
      </div>
    </>
  );
}

export default CommonInformation;
