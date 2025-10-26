import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, Spin, message, Tooltip } from 'antd';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EnvironmentOutlined, AimOutlined } from '@ant-design/icons';

const GEOAPIFY_PUBLIC_KEY = '3dc6904642604807b718858b9138eb38';

async function reverseGeocode(lng, lat) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_PUBLIC_KEY}&lang=vi`,
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi từ Geoapify API');
    }
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted;
    }
    return 'Không tìm thấy địa chỉ tại tọa độ này';
  } catch (error) {
    console.error('Lỗi Reverse Geocoding (Geoapify):', error);
    return `Lỗi khi lấy địa chỉ: ${error.message}`;
  }
}

const MapPickerModal = ({ open, onClose, onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const initialCoords = {
    longitude: 105.7706,
    latitude: 10.0279,
  };
  const initialZoom = 13;

  const [markerPos, setMarkerPos] = useState(initialCoords);

  const handleMapClick = useCallback((event) => {
    if (!map.current) return;
    const { lng, lat } = event.lngLat;
    setMarkerPos({ longitude: lng, latitude: lat });
  }, []);

  useEffect(() => {
    let mapClickCallback = null;

    if (open && !map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${GEOAPIFY_PUBLIC_KEY}`,
        center: [initialCoords.longitude, initialCoords.latitude],
        zoom: initialZoom,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      const markerElement = document.createElement('div');
      markerElement.style.fontSize = '30px';
      markerElement.style.color = 'red';
      markerElement.style.cursor = 'grab';
      markerElement.innerHTML =
        '<span class="anticon anticon-environment"><svg viewBox="64 64 896 896" focusable="false" data-icon="environment" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C318.8 64 152 230.8 152 424c0 94.2 38.3 180.3 102.7 244.7l217 217c3.9 3.9 9 5.9 14.1 5.9s10.2-2 14.1-5.9l217-217A380.1 380.1 0 00872 424C872 230.8 705.2 64 512 64zm0 512c-79.5 0-144-64.5-144-144s64.5-144 144-144 144 64.5 144 144-64.5 144-144 144z"></path></svg></span>';

      markerRef.current = new maplibregl.Marker({
        element: markerElement,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([initialCoords.longitude, initialCoords.latitude])
        .addTo(map.current);

      markerRef.current.on('dragend', () => {
        const { lng, lat } = markerRef.current.getLngLat();
        setMarkerPos({ longitude: lng, latitude: lat });
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        mapClickCallback = (e) => handleMapClick(e);
        map.current.on('click', mapClickCallback);
      });
    } else if (!open && map.current) {
      if (mapClickCallback) {
        map.current.off('click', mapClickCallback);
      }
      map.current.remove();
      map.current = null;
      markerRef.current = null;
      setMapLoaded(false);
      setMarkerPos(initialCoords);
    }

    return () => {
      if (map.current && mapClickCallback) {
        map.current.off('click', mapClickCallback);
      }
    };
  }, [open, handleMapClick]);

  useEffect(() => {
    if (markerRef.current && mapLoaded) {
      markerRef.current.setLngLat([markerPos.longitude, markerPos.latitude]);
    }
  }, [markerPos, mapLoaded]);

  const handleGoToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt của bạn không hỗ trợ lấy vị trí.');
      return;
    }

    setLoadingLocation(true); // Bật loading cho nút vị trí
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPos({ longitude, latitude }); // Cập nhật state marker

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15, // Zoom gần hơn khi đến vị trí hiện tại
            essential: true, // Animation sẽ chạy ngay cả khi người dùng đang tương tác
          });
        }
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Lỗi Geolocation:', error);
        let msg = 'Không thể lấy vị trí của bạn.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Bạn cần cấp quyền truy cập vị trí cho trang web.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Thông tin vị trí không khả dụng.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Yêu cầu lấy vị trí đã hết hạn.';
        }
        message.error(msg);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true, // Cố gắng lấy vị trí chính xác hơn
        timeout: 10000, // Timeout 10 giây
        maximumAge: 0, // Không dùng cache vị trí cũ
      },
    );
  }, []);

  const handleConfirm = async () => {
    setLoadingGeocode(true);
    const currentLngLat = markerRef.current.getLngLat();
    const longitude = currentLngLat.lng;
    const latitude = currentLngLat.lat;

    const address = await reverseGeocode(longitude, latitude);

    if (
      address.startsWith('Lỗi khi lấy địa chỉ') ||
      address === 'Không tìm thấy địa chỉ'
    ) {
      message.error(address);
      setLoadingGeocode(false);
      return;
    }

    onLocationSelect({
      coordinates: { longitude, latitude },
      address: address,
    });
    setLoadingGeocode(false);
    onClose();
  };

  return (
    <Modal
      title="Chọn vị trí giao hàng trên bản đồ"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loadingGeocode}
          onClick={handleConfirm}
          disabled={!mapLoaded}
        >
          Xác nhận vị trí này
        </Button>,
      ]}
      maskClosable={false}
      destroyOnClose
    >
      <div
        ref={mapContainer}
        style={{
          height: '60vh',
          width: '100%',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Tooltip title="Tìm vị trí hiện tại của tôi">
          <Button
            shape="circle"
            icon={<AimOutlined />}
            onClick={handleGoToMyLocation}
            loading={loadingLocation}
            style={{
              position: 'absolute',
              top: '100px',
              right: '10px',
              zIndex: 1,
            }}
            disabled={!mapLoaded}
          />
        </Tooltip>

        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '5px 10px',
            borderRadius: '5px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          Click vào bản đồ hoặc kéo thả ghim đỏ
        </div>
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        Tọa độ đang chọn: {markerPos.latitude.toFixed(4)},{' '}
        {markerPos.longitude.toFixed(4)}
      </div>
    </Modal>
  );
};

export default MapPickerModal;
