import { Flex, Result, Button, Typography } from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PreviewListProducts } from '@/components/products';

function SearchProductResult() {
  const { query } = useParams();
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSearchResult() {
    try {
      const result = await Products.search(query);
      setResult(result);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchSearchResult();
  }, [query]);

  return (
    <Flex align="center" justify="center" className="w-full!">
      {Array.isArray(result) ? (
        <PreviewListProducts
          products={result}
          loading={loading}
          canViewAll={false}
          showListBrands={false}
          title="Kết quả tìm kiếm"
        />
      ) : (
        <Result
          status="404"
          subTitle={
            <Typography.Text className="font-roboto! text-lg!">
              {result}
            </Typography.Text>
          }
          extra={
            <Link to="/">
              <Button
                type="primary"
                className="font-roboto! h-40! bg-primary! font-medium! rounded-md!"
              >
                Trở về trang chủ
              </Button>
            </Link>
          }
        />
      )}
    </Flex>
  );
}

export default SearchProductResult;
