import { Editor } from "@components/app";
import { useState } from "react";

function AddProduct() {
  const [product, setProduct] = useState({});
  console.log(product);
  return (
    <div className="">
      <div className="mb-10">
        <h1 className="text-xl">Thêm sản phẩm</h1>
      </div>
      <div className="flex flex-col gap-10 border border-gray-300 p-10 rounded-md">
        <div className="flex gap-10">
          <div className="flex w-[70%] flex-col gap-2">
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
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="tag" className="text-sm font-medium">
              Nhãn
            </label>
            <input
              id="tag"
              name="tag"
              type="text"
              placeholder="Chọn nhãn sản phẩm"
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
      </div>
    </div>
  );
}

export default AddProduct;
