import Products from '@services/products';
import { useAppContext } from '@contexts';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { Input, List, Flex, Typography, Skeleton, Empty } from 'antd';

function SearchBox() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [result, setResult] = useState([]);
  const { query, setQuery } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  async function fetchSearchResult() {
    try {
      setLoading(true);
      const result = await Products.search(query);
      setResult(result);
      setFilteredResults(Array.isArray(result) ? result : []);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    if (query.trim() !== '') {
      fetchSearchResult();
      console.log('Result:', filteredResults);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (query.trim() !== '') {
      setShowResults(true);
    }
  };

  function onSearch() {
    if (query.trim() !== '') {
      setShowResults(false);
      navigate(`/search/${query}`);
    }
  }

  function handleItemClick(event) {
    const value = event.target.textContent;
    setQuery(value);
    setShowResults(false);
    navigate(`/search/${value}`);
  }

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.trim() !== '') {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <Flex
      ref={containerRef}
      gap={10}
      style={{ width: 300, position: 'relative' }}
    >
      <Input.Search
        value={query}
        onSearch={onSearch}
        onFocus={handleFocus}
        onChange={handleChange}
        className="font-roboto!"
        placeholder="Tìm kiếm sản phẩm..."
      />

      {showResults && (
        <Flex
          justify="center"
          className="absolute! bg-white! rounded-md! max-h-200! animate-[fadeInUp_0.1s_ease-out]! p-6! border! border-gray-300! top-full! mt-6! left-0! right-0! z-1000! overflow-auto!"
        >
          {loading && <Skeleton.Input className="h-100! w-full!" />}

          {filteredResults.length > 0 && !loading && (
            <List
              size="small"
              className="w-full! font-roboto! cursor-pointer! rounded-sm!"
              dataSource={filteredResults}
              renderItem={(item) => (
                <>
                  <List.Item
                    onClick={handleItemClick}
                    className="w-full! border-none! rounded-sm! hover:bg-gray-100!"
                  >
                    {item.name}
                  </List.Item>
                </>
              )}
            />
          )}

          {filteredResults.length === 0 && !loading && (
            <Flex align="center" justify="center" className="min-h-100! p-20!">
              <Empty
                description={
                  <Typography.Text className="font-roboto! text-gray-400!">
                    Không tìm thấy sản phẩm
                  </Typography.Text>
                }
              />
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}

export default SearchBox;
