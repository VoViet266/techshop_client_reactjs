import {
  Variants,
  Specifications,
  CommonInformation,
  CameraInformations,
  ConnectionInformation,
} from '@pages/admin/product';

import Files from '@services/files';
import Brands from '@services/brands';
import Categories from '@services/categories';
import Products from '@/services/products';

import { useAppContext } from '@contexts';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
  message as antMessage,
  notification,
} from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

function AddProduct() {
  const { message, notification } = useAppContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fieldsToShow, setFieldsToShow] = useState({});
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    discount: '',
    isActive: true,
    attributes: {},
    galleryImages: [],
    variants: [
      {
        name: '',
        price: '',
        color: { name: '', hex: '' },
        memory: { ram: '', storage: '' },
        images: [],
      },
    ],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [fetchedCategories, fetchedBrands] = await Promise.all([
        Categories.getAll(),
        Brands.getAll(),
      ]);
      setCategories(fetchedCategories);
      setBrands(fetchedBrands);
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Lỗi tải dữ liệu danh sách thuật hành',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const onCategoryChange = (categoryId) => {
    const foundCategory = categories.find((c) => c._id === categoryId);
    setSelectedCategory(categoryId);
    form.setFieldValue('category', categoryId);
    if (foundCategory?.configFields) {
      setFieldsToShow(foundCategory.configFields);
    } else {
      setFieldsToShow({});
    }
  };

  // Hàm xử lý upload gallery images
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.warrning({
        message: 'Chỉ có thể upload file hình ảnh!',
        duration: 4.5,
      });
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.warrning({
        message: 'Kích thước file phải nhỏ hơn 5MB!',
        duration: 4.5,
      });
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleGalleryImageChange = ({ fileList }) => {
    setGalleryImages(fileList);

    setProduct((prev) => ({
      ...prev,
      galleryImages: fileList
        .map((file) => file.originFileObj || file.url)
        .filter(Boolean),
    }));
  };

  const onSubmit = async () => {
    try {
      setProduct(form.getFieldsValue());

      message.loading({ content: 'Đang thêm sản phẩm', key: 'adding-product' });

      const productToSubmit = form.getFieldsValue();
      productToSubmit.attributes = {
        ...productToSubmit.attributes,
        ...fieldsToShow.extraFields?.reduce((acc, field) => {
          acc[field.name] = form.getFieldValue([field.group, field.name]);
          return acc;
        }, {}),
      };

      if (galleryImages.length > 0) {
        const uploadedGalleryUrls = [];
        for (let i = 0; i < galleryImages.length; i++) {
          const file = galleryImages[i];
          if (file.originFileObj) {
            const imageUrl = await Files.upload(file.originFileObj);
            uploadedGalleryUrls.push(imageUrl);
          } else if (file.url) {
            uploadedGalleryUrls.push(file.url);
          }
        }
        productToSubmit.galleryImages = uploadedGalleryUrls;
      }

      for (let i = 0; i < productToSubmit.variants.length; i++) {
        const variant = productToSubmit.variants[i];
        const uploadedUrls = [];
        for (let j = 0; j < variant.images.length; j++) {
          const imageUrl = await Files.upload(variant.images[j]);
          uploadedUrls.push(imageUrl);
        }
        productToSubmit.variants[i].images = uploadedUrls;
      }

      const addProduct = await Products.add(productToSubmit);

      if (addProduct) {
        message.success({
          content: 'Thêm sản phẩm thành công',
          key: 'adding-product',
        });
        navigate('/admin/product');
      }
    } catch (error) {
      console.error('Đã có lỗi xảy ra khi thêm sản phẩm:', error);
      message.error({
        content: 'Thêm sản phẩm thất bại',
        key: 'adding-product',
      });
    }
  };

  const groupTitles = {
    specifications: 'Thông số kỹ thuật',
    connectivity: 'Kết nối',
    'camera.front': 'Camera trước',
    'camera.rear': 'Camera sau',
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const renderExtraFields = (group) => {
    const fields =
      fieldsToShow.extraFields?.filter((f) => f.group === group) || [];

    const chunks = [];
    for (let i = 0; i < fields.length; i += 2) {
      chunks.push(fields.slice(i, i + 2));
    }

    return (
      <>
        <div className="flex gap-4 items-center mb-10 relative">
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
              {groupTitles[group] || 'Thông tin bổ sung'}
            </span>
          </div>
          <div className="flex-1 relative">
            <div className="border-t border-r-300 opacity-60 text-primary"></div>
          </div>
        </div>
        {chunks.map((pair, index) => (
          <Row key={index} gutter={16}>
            {pair.map((field) => (
              <Col span={12} key={field.name}>
                <Form.Item
                  name={[group, field.name]}
                  label={field.label}
                  rules={
                    field.required
                      ? [
                          {
                            required: true,
                            message: `${field.label} là bắt buộc`,
                          },
                        ]
                      : []
                  }
                >
                  {field.type === 'text' || field.type === 'number' ? (
                    <Input
                      type={field.type}
                      placeholder={`Nhập thông tin ${field.label}`}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      options={(field.options || []).map((o) => ({
                        label: o,
                        value: o,
                      }))}
                    />
                  ) : field.type === 'checkbox' ? (
                    <Select
                      options={[
                        { label: 'Có', value: true },
                        { label: 'Không', value: false },
                      ]}
                    />
                  ) : null}
                </Form.Item>
              </Col>
            ))}
          </Row>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Thêm sản phẩm mới
        </h1>
      </div>

      <Form form={form} layout="vertical" autoComplete="off">
        <CommonInformation
          brands={brands}
          categories={categories}
          product={product}
          onCategoryChange={onCategoryChange}
          form={form}
        />

        {fieldsToShow.specifications && (
          <>{renderExtraFields('specifications')}</>
        )}

        {fieldsToShow.camera && (
          <>
            {renderExtraFields('camera.front')}
            {renderExtraFields('camera.rear')}
          </>
        )}

        {fieldsToShow.connectivity && <>{renderExtraFields('connectivity')}</>}

        <div className="mb-8">
          <div className="flex gap-4 items-center mb-6 relative">
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
                Hình ảnh quảng bá
              </span>
            </div>
            <div className="flex-1 relative">
              <div className="border-t border-r-300 opacity-60 text-primary"></div>
            </div>
          </div>

          <Form.Item name="galleryImages">
            <Dragger
              fileList={galleryImages}
              onChange={handleGalleryImageChange}
              onRemove={(file) =>
                setGalleryImages((prev) =>
                  prev.filter((f) => f.uid !== file.uid),
                )
              }
              beforeUpload={beforeUpload}
              maxCount={5}
              multiple={true}
              accept="image/*"
              onPreview={(file) => handlePreview(file)}
              className="gallery-upload"
              listType="picture"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
            >
              <div className="flex flex-col items-center justify-center p-6">
                <InboxOutlined className="text-4xl text-gray-400 mb-3" />
                <div className="text-gray-600 text-base mb-1">
                  Kéo thả hoặc nhấp để chọn hình ảnh
                </div>
              </div>
            </Dragger>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </Form.Item>
        </div>

        <Variants form={form} product={product} setProduct={setProduct} />

        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex gap-3">
              <Button
                size="large"
                disabled={loading}
                onClick={() => navigate(-1)}
                className="min-w-[120px] border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={onSubmit}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default AddProduct;
