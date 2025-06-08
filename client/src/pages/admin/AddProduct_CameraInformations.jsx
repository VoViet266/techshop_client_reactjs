function CameraInformations({ setProduct }) {
  return (
    <>
      <div className="flex flex-col gap-10 mt-20">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">Camera trước</span>
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        resolution: event.target.value,
                      },
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        features: event.target.value.split(", "),
                      },
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        videoRecording: event.target.value.split(", "),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng quay phim camera trước"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-20">
        <div className="flex gap-12 items-center">
          <span className="text-sm text-primary font-medium">Camera sau</span>
          <div className="flex-1 border-t border-t-gray-300"></div>
        </div>

        <div className="grid grid-cols-4 gap-10">
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        resolution: event.target.value,
                      },
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        features: event.target.value.split(", "),
                      },
                    },
                  };
                });
              }}
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
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        videoRecording: event.target.value.split(", "),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng camera sau"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="rear-camera-videoRecording"
              className="font-medium text-sm"
            >
              Số lượng ống kính
            </label>
            <input
              id="rear-camera-videoRecording"
              name="rear-camera-videoRecording"
              type="text"
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        lensCount: parseInt(event.target.value),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập số lượng ống kính"
              className="border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-400 placeholder:text-sm placeholder:font-medium rounded-md px-12 py-6"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default CameraInformations;
