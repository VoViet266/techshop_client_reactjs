import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Upload,
  Card,
  Row,
  Col,
  Form,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import { callDeleteFile } from '@/services/apis';
import { useAppContext } from '@/contexts';

function Variants({ product, setProduct, form, setImagesToDelete }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const { message } = useAppContext();

  useEffect(() => {
    if (product) {
      form?.setFieldsValue({ variants: product.variants });
    }
  }, [product, form]);

  const handleFileChange = (event, variantIndex) => {
    const files = event.fileList.map((file) => {
      if (file.originFileObj) {
        return new File([file.originFileObj], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        });
      }
      return file;
    });
    const oldVariant = product.variants[variantIndex];
    if (oldVariant.images && oldVariant.images.length > 0) {
      oldVariant.images.forEach((image) => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    }

    setProduct((currentProduct) => {
      const newProduct = { ...currentProduct };
      newProduct.variants[variantIndex].images = files;
      return newProduct;
    });
  };

  const handleRemoveImage = async (variantIndex, imageIndex) => {
    try {
      const imageToRemove = product.variants[variantIndex].images[imageIndex];
      if (!(imageToRemove instanceof File) && imageToRemove) {
        setImagesToDelete((prev) => [...prev, imageToRemove]);
      }
      setProduct((currentProduct) => {
        const newProduct = {
          ...currentProduct,
          variants: currentProduct.variants.map((variant, idx) => {
            if (idx === variantIndex) {
              const newImages = [...variant.images];
              const removedImage = newImages[imageIndex];

              if (removedImage instanceof File) {
                URL.revokeObjectURL(URL.createObjectURL(removedImage));
              }

              newImages.splice(imageIndex, 1);

              return {
                ...variant,
                images: newImages,
              };
            }
            return variant;
          }),
        };
        return newProduct;
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Có lỗi xảy ra khi xóa ảnh');
    }
  };

  const handleDraggerRemove = async (file, variantIndex) => {
    const imageIndex = product.variants[variantIndex].images.findIndex(
      (img, i) => {
        if (img instanceof File) {
          return img.name === file.name;
        }
        return i.toString() === file.uid;
      },
    );

    if (imageIndex !== -1) {
      await handleRemoveImage(variantIndex, imageIndex);
    }

    return false; // Ngăn không cho antd tự động xóa
  };

  const handleAddVariant = () => {
    console.log('các', product);
    setProduct((currentProduct) => ({
      ...currentProduct,
      variants: [
        ...currentProduct.variants,
        {
          name: '',
          price: '',
          compareAtPrice: '',
          color: { name: '', hex: '' },
          memory: { ram: '', storage: '' },
          images: [],
        },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    if (product.variants.length > 1) {
      setProduct((currentProduct) => {
        const newVariants = [...currentProduct.variants];
        newVariants.splice(index, 1);
        return {
          ...currentProduct,
          variants: newVariants,
        };
      });
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

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex gap-4 items-center mb-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
            Thông tin biến thể
          </span>
        </div>
        <div className="flex-1 relative">
          <div className="border-t border-r-300 opacity-60 text-primary"></div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVariant}
          className="bg-gray-100 hover:bg-gray-200 py-2 px-6 rounded text-sm font-medium"
        >
          Thêm biến thể
        </Button>
      </div>

      <div className="space-y-6">
        {product.variants.map((variant, index) => (
          <div key={index} className={`relative ${index !== 0 ? 'pt-12' : ''}`}>
            {index !== 0 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveVariant(index)}
                className="absolute top-4 right-4"
              >
                Xóa biến thể
              </Button>
            )}

            <Row gutter={[10, 0]}>
              <Col span={8}>
                <Form.Item
                  label="Tên biến thể"
                  name={['variants', index, 'name']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên biến thể!' },
                  ]}
                >
                  <Input placeholder="Nhập tên biến thể" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Giá"
                  name={['variants', index, 'price']}
                  rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                  <Input placeholder="Nhập giá" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Tên màu"
                  name={['variants', index, 'color', 'name']}
                >
                  <Input placeholder="Nhập tên màu" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[10, 0]}>
              <Col span={8}>
                <Form.Item
                  label="Mã màu"
                  name={['variants', index, 'color', 'hex']}
                >
                  <Input placeholder="Nhập mã màu (hex)" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="RAM"
                  name={['variants', index, 'memory', 'ram']}
                >
                  <Input placeholder="Nhập RAM" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Bộ nhớ trong"
                  name={['variants', index, 'memory', 'storage']}
                >
                  <Input placeholder="Nhập bộ nhớ trong" />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col
                span={24}
                style={{
                  height: 300,
                }}
              >
                <Form.Item
                  label="Hình ảnh"
                  name={['variants', index, 'images']}
                  // style={{
                  //   height: 250,
                  // }}
                >
                  <Dragger
                    name="files"
                    accept="image/*"
                    listType="picture"
                    // className="min-h-[300px] h-auto py-8 px-6 border-dashed border-2 border-gray-300 hover:border-gray-400 rounded-md"
                    onPreview={(file) => handlePreview(file)}
                    onRemove={(file) => handleDraggerRemove(file, index)}
                    beforeUpload={(file) => {
                      if (variant.images?.length >= 1) {
                        message.warning(
                          'Bạn chỉ có thể chọn một ảnh. Vui lòng xóa ảnh cũ trước.',
                        );
                        return Upload.LIST_IGNORE;
                      }
                      if (!file.type.startsWith('image/')) {
                        message.error('Chỉ hỗ trợ hình ảnh!');
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                    fileList={
                      variant.images?.map((img, i) => ({
                        uid: `${i}`,
                        name: img instanceof File ? img.name : `image-${i}`,
                        status: 'done',
                        url:
                          img instanceof File ? URL.createObjectURL(img) : img,
                        originFileObj: img instanceof File ? img : undefined,
                      })) || []
                    }
                    onChange={(event) => handleFileChange(event, index)}
                  >
                    <div
                      className="flex flex-col items-center justify-center "
                      style={{
                        height: '150px ',
                      }}
                    >
                      <UploadOutlined className="text-5xl text-gray-400 mb-4" />
                      <span className="text-gray-600 text-base">
                        Kéo hoặc chọn ảnh
                      </span>
                    </div>
                  </Dragger>
                  {previewImage && (
                    <Image
                      wrapperStyle={{ display: 'none' }}
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) =>
                          !visible && setPreviewImage(''),
                      }}
                      src={previewImage}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Variants;
