import { Tag } from "antd";
import CardProduct from "./Card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function PreviewListProducts({ title, loading }) {
  const brands = ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Realme"];

  const colorsTag = [
    "red",
    "gold",
    "cyan",
    "lime",
    "blue",
    "green",
    "orange",
    "purple",
    "magenta",
    "volcano",
    "geekblue",
  ];

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 mt-50">
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200">
            <Skeleton className="h-32" />
          </div>
        ) : (
          <h3 className="text-2xl font-bold text-primary uppercase">{title}</h3>
        )}
        {loading ? (
          <div className="w-76">
            <Skeleton className="h-24" />
          </div>
        ) : (
          <span className="cursor-pointer font-medium text-primary">
            Xem tất cả
          </span>
        )}
      </div>

      <div className="mb-15 flex gap-12">
        {brands.map((brand, index) => (
          <div key={index}>
            {loading ? (
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
            ) : (
              // <Tag
              //   color={colorsTag[index]}
              //   className="px-4! rounded-sm! cursor-pointer! min-w-70! text-center! py-4!"
              // >
              //   {brand}
              // </Tag>
              <span
                key={index}
                className="px-8 rounded-sm cursor-pointer min-w-80 text-center bg-gray-200 border-gray-300 py-4 border"
              >
                {brand}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
        {loading ? (
          <div className="w-230">
            <Skeleton className="h-360" />
          </div>
        ) : (
          <CardProduct />
        )}
      </div>
    </div>
  );
}

export default PreviewListProducts;
