import { Tag } from "antd";
import CardProduct from "./Card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function PreviewListProducts({
  title,
  loading,
  products = {},
  canViewAll = true,
  showListBrands = true,
}) {
  const brands = ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Realme"];

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 mt-20">
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200">
            <Skeleton className="h-32" />
          </div>
        ) : (
          <h3 className="text-xl font-bold text-primary uppercase mb-6">
            {title}
          </h3>
        )}

        {loading && (
          <div className="w-76">
            <Skeleton className="h-24" />
          </div>
        )}
        {!loading && canViewAll && (
          <span className="cursor-pointer font-medium text-primary">
            Xem tất cả
          </span>
        )}
      </div>

      {showListBrands && (
        <div className="mb-15 flex gap-2">
          {brands.map((brand, index) => (
            <div key={index}>
              {loading ? (
                <div className="w-80">
                  <Skeleton className="h-25" />
                </div>
              ) : (
                <Tag
                  key={index}
                  className="font-roboto! text-sm! px-8! rounded-md! cursor-pointer! min-w-80! text-center! bg-gray-200! border-gray-300! py-4! border!"
                >
                  {brand}
                </Tag>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        {loading && (
          <>
            <div className="w-275">
              <Skeleton className="h-500" />
            </div>
            <div className="w-275">
              <Skeleton className="h-500" />
            </div>
            <div className="w-275">
              <Skeleton className="h-500" />
            </div>
            <div className="w-275">
              <Skeleton className="h-500" />
            </div>
            <div className="w-275">
              <Skeleton className="h-500" />
            </div>
          </>
        )}
        {products.map((product, index) => {
          return (
            <CardProduct key={index} product={product} loading={loading} />
          );
        })}
      </div>
    </div>
  );
}

export default PreviewListProducts;
