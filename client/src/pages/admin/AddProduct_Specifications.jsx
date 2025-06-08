function Specifications({ setProduct }) {
  return (
    <>
      <div className="flex flex-col gap-10 mt-20">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">
            Thông số kỹ thuật
          </span>
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      processor: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      displayType: event.target.value,
                    },
                  };
                });
              }}
              placeholder="Nhập loại màn hình"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="operatingSystem" className="font-medium text-sm">
              Hệ điều hành
            </label>
            <input
              id="operatingSystem"
              name="operatingSystem"
              type="text"
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      operatingSystem: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      displaySize: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      battery: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    specifications: {
                      ...currentProduct.specifications,
                      weight: event.target.value,
                    },
                  };
                });
              }}
              placeholder="Nhập thông tin khối lượng"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Specifications;
