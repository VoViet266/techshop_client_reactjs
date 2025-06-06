import { useState, useEffect, use } from "react";
import Skeleton from "react-loading-skeleton";
import { ImagesSlider } from "@components/app";
import "react-loading-skeleton/dist/skeleton.css";
import { PreviewListProducts } from "@components/products";

function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="relative w-[60%] mt-20">
        {loading ? <Skeleton className="h-500" /> : <ImagesSlider />}
      </div>
      <div className="mb-50">
        <PreviewListProducts loading={loading} title="Điện thoại nổi bật" />
        <PreviewListProducts loading={loading} title="Laptop nổi bật" />
        <PreviewListProducts loading={loading} title="TV nổi bật" />
      </div>
    </>
  );
}

export default Home;
