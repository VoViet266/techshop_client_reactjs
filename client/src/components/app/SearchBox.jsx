import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, TrendingUpIcon, ClockIcon, XIcon } from 'lucide-react';
import { List, Typography } from 'antd';
import Products from '@/services/products';
import { useNavigate } from 'react-router-dom';
import Recomment from '@/services/recommend';
import { useAppContext } from '@/contexts';
import { set } from 'react-hook-form';
import { formatCurrency } from '@/helpers';

function SearchBox() {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [recommentProducts, setRecommentProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  async function fetchSearchResult() {
    try {
      setLoading(true);
      const result = await Products.search(query);
      setResult(result);
      setFilteredResults(Array.isArray(result) ? result : []);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (query.trim() !== '') {
      fetchSearchResult();
    } else {
      setFilteredResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowResults(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowResults(true);
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      setShowResults(false);
      setIsFocused(false);
      addToRecentSearches(query);
      navigate(`/search/${query}`);
    }
  };

  const handleItemClick = (item) => {
    setQuery(item.name);
    setShowResults(false);
    setIsFocused(false);
    navigate(`/search/${value}`);
  };

  const handleTrendingClick = (term) => {
    setQuery(term);

    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setQuery('');
    setFilteredResults([]);
    inputRef.current?.focus();
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.trim() !== '') {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  const addToRecentSearches = (term) => {
    const updated = [term, ...recentSearches.filter((t) => t !== term)];
    const limited = updated.slice(0, 5);
    setRecentSearches(limited);
    localStorage.setItem('recentSearches', JSON.stringify(limited));
  };
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setVisibleCount(5);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (user) {
        try {
          const res = await Recomment.getRecommendationsByUser(user._id);
          setRecommentProducts(res);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [user]);
  const SkeletonItem = () => (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  );

  return (
    <div className="w-full relative">
      <div ref={containerRef}>
        <div className={'relative  '} onClick={handleFocus}>
          <div
            className={
              'relative bg-white  rounded-l-full rounded-r-full shadow-lg border-2 border-gray-200 '
            }
          >
            <div className="flex items-center px-4 py-4">
              <SearchIcon
                className={`w-20 h-20 transition-colors duration-300 ml-5 mr-10 ${
                  isFocused ? 'text-primary' : 'text-gray-400'
                }`}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm sản phẩm...."
                className="flex-1 text-lg outline-none placeholder-gray-400 h-[35px] "
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XIcon className="w-20 h-20 text-gray-400" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className=" flex items-center  bg-gradient-to-r bg-[#fee2e2] text-white rounded-full p-8"
              >
                <SearchIcon className="w-20 h-20 text-primary " />
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="absolute top-full mt-6 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100  overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
            {!query.trim() && (
              <div className="p-6">
                {recommentProducts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <TrendingUpIcon className="w-20 h-20 text-orange-500" />
                      Sản phẩm gợi ý cho bạn
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recommentProducts.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            navigate(`/product/${term._id}`);
                            setShowResults(false);
                            setIsFocused(false);
                          }}
                          className=" flex items-center gap-2 bg-gradient-to-r h-[60px] min-w-[1/5] max-w-[2/5] px-10 py-7 rounded-full text-sm hover:from-orange-100 hover:to-red-100 transition-all duration-300 transform hover:scale-105"
                        >
                          <img
                            src={term?.variants[0]?.images}
                            alt={term.name}
                            className="w-70 h-50 object-contain"
                          />
                          <div className="text-gray-700">{term.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="space-y-2">
                      {recentSearches.slice(0, 5).map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleTrendingClick(term)}
                          className="flex items-center h-[40px] gap-3 w-full text-left p-2 rounded-lg"
                        >
                          <ClockIcon className="w-20 h-20 text-gray-400" />
                          <span className="text-gray-700 ml-6">{term}</span>
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleClearRecentSearches}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Xóa lịch sử tìm kiếm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading && query.trim() && (
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-4 px-2">
                  Đang tìm kiếm...
                </div>
                {[...Array(3)].map((_, i) => (
                  <SkeletonItem key={i} />
                ))}
              </div>
            )}

            {filteredResults.length > 0 && !loading && (
              <div className="p-4 max-h-300 overflow-y-auto">
                <div className="text-sm text-gray-500 mb-4 px-2">
                  Tìm thấy {filteredResults.length} sản phẩm
                </div>

                {filteredResults.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-4 p-6 mb-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-50 h-50  flex items-center justify-center">
                      <img
                        src={item.variants[0].images[0]}
                        alt={item.name}
                        className="w-50 h-50 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </div>
                    </div>
                    <div className="text-blue-600 font-semibold">
                      {item.variants[0].price.toLocaleString()}₫
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredResults.length === 0 && !loading && query.trim() && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 text-sm">
                  Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBox;
