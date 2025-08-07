import { useState, useEffect } from 'react';
import { Actions, Subjects } from '@/constants/permissions';
import Products from '@services/products';
import {
  Tag,
  Select,
  Button,
  Image,
  Row,
  Col,
  Modal,
  Statistic,
  Input,
  Typography,
  Flex,
  Empty,
  Card,
  Descriptions,
  Space,
  Spin,
  Table,
  Badge,
  Avatar,
} from 'antd';
import { hasPermission } from '@helpers';
import {
  TagOutlined,
  WifiOutlined,
  CameraOutlined,
  FilterOutlined,
  MobileOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import {
  callDeleteProduct,
  callFetchBrands,
  callFetchCategories,
} from '@/services/apis';
import { useAppContext } from '@/contexts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExpandedRowRender } from '@/components/admin/product/ExpandRowRender';

const { Text } = Typography;
const { Option } = Select;

function ListProduct() {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Bạn có chắc chắn muốn xóa?');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const { message, notification, user, permissions } = useAppContext();
  const navigate = useNavigate();
  const _page = searchParams.get('_page') || 1;
  const _limit = searchParams.get('_limit') || 10;
  const _category = searchParams.get('_category') || null;
  const canUpdateProduct = hasPermission(
    permissions,
    Subjects.Product,
    Actions.Update,
  );
  const canDeleteProduct = hasPermission(
    permissions,
    Subjects.Product,
    Actions.Delete,
  );
  const canReadProduct = hasPermission(
    permissions,
    Subjects.Product,
    Actions.Read,
  );
  const canCreateProduct = hasPermission(
    permissions,
    Subjects.Product,
    Actions.Create,
  );

  const [filters, setFilters] = useState({
    category: null,
    brand: null,
  });

  useEffect(() => {
    document.title = 'Danh sách sản phẩm';
  }, []);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await Products.getAll(_page, _limit);
      setTotal(fetchedProducts.meta.total);
      setProducts(fetchedProducts.result);
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      notification.error({
        message: 'Lỗi tải dữ liệu sản phẩm',
        description: `Lỗi: ${error.message}`,
        duration: 4.5,
      });
      setLoading(false);
    }
  };

  console.log('Loading:', loading);

  // ham(module, action) && button

  const fetchCategories = async () => {
    try {
      const response = await callFetchCategories();
      setCategories(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu danh sách danh mục',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await callFetchBrands();
      setBrands(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu danh sách thuật hành',
        description: `Lỗi: ${error}`,
        duration: 4.5,
      });
      console.error('Error fetching brands:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); // Bắt đầu loading
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải dữ liệu.',
        });
      } finally {
        setLoading(false); // Kết thúc loading sau khi tất cả các Promise hoàn thành
      }
    };
    fetchAll();
  }, [_page, _limit]);

  // useEffect(() => {
  //   const fetchAll = () => {
  //     try {
  //       Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchAll();
  // }, [_page, _limit]);

  const handleDeleteProducts = async () => {
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeleteProduct(id)));
      setProducts((prev) =>
        prev.filter((p) => !selectedRowKeys.includes(p._id)),
      );
      setSelectedRowKeys([]);
      setOpen(false);
      setConfirmLoading(false);
    } catch (error) {
      console.error('Xóa sản phẩm thất bại', error);
    }
  };

  const handleEditProduct = () => {
    const productToEdit = selectedRows[0];
    navigate(`/admin/product/edit/${productToEdit._id}`);
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: null, brand: null });
    setSearchText('');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      !filters.category || product.category?.name === filters.category;
    const matchesBrand =
      !filters.brand || product.brand?.name === filters.brand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive === true).length,
    inactive: products.filter((p) => p.isActive === false).length,
    discounted: products.filter((p) => p.discount > 0).length,
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 280,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space size={12}>
          <Image
            src={record.variants?.[0]?.color?.[0]?.images?.[0]}
            height={60}
            width={60}
            style={{
              objectFit: 'cover',
              borderRadius: 12,
              border: `2px solid #E2E8F0"`,
            }}
            fallback="/fallback.jpg"
            preview={false}
          />
          <div>
            <Text
              strong
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 4,
                color: '#0F172A',
              }}
            >
              {text}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['brand', 'name'],
      key: 'brand',
      width: 140,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 140,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.discount || 0) - (b.discount || 0),
      render: (discount) =>
        discount ? (
          <Text strong>-{discount}%</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12, color: '#94A3B8' }}>
            —
          </Text>
        ),
    },
    {
      title: 'Phiên bản',
      key: 'variants',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12, color: '#94A3B8' }}>
          {record.variants?.length}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => (
        <Badge
          status={isActive ? 'success' : 'default'}
          text={isActive ? 'Hoạt động' : 'Ngừng bán'}
          style={{
            color: isActive === 'active' ? '#8B5CF6' : '#94A3B8',
          }}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRows);
    },
  };
 if (loading) {
   return (
     <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
       <Spin size="large" />
     </div>
   );
 }

  return (
    <div>
      <div
        style={{
          padding: '10px',
          minHeight: '100vh',
          borderRadius: '8px',
        }}
      >
        <Modal
          title="Xác nhận"
          open={open}
          onOk={handleDeleteProducts}
          okText="Xóa"
          confirmLoading={confirmLoading}
          onCancel={() => setOpen(false)}
          okButtonProps={{
            style: {
              backgroundColor: '#EF4444',
              borderColor: '#EF4444',
            },
          }}
        >
          <p>{modalText}</p>
        </Modal>
        <Row gutter={16} style={{ marginBottom: '10px' }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: '#475569' }}>Tổng sản phẩm</span>}
                value={stats.total}
                prefix={<AppstoreOutlined style={{ color: '#4F46E5' }} />}
                valueStyle={{ color: '#4F46E5', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: '#475569' }}>Đang bán</span>}
                value={stats.active}
                prefix={<CheckCircleOutlined style={{ color: '#8B5CF6' }} />}
                valueStyle={{ color: '#8B5CF6', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: '#475569' }}>Ngừng bán</span>}
                value={stats.inactive}
                prefix={<StopOutlined style={{ color: '#94A3B8' }} />}
                valueStyle={{
                  color: '#94A3B8',
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: '#475569' }}>Có giảm giá</span>}
                value={stats.discounted}
                prefix={<TagOutlined style={{ color: '#EF4444' }} />}
                valueStyle={{ color: '#EF4444', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>
        <Card
          style={{
            marginBottom: 10,
            borderRadius: 16,
            border: `1px solid #E2E8F0"`,
          }}
        >
          <Row gutter={[10, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{
                  borderRadius: 8,
                  border: `1px solid "#CBD5E1"`,
                }}
              />
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Danh mục"
                style={{ width: '100%' }}
                allowClear
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                suffixIcon={<FilterOutlined style={{ color: '#94A3B8' }} />}
              >
                {categories?.map((category) => (
                  <Option key={category._id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Thương hiệu"
                style={{ width: '100%' }}
                allowClear
                value={filters.brand}
                onChange={(value) => handleFilterChange('brand', value)}
                suffixIcon={<FilterOutlined style={{ color: '#94A3B8' }} />}
              >
                {brands?.map((brand) => (
                  <Option key={brand._id} value={brand.name}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              {(filters.category || filters.brand || searchText) && (
                <Button
                  onClick={handleClearFilters}
                  icon={<ReloadOutlined />}
                  style={{
                    borderColor: '#94A3B8',
                    color: '#475569',
                    borderRadius: 8,
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Col>

            <Col xs={24} md={8}>
              <Flex gap={8} wrap="nowrap" justify="end">
                <Button
                  disabled={!canCreateProduct}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/product/add')}
                  style={{
                    backgroundColor: 'rgb(11, 162, 36)',
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  Thêm sản phẩm
                </Button>

                <Button
                  type="primary"
                  onClick={handleEditProduct}
                  disabled={!(selectedRowKeys.length === 1 && canUpdateProduct)}
                  icon={<EditOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow:
                      selectedRowKeys.length === 1
                        ? '0 2px 8px rgba(79, 70, 229, 0.2)'
                        : 'none',
                  }}
                >
                  Sửa ({selectedRowKeys.length})
                </Button>

                <Button
                  danger
                  onClick={() => setOpen(true)}
                  disabled={selectedRowKeys.length === 0 || !canDeleteProduct}
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,

                    borderColor:
                      selectedRowKeys.length > 0 ? '#EF4444' : undefined,
                    boxShadow:
                      selectedRowKeys.length > 0
                        ? '0 2px 8px rgba(239, 68, 68, 0.2)'
                        : 'none',
                  }}
                >
                  Xóa ({selectedRowKeys.length})
                </Button>
              </Flex>
            </Col>
          </Row>
        </Card>
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid #E2E8F0"`,
          }}
        >
          {filteredProducts.length === 0 ? (
            <Empty
              description={
                <span style={{ color: '#475569' }}>
                  Không tìm thấy sản phẩm nào
                </span>
              }
              style={{ padding: '48px 0' }}
            />
          ) : (
            <Table
              rowKey="_id"
              Empty
              rowSelection={rowSelection}
              columns={columns}
              bordered
              dataSource={filteredProducts}
              expandable={{
                expandedRowRender: (record) => (
                  <ExpandedRowRender record={record} />
                ),
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    type="text"
                    size="small"
                    icon={expanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={(e) => onExpand(record, e)}
                  />
                ),
                rowExpandable: (record) => record._id,
              }}
              pagination={{
                current: Number(_page),
                pageSize: Number(_limit),
                total: total,
                showSizeChanger: false,
                onChange: (page) => {
                  setSearchParams({
                    _page: page.toString(),
                  });
                },
              }}
              size="middle"
              style={{
                backgroundColor: '#FEFEFE',
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default ListProduct;
