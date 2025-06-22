import { UsersLayout, AdminLayout } from '@layouts';
import { Cart, ListProducts } from '@pages/users';
import BranchManagement from '@/pages/admin/branch';
import Dashboard from '@/pages/admin/dashboard/Dashboard';
import CategoryPage from '@/pages/admin/category/category';
import { Home, ProductDetail, SearchProductResult } from '@/pages/users';
import { AddProduct, EditProduct, ListProduct } from '@/pages/admin/product';
import { createBrowserRouter } from 'react-router-dom';
import WarehouseManagement from '@/pages/admin/warehouse';
import WarehouseInbound from '@/pages/admin/warehouse/import';
import WarehouseOutbound from '@/pages/admin/warehouse/export';
// import WarehouseTransfer from "@/pages/admin/warehouse/transfer"; // Tạo component riêng cho transfer
import Order from '@/pages/admin/order'; // Tạo component cho order management
import NotExist from '@/components/error/notExist';
import OrderList from '@/pages/admin/order';
import OrderManagement from '@/pages/admin/order';
import ProtectedRoute from './ProtectedRoute';
import BrandManagement from '@/pages/admin/brand';
import CategoryManagement from '@/pages/admin/category/category';

const router = createBrowserRouter([
  // User routes
  {
    path: '/',
    element: <UsersLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'product/:id',
        element: <ProductDetail />,
      },
      {
        path: 'product/all',
        element: <ListProducts />,
      },
      {
        path: 'search/:query',
        element: <SearchProductResult />,
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      {
        path: 'product',
        children: [
          {
            index: true,
            element: <ListProduct />,
          },
          {
            path: 'add',
            element: <AddProduct />,
          },
          {
            path: 'edit/:id',
            element: <EditProduct />,
          },
        ],
      },

      {
        path: 'category',
        children: [
          {
            index: true,
            element: <CategoryManagement />,
          },
          {
            path: 'management',
            element: <CategoryManagement />,
          },
        ],
      },

      {
        path: 'branch',
        children: [
          {
            index: true,
            element: <BranchManagement />,
          },
          {
            path: 'management',
            element: <BranchManagement />,
          },
        ],
      },

      {
        path: 'brand',
        children: [
          {
            index: true,
            element: <BrandManagement />,
          },
          {
            path: 'management',
            element: <BrandManagement />,
          },
        ],
      },
      {
        path: 'warehouse',
        children: [
          {
            index: true,
            element: <WarehouseManagement />,
          },
          {
            path: 'import',
            element: <WarehouseInbound />,
          },
          {
            path: 'export',
            element: <WarehouseOutbound />,
          },
          // {
          //   path: "transfer",
          //   element: <WarehouseTransfer />, // Component riêng cho transfer
          // },
        ],
      },

      // Order management
      {
        path: 'order',
        children: [
          {
            index: true,
            element: <OrderManagement />,
          },
        ],
      },

      // Catch-all route for admin
      {
        path: '*',
        element: <NotExist />,
      },
    ],
  },

  {
    path: '*',
    element: <NotExist />,
  },
]);

export default router;
