import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button, Form, message, Spin } from 'antd';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import Files from '@services/files';
import Brands from '@services/brands';
import Categories from '@services/categories';
import { useAppContext } from '@contexts';

import {
  CommonInformation,
  Specifications,
  ConnectionInformation,
  CameraInformations,
  Variants,
} from '@pages/admin/product';
import {
  callDeleteFile,
  callFetchProductDetail,
  callUpdateProduct,
} from '@/services/apis';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setToastLoading, setLoadingSuccess, setLoadingError } =
    useAppContext();

  const { message } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [productError, setProductError] = useState({});
  const [productMessage, setProductMessage] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [form] = Form.useForm();
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, brs, prod] = await Promise.all([
          Categories.getAll(),
          Brands.getAll(),
          callFetchProductDetail(id),
        ]);
        setCategories(cats);
        setBrands(brs);
        setProduct(prod.data.data);
        message.success('Lấy thống tin sản phẩm');
      } catch (err) {
        console.error(err);
        message.error('Không thể tải thống tin sản phẩm');
        setLoadingError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const onSubmit = async () => {
    try {
      setToastLoading(true);
      message.destroy();
      message.loading({ content: 'Đang cập nhật sản phẩm...', key: 'update' });

      // Xoá ảnh cũ trước (chỉ ảnh là URL)
      await Promise.all(imagesToDelete.map((imgUrl) => callDeleteFile(imgUrl)));
      const formValues = form.getFieldsValue();
      const prodSub = { ...product, ...formValues };
      for (let v of prodSub.variants) {
        const newImgs = [];
        for (let img of v.images) {
          if (img instanceof File) {
            newImgs.push(await Files.upload(img));
          } else {
            newImgs.push(img);
          }
        }
        v.images = newImgs;

        v.images = newImgs;
      }

      await callUpdateProduct(prodSub);
      message.success('Cập nhật thành công!');
      setToastLoading(false);
      setLoadingSuccess(true);
      navigate('/admin/product');
    } catch (err) {
      console.error(err);
      setToastLoading(false);
      setLoadingError(true);
      message.error('Cập nhật thất bại');
    }
  };

  if (loading || !product) {
    return <Skeleton height={600} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Chỉnh sửa sản phẩm</h1>

      <Form form={form} layout="vertical" autoComplete="off">
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          <CommonInformation
            brands={brands}
            categories={categories}
            product={product}
            productError={productError}
            productMessage={productMessage}
            form={form}
          />
          <Specifications
            setProduct={setProduct}
            product={product}
            form={form}
          />
          <ConnectionInformation
            setProduct={setProduct}
            product={product}
            form={form}
          />
          <CameraInformations
            setProduct={setProduct}
            product={product}
            form={form}
          />
          <Variants
            setProduct={setProduct}
            setImagesToDelete={setImagesToDelete}
            product={product}
            form={form}
          />
        </div>

        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex gap-3">
              <Button size="large" onClick={() => navigate(-1)}>
                Hủy bỏ
              </Button>
              <Button type="primary" size="large" onClick={onSubmit}>
                Cập nhật
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default EditProduct;
