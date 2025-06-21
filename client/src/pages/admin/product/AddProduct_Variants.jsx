import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Upload,
  Card,
  Row,
  Col,
  Form,
  Divider,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';

function Variants({
  product,
  setProduct,
  productError,

  setProductError,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

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

  const handleRemoveImage = (variantIndex, imageIndex) => {
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
  };

  const handleAddVariant = () => {
    setProduct((currentProduct) => {
      return {
        ...currentProduct,
        variants: [
          ...currentProduct.variants,
          {
            name: '',
            price: '',
            compareAtPrice: '',
            color: {
              name: '',
              hex: '',
            },
            memory: {
              ram: '',
              storage: '',
            },
            images: [],
          },
        ],
      };
    });

    setProductError({
      ...productError,
      variants: [
        ...productError.variants,
        {
          name: false,
          price: false,
          color: {
            name: false,
            hex: false,
          },
          images: false,
        },
      ],
    });
  };

  function handleRemoveVariant(index) {
    if (product.variants.length > 1) {
      setProduct((currentProduct) => {
        const newVariants = [...currentProduct.variants];
        newVariants.splice(index, 1);
        return {
          ...currentProduct,
          variants: newVariants,
        };
      });

      setProductError((currentError) => {
        const newVariants = [...currentError.variants];
        newVariants.splice(index, 1);
        return {
          ...currentError,
          variants: newVariants,
        };
      });
    }
  }

  const handleInputChange = (index, field, value, nestedField = null) => {
    setProduct((currentProduct) => {
      const newVariants = [...currentProduct.variants];
      if (nestedField) {
        newVariants[index] = {
          ...newVariants[index],
          [field]: {
            ...newVariants[index][field],
            [nestedField]: value,
          },
        };
      } else {
        newVariants[index] = {
          ...newVariants[index],
          [field]: field === 'price' ? parseInt(value) || '' : value,
        };
      }
      return {
        ...currentProduct,
        variants: newVariants,
      };
    });
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = (file) =>
    (async () => {
      if (!file.url && file.originFileObj) {
        file.preview = await getBase64(file.originFileObj);
      }

      setPreviewImage(file.url || file.preview); // ưu tiên url nếu có, fallback về preview
      setPreviewOpen(true);
    })();
  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex gap-12 items-center">
        <span className="text-sm text-primary font-medium">Biến thể</span>
        <div className="flex-1 border-t border-t-gray-300"></div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVariant}
          className="cursor-pointer flex items-center gap-4 bg-gray-100 hover:bg-gray-200 py-4 px-8 rounded-sm text-sm font-medium "
        >
          Thêm biến thể
        </Button>
      </div>
      <div className="space-y-6">
        {product.variants.map((variant, index) => (
          <Card
            key={index}
            className={`relative ${index !== 0 ? 'pt-12' : ''}`}
          >
            {index !== 0 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveVariant(index)}
                className="absolute top-4 right-4 flex items-center"
              >
                Xóa biến thể
              </Button>
            )}

            <Form layout="vertical" className="mt-4" autoComplete="off">
              <Row gutter={[10, 0]}>
                <Col span={8}>
                  <Form.Item label="Tên biến thể">
                    <Input
                      placeholder="Nhập tên biến thể"
                      value={variant.name}
                      onChange={(e) =>
                        handleInputChange(index, 'name', e.target.value)
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Giá">
                    <Input
                      placeholder="Nhập giá của biến thể"
                      value={variant.price}
                      onChange={(e) =>
                        handleInputChange(index, 'price', e.target.value)
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Tên màu">
                    <Input
                      placeholder="Nhập tên màu biến thể"
                      value={variant.color.name}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          'color',
                          e.target.value,
                          'name',
                        )
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Mã màu">
                    <Input
                      placeholder="Nhập mã màu của biến thể"
                      value={variant.color.hex}
                      onChange={(e) =>
                        handleInputChange(index, 'color', e.target.value, 'hex')
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="RAM">
                    <Input
                      placeholder="Nhập RAM của biến thể"
                      value={variant.memory.ram}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          'memory',
                          e.target.value,
                          'ram',
                        )
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Bộ nhớ trong">
                    <Input
                      placeholder="Nhập bộ nhớ trong của biến thể"
                      value={variant.memory.storage}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          'memory',
                          e.target.value,
                          'storage',
                        )
                      }
                      className="hover:border-gray-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  <Form.Item label="Hình ảnh">
                    <Dragger
                      name="files"
                      multiple={false}
                      accept="image/*"
                      maxCount={1}
                      listType="picture"
                      className="w-full min-h-[200px] focus:border-gray-400 rounded-md p-6 border-dashed border border-gray-300 hover:border-gray-400"
                      onPreview={(file) => handlePreview(file)}
                      onRemove={(file) => {
                        const variantIndex = product.variants.findIndex(
                          (v) => v === variant,
                        );
                        handleRemoveImage(variantIndex, file.uid);
                      }}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          message.error('Chỉ hỗ trợ tải lên hình ảnh.');
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      fileList={
                        variant.images && variant.images.length > 0
                          ? variant.images.map((img, i) => ({
                              uid: `${i}`,
                              name: img instanceof File ? img.name : img,
                              status: 'done',
                              url:
                                img instanceof File
                                  ? URL.createObjectURL(img)
                                  : img,
                              originFileObj:
                                img instanceof File ? img : undefined,
                            }))
                          : []
                      }
                      onChange={(event) => handleFileChange(event, index)}
                    >
                      <div className="flex flex-col items-center justify-center h-150">
                        <UploadOutlined className="text-6xl text-gray-400 mb-6" />
                        <span className="text-gray-600 text-lg mb-2">
                          Nhấp hoặc kéo thả để tải lên
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
            </Form>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Variants;
