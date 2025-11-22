import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, Spin, Timeline, Tag, Alert } from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  HomeFilled,
  ShoppingOutlined,
} from '@ant-design/icons';
import axiosInstance from '@/services/apis';

const GEOAPIFY_PUBLIC_KEY = import.meta.env.VITE_REACT_APP_GEOAPIFY_PUBLIC_KEY;

const fetchRoute = async (startCoords, endCoords) => {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  // Kiểm tra xem cả 2 điểm có nằm trong Vietnam không
  const isInVietnam = (lng, lat) => {
    return lng >= 102.1 && lng <= 109.5 && lat >= 8.5 && lat <= 23.5;
  };

  if (!isInVietnam(startLng, startLat) || !isInVietnam(endLng, endLat)) {
    console.warn(
      'Một hoặc cả hai điểm nằm ngoài Vietnam. Chỉ hỗ trợ chỉ đường trong Vietnam.',
    );
    return null;
  }

  const url = `https://api.geoapify.com/v1/routing?waypoints=${startLat},${startLng}|${endLat},${endLng}&mode=truck&apiKey=${GEOAPIFY_PUBLIC_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Lỗi khi gọi API chỉ đường');
    }
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].geometry;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu chỉ đường (routing):', error);
    return null;
  }
};

const OrderTrackingMap = ({ orderId, orderData }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [trackingData, setTrackingData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);

  const fetchTrackingData = async () => {
    if (!orderId && !orderData) {
      setError('Không có dữ liệu đơn hàng.');
      return;
    }
    setIsDataLoading(true);
    setError(null);
    try {
      let data;

      if (orderData) {
        data = orderData;
      } else {
        const response = await axiosInstance.get(
          `/api/v1/orders/tracking/${orderId}`,
        );
        data = response.data.data.data;
      }

      setTrackingData(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tracking:', error);
      setError(error.message || 'Không thể tải dữ liệu theo dõi');
    } finally {
      setIsDataLoading(false);
    }
  };

  /**
   * Khởi tạo bản đồ
   */
  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/positron/style.json?apiKey=${GEOAPIFY_PUBLIC_KEY}`,
      center: [105.7749, 10.0307], // Cần Thơ
      zoom: 13,
      pitch: 45,
      bearing: 0,
      minZoom: 4,
      maxBounds: [
        [102.1, 8.5], // Southwest corner (bao gồm cả Campuchia, Lào)
        [109.5, 23.5], // Northeast corner
      ],
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoading(false);
      fetchTrackingData();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !trackingData || isMapLoading) return;

    const runAsyncLayerAddition = async () => {
      if (map.current.isStyleLoaded()) {
        await addTrackingLayer();
      } else {
        map.current.once('load', () => addTrackingLayer());
      }
    };

    runAsyncLayerAddition();
  }, [trackingData, isMapLoading]);

  const addTrackingLayer = async () => {
    if (!trackingData) return;

    // Xóa markers cũ
    markers.forEach((m) => m.remove());
    setMarkers([]);

    const newMarkers = [];
    const allCoordinates = [];

    // Lấy các điểm chính
    const startPoint = trackingData.trackingHistory?.[0]?.location?.coordinates; // Điểm bắt đầu
    const currentLocation = trackingData.currentLocation?.coordinates; // Vị trí hiện tại
    const destinationPoint = trackingData.recipientLocation?.coordinates; // Điểm đích đến

    // ===== 1. VẼ ĐIỂM BẮT ĐẦU (Kho/Cửa hàng) =====
    if (startPoint) {
      const [lng, lat] = startPoint;
      allCoordinates.push([lng, lat]);

      const elStart = document.createElement('div');
      elStart.className = 'marker-start';
      elStart.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5" width="40" height="40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>')`;
      elStart.style.backgroundSize = '100%';
      elStart.style.width = '40px';
      elStart.style.height = '40px';
      elStart.style.cursor = 'pointer';
      elStart.style.border = '3px solid white';
      elStart.style.borderRadius = '50%';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-size: 12px;">
          <strong>📦 Điểm bắt đầu</strong><br/>
          <small>${trackingData.trackingHistory?.[0]?.address || 'Kho/Cửa hàng'}</small>
        </div>
      `);

      const marker = new maplibregl.Marker(elStart)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      newMarkers.push(marker);
    }

    // ===== 2. VẼ VỊ TRÍ HIỆN TẠI (Shipper - Nếu khác với điểm bắt đầu) =====
    if (
      currentLocation &&
      (!startPoint || currentLocation.toString() !== startPoint.toString())
    ) {
      const [lng, lat] = currentLocation;
      allCoordinates.push([lng, lat]);

      const elCurrent = document.createElement('div');
      elCurrent.className = 'marker-current';
      elCurrent.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35" width="44" height="44"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>')`;
      elCurrent.style.backgroundSize = '100%';
      elCurrent.style.width = '44px';
      elCurrent.style.height = '44px';
      elCurrent.style.cursor = 'pointer';
      elCurrent.style.border = '3px solid white';
      elCurrent.style.borderRadius = '50%';
      elCurrent.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.5)';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-size: 12px;">
          <strong>🚗 Vị trí hiện tại (Shipper)</strong><br/>
          <small>${new Date().toLocaleString('vi-VN')}</small>
        </div>
      `);

      const marker = new maplibregl.Marker(elCurrent)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      newMarkers.push(marker);
    }

    if (destinationPoint) {
      const [lng, lat] = destinationPoint;
      allCoordinates.push([lng, lat]);

      const elDestination = document.createElement('div');
      elDestination.className = 'marker-destination';
      elDestination.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981" width="40" height="40"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></svg>')`;
      elDestination.style.backgroundSize = '100%';
      elDestination.style.width = '40px';
      elDestination.style.height = '40px';
      elDestination.style.cursor = 'pointer';
      elDestination.style.border = '3px solid white';
      elDestination.style.borderRadius = '50%';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-size: 12px;">
          <strong>🏠 Điểm giao hàng</strong><br/>
          <small>${trackingData.recipient?.address || 'Địa chỉ nhận hàng'}</small>
        </div>
      `);

      const destinationMarker = new maplibregl.Marker(elDestination)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      newMarkers.push(destinationMarker);
    }

    setMarkers(newMarkers);

    if (startPoint && destinationPoint) {
      const routeGeometry = await fetchRoute(startPoint, destinationPoint);

      if (routeGeometry) {
        if (map.current.getSource('predicted-route')) {
          map.current.removeLayer('predicted-route');
          map.current.removeSource('predicted-route');
        }
        map.current.addSource('predicted-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: routeGeometry,
          },
        });
        map.current.addLayer({
          id: 'predicted-route',
          type: 'line',
          source: 'predicted-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#007cbf', // Xanh dương cho đường dự kiến
            'line-width': 6,
            'line-opacity': 0.7,
            'line-dasharray': [2, 2], // Nét đứt
          },
        });
      } else {
        console.warn(
          'Không thể vẽ đường chỉ dẫn - một hoặc cả hai điểm nằm ngoài Vietnam',
        );
      }
    }

    if (
      startPoint &&
      currentLocation &&
      currentLocation.toString() !== startPoint.toString()
    ) {
      if (map.current.getSource('history-route')) {
        map.current.removeLayer('history-route');
        map.current.removeSource('history-route');
      }
      map.current.addSource('history-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [startPoint, currentLocation],
          },
        },
      });
      map.current.addLayer({
        id: 'history-route',
        type: 'line',
        source: 'history-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 4,
          'line-opacity': 0.9,
        },
      });
    }

    if (allCoordinates.length > 0) {
      const bounds = allCoordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new maplibregl.LngLatBounds(allCoordinates[0], allCoordinates[0]),
      );
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  };

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <Card title="📍 Theo dõi đơn hàng trên bản đồ" className="mb-4">
      <Spin
        spinning={isMapLoading || isDataLoading}
        tip={isMapLoading ? 'Đang tải bản đồ...' : 'Đang tải dữ liệu...'}
        size="large"
      >
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '500px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f0f2f5',
          }}
        />
      </Spin>

      {/* Timeline */}
      {!isMapLoading && !isDataLoading && trackingData && (
        <div style={{ marginTop: '20px' }}>
          <h4>📋 Lịch sử theo dõi</h4>

          {(() => {
            const timelineItems = [];

            // Item: Điểm bắt đầu
            if (trackingData.trackingHistory?.[0]) {
              timelineItems.push({
                key: 'start',
                dot: (
                  <ShoppingOutlined
                    style={{ fontSize: '18px', color: '#4F46E5' }}
                  />
                ),
                children: (
                  <div>
                    <p>
                      <EnvironmentOutlined /> <strong>Điểm bắt đầu:</strong>{' '}
                      {trackingData.trackingHistory[0].address}
                    </p>
                    <small>
                      {new Date(
                        trackingData.trackingHistory[0].timestamp,
                      ).toLocaleString('vi-VN')}
                    </small>
                    <br />
                    <Tag color="blue">
                      {trackingData.trackingHistory[0].status}
                    </Tag>
                  </div>
                ),
              });
            }

            // Item: Vị trí hiện tại (nếu có)
            if (trackingData.currentLocation) {
              timelineItems.push({
                key: 'current',
                dot: (
                  <EnvironmentOutlined
                    style={{ fontSize: '18px', color: '#FF6B35' }}
                  />
                ),
                color: 'orange',
                children: (
                  <div>
                    <p>
                      <EnvironmentOutlined />{' '}
                      <strong>🚗 Vị trí hiện tại (Shipper)</strong>
                    </p>
                    <small>
                      Tọa độ: [{trackingData.currentLocation.coordinates[0]},{' '}
                      {trackingData.currentLocation.coordinates[1]}]
                    </small>
                    <br />
                    <Tag color="orange">ĐANG GIAO</Tag>
                  </div>
                ),
              });
            }

            // Item: Điểm đích đến
            if (trackingData.recipient?.address) {
              timelineItems.push({
                key: 'destination',
                dot: (
                  <HomeFilled style={{ fontSize: '18px', color: '#10B981' }} />
                ),
                children: (
                  <div>
                    <p>
                      <EnvironmentOutlined /> <strong>Điểm giao hàng:</strong>{' '}
                      {trackingData.recipient.address}
                    </p>
                    <Tag color="green">ĐÍCH ĐẾN</Tag>
                  </div>
                ),
              });
            }

            return <Timeline items={timelineItems} />;
          })()}
        </div>
      )}
    </Card>
  );
};

export default OrderTrackingMap;
