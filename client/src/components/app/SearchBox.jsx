import React, { useState, useRef, useEffect } from "react";
import { Input, List, Flex, Card, Space } from "antd";

const dataSource = [
  "Apple",
  "Banana",
  "Orange",
  "Grapes",
  "Mango",
  "Pineapple",
];

function SearchBox() {
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  const filteredResults = dataSource.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (searchText.trim() !== "") {
      setShowResults(true);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.trim() !== "") {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <Flex
      ref={containerRef}
      gap={10}
      style={{ width: 300, position: "relative" }}
    >
      <Input.Search
        value={searchText}
        onFocus={handleFocus}
        onChange={handleChange}
        placeholder="Search fruits..."
      />

      {showResults && (
        <Space className="absolute! bg-white! shadow-md! p-6! border! border-gray-300! rounded-md top-full! mt-6! left-0! right-0! z-1000! max-h-200! overflow-auto!">
          {filteredResults.length > 0 ? (
            <List
              size="small"
              className="w-full! hover:bg-gray-200! cursor-pointer! rounded-sm!"
              dataSource={filteredResults}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          ) : (
            <div>No results found</div>
          )}
        </Space>
      )}
    </Flex>
  );
}

export default SearchBox;
