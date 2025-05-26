import { Card } from "./";

function PreviewListProducts({ title }) {
  const brands = ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Realme"];
  return (
    <div className="w-full xl:px-50 mt-50">
      <div className="flex items-center justify-between mt-10 mb-5">
        <h3 className="text-2xl font-bold text-primary uppercase">{title}</h3>
        <span className="font-medium text-primary">Xem tất cả</span>
      </div>

      <div className="mb-15 flex gap-12">
        {brands.map((brand, index) => (
          <span
            key={index}
            className="px-8 rounded-sm cursor-pointer min-w-80 text-center bg-gray-200 border-gray-300 py-2 border"
          >
            {brand}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  );
}

export default PreviewListProducts;
