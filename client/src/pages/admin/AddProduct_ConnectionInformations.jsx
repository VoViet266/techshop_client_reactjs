import { AiFillCheckCircle } from "react-icons/ai";

function ConnectionInformation({ product, setProduct }) {
  return (
    <>
      <div className="flex flex-col gap-10 mt-20">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">
            Thông tin kết nối
          </span>
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    connectivity: {
                      ...currentProduct.connectivity,
                      wifi: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    connectivity: {
                      ...currentProduct.connectivity,
                      bluetooth: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    connectivity: {
                      ...currentProduct.connectivity,
                      cellular: event.target.value,
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    connectivity: {
                      ...currentProduct.connectivity,
                      ports: event.target.value.split(", "),
                    },
                  };
                });
              }}
              placeholder="Nhập thông tin cổng kết nối"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ConnectionInformation;
