import {
  AiFillDelete,
  AiOutlinePlus,
  AiFillWarning,
  AiOutlineClose,
} from "react-icons/ai";

import { GoUpload } from "react-icons/go";

function Variants({
  product,
  setProduct,
  productError,
  productMessage,
  setProductError,
}) {
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

  const handleAddVariant = () => {
    setProduct((currentProduct) => {
      return {
        ...currentProduct,
        variants: [
          ...currentProduct.variants,
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
      };
    });

    setProductError({
      ...productError,
      variants: [
        ...productError.variants,
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
  };

  function handleRemoveVariant(index) {
    if (product.variants.length > 1) {
      setProduct((currentProduct) => {
        const newVariants = [...currentProduct.variants]; // Tạo bản sao mới
        newVariants.splice(index, 1); // Xóa phần tử tại index
        return {
          ...currentProduct,
          variants: newVariants, // Cập nhật variants với mảng đã xóa phần tử
        };
      });

      // Cập nhật productError state
      setProductError((currentError) => {
        const newVariants = [...currentError.variants];
        newVariants.splice(index, 1);
        return {
          ...currentError,
          variants: newVariants,
        };
      });
    }
  }

  return (
    <>
      <div className="flex flex-col gap-10 mt-20">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">Biến thể</span>
          <div className="flex-1 border-t border-t-gray-300"></div>

          <button
            onClick={handleAddVariant}
            className="cursor-pointer flex items-center gap-4 bg-gray-100 hover:bg-gray-200 py-4 px-8 rounded-sm text-sm font-medium"
          >
            <AiOutlinePlus />
            Thêm biến thể
          </button>
        </div>

        {product.variants.map((variant, index) => {
          return (
            <div
              className={`flex border border-gray-300 rounded-sm ${index !== 0 ? "px-10 py-20" : "p-10"} relative flex-col gap-10`}
              key={index}
            >
              {index !== 0 && (
                <button
                  onClick={() => {
                    handleRemoveVariant(index);
                  }}
                  className="absolute top-8 right-8 flex items-center gap-4 font-medium text-sm bg-gray-100 hover:bg-gray-200 px-8 cursor-pointer py-4 rounded-xs"
                >
                  <AiFillDelete className="text-lg" />
                  Xóa biến thể
                </button>
              )}
              <div className="grid grid-cols-3 mt-10 gap-10">
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          name: event.target.value,
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
                    placeholder="Nhập tên biến thể"
                    className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  {productError.variants[index].name && (
                    <span className="text-sm flex items-center gap-4 text-red-500">
                      <AiFillWarning />
                      {productMessage.variants.name}
                    </span>
                  )}
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          price: parseInt(event.target.value),
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
                    placeholder="Nhập giá của biến thể"
                    className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  {productError.variants[index].price && (
                    <span className="text-sm flex items-center gap-4 text-red-500">
                      <AiFillWarning />
                      {productMessage.variants.price}
                    </span>
                  )}
                </div>
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          color: {
                            ...newVariants[index].color,
                            name: event.target.value,
                          },
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
                    type="text"
                    placeholder="Nhập tên màu biến thể"
                    className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  {productError.variants[index].color.name && (
                    <span className="text-sm flex items-center gap-4 text-red-500">
                      <AiFillWarning />
                      {productMessage.variants.color.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-10">
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          color: {
                            ...newVariants[index].color,
                            hex: event.target.value,
                          },
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
                    name="hex"
                    type="text"
                    placeholder="Nhập mã màu của biến thể"
                    className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                  {productError.variants[index].color.name && (
                    <span className="text-sm flex items-center gap-4 text-red-500">
                      <AiFillWarning />
                      {productMessage.variants.color.hex}
                    </span>
                  )}
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          memory: {
                            ...newVariants[index].memory,
                            ram: event.target.value,
                          },
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
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
                    onChange={(event) => {
                      setProduct((currentProduct) => {
                        const newVariants = [...currentProduct.variants];
                        newVariants[index] = {
                          ...newVariants[index],
                          memory: {
                            ...newVariants[index].memory,
                            storage: event.target.value,
                          },
                        };
                        return {
                          ...currentProduct,
                          variants: newVariants,
                        };
                      });
                    }}
                    type="text"
                    placeholder="Nhập bộ nhớ trong của biến thể"
                    value={variant.memory.storage}
                    className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`variant-${index}-image`}
                    className="font-medium text-sm"
                  >
                    Hình ảnh
                  </label>
                  <div className="w-full min-h-[200px] focus:border-gray-400 rounded-md p-6 border-dashed border border-gray-300 hover:border-gray-400">
                    {variant.images && variant.images.length > 0 ? (
                      <div className="grid grid-cols-4 gap-4">
                        {variant.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                            <img
                              src={
                                image instanceof File
                                  ? URL.createObjectURL(image)
                                  : image
                              }
                              alt={`Preview ${imageIndex}`}
                              className="w-full object-cover rounded-md"
                            />
                            <button
                              onClick={() =>
                                handleRemoveImage(index, imageIndex)
                              }
                              className="absolute top-4 right-4 p-4 text-black bg-white shadow-2xl cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <AiOutlineClose size={16} />
                            </button>
                          </div>
                        ))}
                        <label
                          htmlFor={`variant-${index}-image`}
                          className="flex gap-4 cursor-pointer items-center justify-center h-full"
                        >
                          <AiOutlinePlus className="text-gray-500 text-xl" />
                          <span className="text-gray-500">Thêm ảnh</span>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor={`variant-${index}-image`}
                        className="flex flex-col gap-6 cursor-pointer items-center justify-center h-full"
                      >
                        <GoUpload className="text-xl font-thin text-gray-500" />
                        <span className="text-gray-500">
                          Chọn ảnh để xem trước
                        </span>
                      </label>
                    )}
                  </div>
                  {productError.variants[index].images && (
                    <span className="text-sm flex items-center gap-4 text-red-500">
                      <AiFillWarning />
                      {productMessage.variants.images}
                    </span>
                  )}
                  <input
                    multiple
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`variant-${index}-image`}
                    onChange={(event) => handleFileChange(event, index)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Variants;
