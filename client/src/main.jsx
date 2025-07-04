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
          colorPrimary: '#dc2626',
        },
        components: {
          Input: {
            activeBorderColor: '#dc2626',
            hoverBorderColor: '#dc2626',
            activeShadow: '0',
          },
          Select: {
            // controlHeight: 40,
          },
          Card: {
            padding: 0,
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
