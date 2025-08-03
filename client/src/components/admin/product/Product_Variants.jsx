import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Upload,
  Card,
  Row,
  Col,
  Form,
  Image,
  InputNumber,
  Switch,
  Select,
  ColorPicker,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import { useAppContext } from '@/contexts';

const { Option } = Select;

function Variants({ product, setProduct, form, setImagesToDelete }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const { message } = useAppContext();

  // Predefined options to reduce typing
  const ramOptions = ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '32 GB'];
  const storageOptions = [
    '32 GB',
    '64 GB',
    '128 GB',
    '256 GB',
    '512 GB',
    '1 TB',
    '2 TB',
  ];

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      form?.setFieldsValue({ variants: product.variants });
    } else {
      // Khởi tạo một biến thể mặc định theo schema
      const defaultVariant = {
        name: '',
        price: 0,
        color: [
          {
            colorName: '',
            colorHex: '#000000',
            images: [],
          },
        ],
        memory: {
          ram: '',
          storage: '',
        },

        weight: 0,
        isActive: true,
      };
      // FIX: Phải wrap trong array
      form?.setFieldsValue({ variants: [defaultVariant] });
    }
  }, [product, form]);

  // Handle main variant image (single image according to schema)
  const handleVariantImageChange = ({ fileList }, variantIndex) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    // Take only the first image since schema expects single string
    const latestFile = fileList[fileList.length - 1];
    const imageToKeep = latestFile
      ? latestFile.originFileObj
        ? latestFile.originFileObj
        : latestFile.url
      : '';

    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
    };

    form.setFieldsValue({ variants: updatedVariants });
  };

  // Handle color-specific images
  const handleColorImageChange = ({ fileList }, variantIndex, colorIndex) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    const filesToKeep = fileList
      .map((file) => (file.originFileObj ? file.originFileObj : file.url))
      .filter(Boolean);

    // Ensure color array exists
    if (!updatedVariants[variantIndex].color) {
      updatedVariants[variantIndex].color = [];
    }
    if (!updatedVariants[variantIndex].color[colorIndex]) {
      updatedVariants[variantIndex].color[colorIndex] = {
        colorName: '',
        colorHex: '#000000',
        images: [],
      };
    }

    updatedVariants[variantIndex].color[colorIndex].images = filesToKeep;
    form.setFieldsValue({ variants: updatedVariants });
  };

  const handleImageRemove = (file, variantIndex, colorIndex = null) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    if (colorIndex !== null) {
      // Handle color image removal (array)
      let currentImages = [
        ...(updatedVariants[variantIndex].color?.[colorIndex]?.images || []),
      ];

      const removedUid = file.uid;
      const imageIndex = currentImages.findIndex((img) => {
        let imgUid = '';
        if (img instanceof File) {
          imgUid = `new-file-${variantIndex}-${colorIndex}-${img.name}-${img.size}-${img.lastModified}`;
        } else if (typeof img === 'string') {
          imgUid = `existing-url-${variantIndex}-${colorIndex}-${img}`;
        }
        return imgUid === removedUid;
      });

      if (imageIndex !== -1) {
        const removedImage = currentImages[imageIndex];
        if (typeof removedImage === 'string') {
          setImagesToDelete((prev) => [...prev, removedImage]);
        }
        currentImages.splice(imageIndex, 1);
        updatedVariants[variantIndex].color[colorIndex].images = currentImages;
      }
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

  const createFileList = (images, variantIndex, colorIndex = null) => {
    if (colorIndex !== null) {
      // Handle color images (array)
      return (
        images?.map((img, i) => {
          let url = '';
          let uid = '';

          if (img instanceof File) {
            url = URL.createObjectURL(img);
            uid = `new-file-${variantIndex}-${colorIndex}-${img.name}-${img.size}-${img.lastModified}`;
          } else if (typeof img === 'string') {
            url = img;
            uid = `existing-url-${variantIndex}-${colorIndex}-${img}`;
          }

          return {
            uid,
            name: img instanceof File ? img.name : '',
            status: 'done',
            url: url,
            originFileObj: img instanceof File ? img : undefined,
          };
        }) || []
      );
    } else {
      // Handle main image (single string)
      if (!images) return [];

      let url = '';
      let uid = '';

      if (images instanceof File) {
        url = URL.createObjectURL(images);
        uid = `new-file-${variantIndex}-main-${images.name}-${images.size}-${images.lastModified}`;
      } else if (typeof images === 'string' && images) {
        url = images;
        uid = `existing-url-${variantIndex}-main-${images}`;
      } else {
        return [];
      }

      return [
        {
          uid,
          name:
            images instanceof File
              ? images.name
              : images.substring(images.lastIndexOf('/') + 1),
          status: 'done',
          url: url,
          originFileObj: images instanceof File ? images : undefined,
        },
      ];
    }
  };

  // const handleColorPresetChange = (value, variantIndex, colorIndex) => {
  //   const preset = colorPresets.find((p) => p.name === value);
  //   if (preset) {
  //     const currentVariants = form.getFieldValue('variants') || [];
  //     const updatedVariants = [...currentVariants];

  //     if (!updatedVariants[variantIndex].color) {
  //       updatedVariants[variantIndex].color = [];
  //     }
  //     if (!updatedVariants[variantIndex].color[colorIndex]) {
  //       updatedVariants[variantIndex].color[colorIndex] = {
  //         colorName: '',
  //         colorHex: '#000000',
  //         images: [],
  //       };
  //     }
  //     updatedVariants[variantIndex].color[colorIndex].colorName = preset.name;
  //     updatedVariants[variantIndex].color[colorIndex].colorHex = preset.hex;

  //     form.setFieldsValue({ variants: updatedVariants });
  //   }
  // };

  // Handle ColorPicker change
  const handleColorPickerChange = (color, variantIndex, colorIndex) => {
    const currentVariants = form.getFieldValue('variants') || [];
    const updatedVariants = [...currentVariants];

    if (!updatedVariants[variantIndex].color) {
      updatedVariants[variantIndex].color = [];
    }
    if (!updatedVariants[variantIndex].color[colorIndex]) {
      updatedVariants[variantIndex].color[colorIndex] = {
        colorName: '',
        colorHex: '#000000',
        images: [],
      };
    }

    updatedVariants[variantIndex].color[colorIndex].colorHex =
      color.toHexString();
    form.setFieldsValue({ variants: updatedVariants });
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
                <Card
                  key={key}
                  title={`Biến thể ${index + 1}`}
                  className="mb-6"
                  extra={
                    fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa biến thể
                      </Button>
                    )
                  }
                >
                  {/* Basic Info */}
                  <Row gutter={[10, 10]}>
                    <Col span={12}>
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
                        <Input placeholder="VD: iPhone 15 Pro Max" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        label="Giá (VNĐ)"
                        name={[name, 'price']}
                        rules={[
                          { required: true, message: 'Vui lòng nhập giá!' },
                        ]}
                      >
                        <InputNumber
                          placeholder="Nhập giá"
                          style={{ width: '100%' }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label="RAM"
                        name={[name, 'memory', 'ram']}
                      >
                        <Select
                          placeholder="Chọn hoặc nhập RAM"
                          showSearch
                          allowClear
                          mode="combobox"
                          style={{ width: '100%' }}
                        >
                          {ramOptions.map((ram) => (
                            <Option key={ram} value={ram}>
                              {ram}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label="Bộ nhớ trong"
                        name={[name, 'memory', 'storage']}
                      >
                        <Select
                          placeholder="Chọn hoặc nhập bộ nhớ"
                          showSearch
                          allowClear
                          mode="combobox"
                          style={{ width: '100%' }}
                        >
                          {storageOptions.map((storage) => (
                            <Option key={storage} value={storage}>
                              {storage}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>  

                  {/* Colors Section */}
                  <div className="mt-6">
                    <h4 className="text-base font-medium mb-4">
                      Màu sắc và hình ảnh theo màu
                    </h4>
                    <Form.List name={[name, 'color']}>
                      {(
                        colorFields,
                        { add: addColor, remove: removeColor },
                      ) => (
                        <>
                          {colorFields.map(
                            (
                              {
                                key: colorKey,
                                name: colorName,
                                ...colorRestField
                              },
                              colorIndex,
                            ) => {
                              const colorData =
                                variant.color?.[colorIndex] || {};

                              return (
                                <Card
                                  key={colorKey}
                                  size="small"
                                  className="mb-4"
                                  title={`Màu ${colorIndex + 1}`}
                                  extra={
                                    colorFields.length > 1 && (
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeColor(colorName)}
                                      >
                                        Xóa màu
                                      </Button>
                                    )
                                  }
                                >
                                  <Row gutter={[16, 0]}>
                                    <Col span={8}>
                                      <Form.Item
                                        {...colorRestField}
                                        label="Tên màu"
                                        name={[colorName, 'colorName']}
                                      >
                                        <Input placeholder="VD: Xanh Titan" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...colorRestField}
                                        label="Chọn màu"
                                        name={[colorName, 'colorHex']}
                                        rules={[
                                          {
                                            required: true,
                                            message: 'Vui lòng chọn màu!',
                                          },
                                        ]}
                                      >
                                        <ColorPicker
                                          defaultValue="#1677ff"
                                          showText
                                          allowClear
                                          onChange={(color) =>
                                            handleColorPickerChange(
                                              color,
                                              index,
                                              colorIndex,
                                            )
                                          }
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>

                                  <Form.Item
                                    {...colorRestField}
                                    label={`Hình ảnh cho màu ${colorData.colorName || colorIndex + 1}`}
                                    name={[colorName, 'images']}
                                  >
                                    <Dragger
                                      name="files"
                                      accept="image/*"
                                      listType="picture"
                                      multiple
                                      onPreview={handlePreview}
                                      onRemove={(file) =>
                                        handleImageRemove(
                                          file,
                                          index,
                                          colorIndex,
                                        )
                                      }
                                      beforeUpload={(file) => {
                                        if (!file.type.startsWith('image/')) {
                                          message.error('Chỉ hỗ trợ hình ảnh!');
                                          return Upload.LIST_IGNORE;
                                        }
                                        return false;
                                      }}
                                      fileList={createFileList(
                                        colorData.images,
                                        index,
                                        colorIndex,
                                      )}
                                      onChange={(event) =>
                                        handleColorImageChange(
                                          event,
                                          index,
                                          colorIndex,
                                        )
                                      }
                                    >
                                      <div
                                        className="flex flex-col items-center justify-center"
                                        style={{ height: '100px' }}
                                      >
                                        <UploadOutlined className="text-3xl text-gray-400 mb-2" />
                                        <span className="text-gray-600 text-sm">
                                          Ảnh cho màu này
                                        </span>
                                      </div>
                                    </Dragger>
                                  </Form.Item>
                                </Card>
                              );
                            },
                          )}

                          <Button
                            type="dashed"
                            onClick={() =>
                              addColor({
                                colorName: '',
                                colorHex: '#000000',
                                images: [],
                              })
                            }
                            icon={<PlusOutlined />}
                            className="mb-4"
                          >
                            Thêm màu
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </div>
                </Card>
              );
            })}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    name: '',
                    price: 0,
                    weight: 0,
                    isActive: true,
                    color: [
                      {
                        colorName: '',
                        colorHex: '#000000',
                        images: [],
                      },
                    ],
                    memory: {
                      ram: '',
                      storage: '',
                    },
                   
                  })
                }
                icon={<PlusOutlined />}
                block
                size="large"
              >
                Thêm biến thể mới
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

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
    </div>
  );
}

export default Variants;
