import router from './routes';
import { StrictMode } from 'react';
import { ConfigProvider, message } from 'antd';
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
            // paddingBlock: '8px',
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
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ConfigProvider>
  </StrictMode>,
);
