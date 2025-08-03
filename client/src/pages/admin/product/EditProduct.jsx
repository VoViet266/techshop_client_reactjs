import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Upload,
  message as antMessage,
} from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Files from '@services/files';
import Brands from '@services/brands';
import Categories from '@services/categories';
import { useAppContext } from '@contexts';
import { CommonInformation, Variants } from '@pages/admin/product';
import {
  callDeleteFile,
  callFetchProductDetail,
  callUpdateProduct,
} from '@/services/apis';

const { Dragger } = Upload;

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    message,
    notification,
    setToastLoading,
    setLoadingSuccess,
    setLoadingError,
  } = useAppContext();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [galleryImagesToDelete, setGalleryImagesToDelete] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState(null);
  const [fieldsToShow, setFieldsToShow] = useState({});

  const [form] = Form.useForm();

  const groupTitles = {
    specifications: 'Thông số kỹ thuật',
    connectivity: 'Kết nối',
    'camera.front': 'Camera trước',
    'camera.rear': 'Camera sau',
  };

  useEffect(() => {
    document.title = 'Cập nhật sản phẩm';
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, brs, prodRes] = await Promise.all([
          Categories.getAll(),
          Brands.getAll(),
          callFetchProductDetail(id),
        ]);

        const fetchedProduct = prodRes.data.data;

        setCategories(cats);
        setBrands(brs);
        setProduct(fetchedProduct);

        // Set gallery images from existing product
        if (
          fetchedProduct.galleryImages &&
          fetchedProduct.galleryImages.length > 0
        ) {
          const existingGalleryImages = fetchedProduct.galleryImages.map(
            (url, index) => ({
              uid: `existing-gallery-${index}`,
              name: `gallery-${index}`,
              status: 'done',
              url: url,
            }),
          );
          setGalleryImages(existingGalleryImages);
        }

        const initialCategory = cats.find(
          (c) => c._id === fetchedProduct.category._id,
        );

        if (initialCategory?.configFields) {
          setSelectedCategoryConfig(initialCategory);
          setFieldsToShow(initialCategory.configFields);
        } else {
          setFieldsToShow({});
        }

        form.setFieldsValue({
          ...fetchedProduct,
          category: fetchedProduct.category._id,
          brand: fetchedProduct.brand._id,
          attributes: fetchedProduct.attributes || {},
          variants: fetchedProduct.variants || [],
        });
      } catch (err) {
        console.error(err);
        notification.error({
          message: 'Không thể tải sản phẩm',
          description: `Lỗi: ${err.message}`,
        });
        setLoadingError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, message, setLoadingError, form]);

  const onCategoryChange = (categoryId) => {
    const foundCategory = categories.find((c) => c._id === categoryId);
    form.setFieldValue('category', categoryId);
    if (foundCategory?.configFields) {
      setSelectedCategoryConfig(foundCategory);
      setFieldsToShow(foundCategory.configFields);
    } else {
      setSelectedCategoryConfig(null);
      setFieldsToShow({});
    }
  };

  // Gallery image handling functions
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.warning({
        message: 'Chỉ có thể upload file hình ảnh!',
        duration: 4.5,
      });
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.warning({
        message: 'Kích thước file phải nhỏ hơn 5MB!',
        duration: 4.5,
      });
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleGalleryImageChange = ({ fileList }) => {
    setGalleryImages(fileList);

    // Update product state
    setProduct((prev) => ({
      ...prev,
      galleryImages: fileList
        .map((file) => file.originFileObj || file.url)
        .filter(Boolean),
    }));
  };

  const handleRemoveGalleryImage = (file) => {
    const newFileList = galleryImages.filter((item) => item.uid !== file.uid);
    setGalleryImages(newFileList);

    // If file already exists on server (has URL), add to delete list
    if (file.url && typeof file.url === 'string') {
      setGalleryImagesToDelete((prev) => [...prev, file.url]);
    }

    setProduct((prev) => ({
      ...prev,
      galleryImages: newFileList
        .map((file) => file.originFileObj || file.url)
        .filter(Boolean),
    }));
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-6">
      <InboxOutlined className="text-4xl text-gray-400 mb-3" />
      <div className="text-gray-600 text-base mb-1">
        Kéo thả hoặc nhấp để chọn hình ảnh
      </div>
      <div className="text-gray-400 text-sm">
        PNG, JPG tối đa 5MB (tối đa 5 ảnh)
      </div>
    </div>
  );

  const renderExtraFields = (group) => {
    const fields =
      fieldsToShow.extraFields?.filter((f) => f.group === group) || [];
    const chunks = [];
    for (let i = 0; i < fields.length; i += 2) {
      chunks.push(fields.slice(i, i + 2));
    }
    if (fields.length === 0) return null;
    return (
      <>
        <div className="flex gap-4 items-center mb-10 relative">
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
              {groupTitles[group] || 'Thông tin bổ sung'}
            </span>
          </div>
          <div className="flex-1 relative">
            <div className="border-t border-gray-300 opacity-60"></div>
          </div>
        </div>
        {chunks.map((pair, index) => (
          <Row key={index} gutter={16}>
            {pair.map((field) => (
              <Col span={12} key={field.name}>
                <Form.Item
                  name={['attributes', field.name]}
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

  const onSubmit = async () => {
    try {
      const validatedValues = form.getFieldsValue();
      console.log(validatedValues);

      setToastLoading(true);
      message.loading({ content: 'Đang cập nhật sản phẩm...', key: 'update' });

      // Delete old gallery images
      if (galleryImagesToDelete.length > 0) {
        await Promise.all(
          galleryImagesToDelete.map(async (imgUrl) => {
            try {
              console.log('Deleting gallery image:', imgUrl);
              await Files.callDelete(imgUrl);
            } catch (e) {
              console.warn('Không thể xóa ảnh gallery (bỏ qua):', imgUrl, e);
            }
          }),
        );
      }

      // Delete old variant images
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map(async (imgUrl) => {
            try {
              console.log('Deleting variant image:', imgUrl);
              await Files.callDelete(imgUrl);
            } catch (e) {
              console.warn('Không thể xóa ảnh variant (bỏ qua):', imgUrl, e);
            }
          }),
        );
      }

      const productToSubmit = { ...product, ...validatedValues };
      productToSubmit._id = product._id;
      productToSubmit.category = validatedValues.category;
      productToSubmit.brand = validatedValues.brand;
      productToSubmit.description = validatedValues.description || '';
      productToSubmit.attributes = validatedValues.attributes || {};
      productToSubmit.variants = validatedValues.variants || [];

      // Handle gallery images upload
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
      } else {
        productToSubmit.galleryImages = [];
      }

      // Handle variant images upload - Updated for new schema
      if (productToSubmit.variants && productToSubmit.variants.length > 0) {
        for (let i = 0; i < productToSubmit.variants.length; i++) {
          const variant = productToSubmit.variants[i];

          // Upload color-specific images
          if (variant.color && variant.color.length > 0) {
            for (let j = 0; j < variant.color.length; j++) {
              const color = variant.color[j];
              if (color.images && color.images.length > 0) {
                const uploadedColorImages = [];
                for (let k = 0; k < color.images.length; k++) {
                  const image = color.images[k];
                  if (image instanceof File) {
                    const imageUrl = await Files.upload(image);
                    uploadedColorImages.push(imageUrl);
                  } else if (typeof image === 'string') {
                    uploadedColorImages.push(image);
                  }
                }
                productToSubmit.variants[i].color[j].images =
                  uploadedColorImages;
              }
            }
          }
        }
      }
  
      await callUpdateProduct(productToSubmit);
      message.success({
        content: 'Cập nhật sản phẩm thành công!',
        key: 'update',
      });
      setToastLoading(false);
      setLoadingSuccess(true);
      navigate('/admin/product');
    } catch (errInfo) {
      console.error('Đã có lỗi xảy ra khi cập nhật sản phẩm:', errInfo);

      setToastLoading(false);
      setLoadingError(true);

      if (errInfo.errorFields && errInfo.errorFields.length > 0) {
        message.error({
          content: 'Vui lòng kiểm tra lại thông tin đã nhập',
          key: 'update',
        });
      } else {
        notification.error({
          message: 'Đã có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng kiểm tra.',
          description: errInfo.message,
          duration: 4.5,
          key: 'update',
        });
      }
    }
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

  if (loading || !product) {
    return <Skeleton height={600} />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Cập nhật sản phẩm
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onSubmit}
      >
        <CommonInformation
          brands={brands}
          categories={categories}
          onCategoryChange={onCategoryChange}
          form={form}
          product={product}
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
              <div className="border-t border-gray-300 opacity-60"></div>
            </div>
          </div>

          <Form.Item
            name="galleryImages"
            extra="Chọn những hình ảnh để quảng bá sản phẩm"
          >
            <Dragger
              fileList={galleryImages}
              onChange={handleGalleryImageChange}
              onRemove={handleRemoveGalleryImage}
              beforeUpload={beforeUpload}
              maxCount={5}
              onPreview={(file) => handlePreview(file)}
              multiple={true}
              className="gallery-upload"
              listType="picture-card"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
            >
              {uploadButton}
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

        <Variants
          form={form}
          product={product}
          setProduct={setProduct}
          setImagesToDelete={setImagesToDelete}
        />

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
                htmlType="submit"
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default EditProduct;
