import router from './routes';
import { StrictMode } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // cần cho Ant Design v5
import { AppProvider } from '@contexts';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Roboto, sans-serif',
          colorPrimary: '#e53935',
        },
        components: {
          Input: {
            activeBorderColor: '#ee4d2d',
            hoverBorderColor: '#ee4d2d',
            activeShadow: '0',
          },
        },
        message: {
          top: 80,
          duration: 2,
          maxCount: 3,
        },
      }}
    >
      <AntdApp>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
