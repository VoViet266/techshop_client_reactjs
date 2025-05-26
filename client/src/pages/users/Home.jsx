import { ImagesSlider } from "@components/app";
import { PreviewListProducts } from "@components/products";

function Home() {
  return (
    <>
      <div className="relative w-[60%] mt-20">
        <ImagesSlider />
      </div>
      <div className="mb-50">
        <PreviewListProducts title="Điện thoại nổi bật" />
        <PreviewListProducts title="Laptop nổi bật" />
        <PreviewListProducts title="TV nổi bật" />
      </div>
    </>
  );
}

export default Home;
