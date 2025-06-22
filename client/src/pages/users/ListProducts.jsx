import React, { useEffect, useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Select,
  Skeleton,
  Image,
  Button,
  Space,
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

function ProductListPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const memoryOptions = ['8GB / 256GB', '16GB / 512GB', '32GB / 1TB'];
  const priceOptions = [
    { label: 'Dưới $1000', value: 'under1000' },
    { label: '$1000 - $2000', value: '1000to2000' },
    { label: 'Trên $2000', value: 'above2000' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = [
        {
          id: '1',
          name: 'Laptop A 8GB/256GB',
          price: 900,
          memory: '8GB / 256GB',
          color: 'Space Gray',
          image:
            'https://res.cloudinary.com/dbglvjsap/image/upload/v1750297727/uploads/jb9xdmharfrag7eg9s5w.webp',
        },
        {
          id: '2',
          name: 'Laptop B 16GB/512GB',
          price: 1500,
          memory: '16GB / 512GB',
          color: 'Moonlight White',
          image:
            'https://res.cloudinary.com/dbglvjsap/image/upload/v1750297727/uploads/jb9xdmharfrag7eg9s5w.webp',
        },
        {
          id: '3',
          name: 'Laptop C 32GB/1TB',
          price: 2500,
          memory: '32GB / 1TB',
          color: 'Midnight Blue',
          image:
            'https://res.cloudinary.com/dbglvjsap/image/upload/v1750297727/uploads/jb9xdmharfrag7eg9s5w.webp',
        },
      ];
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const applyFilters = (priceRange, memory) => {
    const filteredData = products.filter((p) => {
      let priceOk = true;
      if (priceRange === 'under1000') priceOk = p.price < 1000;
      else if (priceRange === '1000to2000') priceOk = p.price >= 1000 && p.price <= 2000;
      else if (priceRange === 'above2000') priceOk = p.price > 2000;

      const memoryOk = !memory || p.memory === memory;
      return priceOk && memoryOk;
    });
    setFiltered(filteredData);
  };

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
    applyFilters(value, selectedMemory);
  };

  const handleMemoryChange = (value) => {
    setSelectedMemory(value);
    applyFilters(selectedPriceRange, value);
  };

  return (
    <div className='w-full px-50 py-20'>
      {/* Tiêu đề + lọc cùng 1 hàng */}
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Danh sách sản phẩm</Title>
        </Col>
        <Col flex="auto">
          <Row gutter={12} justify="end">
            <Col>
              <Select
                placeholder="Chọn khoảng giá"
                onChange={handlePriceChange}
                allowClear
                style={{ minWidth: 150 }}
              >
                {priceOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Chọn bộ nhớ"
                onChange={handleMemoryChange}
                allowClear
                style={{ minWidth: 180 }}
              >
                {memoryOptions.map((mem) => (
                  <Option key={mem} value={mem}>{mem}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card>
                <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.length === 0 ? (
            <Col span={24}>
              <Text type="secondary">Không có sản phẩm nào phù hợp.</Text>
            </Col>
          ) : (
            filtered.map((product) => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                <Card
                  hoverable
                  cover={
                    <Image
                      src={product.image}
                      alt={product.name}
                      height={200}
                      style={{ objectFit: 'cover' }}
                      preview={false}
                    />
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>{product.name}</Title>
                    <Text strong style={{ fontSize: 16 }}>
                      ${product.price.toLocaleString()}
                    </Text>
                    <Text type="secondary">{product.memory}</Text>
                    <Text type="secondary">Màu: {product.color}</Text>
                    <Button type="primary" block>
                      Xem chi tiết
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </div>
  );
}

export default ProductListPage;
