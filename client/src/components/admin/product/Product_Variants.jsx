import React, { useEffect, useState } from 'react';
import { Button, Input, Upload, Card, Row, Col, Form, Image } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import { useAppContext } from '@/contexts';

function Variants({ product, setProduct, form, setImagesToDelete }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const { message } = useAppContext();

  useEffect(() => {
    if (product) {
      form?.setFieldsValue({ variants: product.variants });
    }
  }, [form]);

  const handleFileChange = ({ fileList }, variantIndex) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    const filesToKeep = fileList
      .map((file) => (file.originFileObj ? file.originFileObj : file.url))
      .filter(Boolean);

    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: filesToKeep,
    };

    form.setFieldsValue({ variants: updatedVariants });
  };

  const handleDraggerRemove = (file, variantIndex) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    const currentVariantImages = [...updatedVariants[variantIndex].images];
    const removedUid = file.uid;

    const imageIndex = currentVariantImages.findIndex((img) => {
      let imgUid = '';
      if (img instanceof File) {
        imgUid = `new-file-${variantIndex}-${img.name}-${img.size}-${img.lastModified}`;
      } else if (typeof img === 'string') {
        imgUid = `existing-url-${variantIndex}-${img}`;
      }
      return imgUid === removedUid;
    });

    if (imageIndex !== -1) {
      const removedImage = currentVariantImages[imageIndex];
      if (typeof removedImage === 'string') {
        setImagesToDelete((prev) => [...prev, removedImage]);
      }
      currentVariantImages.splice(imageIndex, 1);
      updatedVariants[variantIndex].images = currentVariantImages;
    }

    form.setFieldsValue({ variants: updatedVariants });
    return true;
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
        <span className="text-sm text-primary font-semibold">
          Thông tin biến thể
        </span>
        <div className="flex-1 border-t border-gray-300 opacity-60 mx-4"></div>
      </div>

      <Form.List name="variants">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => {
              const variant = form.getFieldValue(['variants', index]) || {};

              return (
                <div
                  key={key}
                  className={`relative ${index !== 0 ? 'pt-12' : ''}`}
                >
                  {index !== 0 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      className="absolute top-4 right-4"
                    >
                      Xóa biến thể
                    </Button>
                  )}

                  <Row gutter={[10, 0]}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="Tên biến thể"
                        name={[name, 'name']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập tên biến thể!',
                          },
                        ]}
                      >
                        <Input placeholder="Nhập tên biến thể" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="Giá"
                        name={[name, 'price']}
                        rules={[
                          { required: true, message: 'Vui lòng nhập giá!' },
                        ]}
                      >
                        <Input placeholder="Nhập giá" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="Tên màu"
                        name={[name, 'color', 'name']}
                      >
                        <Input placeholder="Nhập tên màu" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[10, 0]}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="Mã màu"
                        name={[name, 'color', 'hex']}
                      >
                        <Input placeholder="Nhập mã màu (hex)" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="RAM"
                        name={[name, 'memory', 'ram']}
                      >
                        <Input placeholder="Nhập RAM" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        label="Bộ nhớ trong"
                        name={[name, 'memory', 'storage']}
                      >
                        <Input placeholder="Nhập bộ nhớ trong" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        label="Hình ảnh"
                        name={[name, 'images']}
                      >
                        <Dragger
                          name="files"
                          accept="image/*"
                          listType="picture"
                          multiple
                          onPreview={(file) => handlePreview(file)}
                          onRemove={(file) => handleDraggerRemove(file, index)}
                          beforeUpload={(file) => {
                            if (!file.type.startsWith('image/')) {
                              message.error('Chỉ hỗ trợ hình ảnh!');
                              return Upload.LIST_IGNORE;
                            }
                            return false;
                          }}
                          fileList={
                            variant.images?.map((img, i) => {
                              let url = '';
                              let uid = '';

                              if (img instanceof File) {
                                url = URL.createObjectURL(img);
                                uid = `new-file-${index}-${img.name}-${img.size}-${img.lastModified}`;
                              } else if (typeof img === 'string') {
                                url = img;
                                uid = `existing-url-${index}-${img}`;
                              }

                              return {
                                uid,
                                name:
                                  img instanceof File
                                    ? img.name
                                    : img.substring(img.lastIndexOf('/') + 1),
                                status: 'done',
                                url: url,
                                originFileObj:
                                  img instanceof File ? img : undefined,
                              };
                            }) || []
                          }
                          onChange={(event) => handleFileChange(event, index)}
                        >
                          <div
                            className="flex flex-col items-center justify-center"
                            style={{ height: '150px' }}
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
                              onVisibleChange: (visible) =>
                                setPreviewOpen(visible),
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
              );
            })}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                block
              >
                Thêm biến thể
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );
}

export default Variants;
