import { UsersLayout, AdminLayout } from '@layouts';
import { Cart, ListProducts, Order } from '@pages/users';
import BranchManagement from '@/pages/admin/branch';
import Dashboard from '@/pages/admin/dashboard/Dashboard';
import { Home, ProductDetail, SearchProductResult } from '@/pages/users';
import { AddProduct, EditProduct, ListProduct } from '@/pages/admin/product';
import { createBrowserRouter } from 'react-router-dom';
import WarehouseManagement from '@/pages/admin/warehouse';
import WarehouseInbound from '@/pages/admin/warehouse/import';
import WarehouseOutbound from '@/pages/admin/warehouse/export';

import NotExist from '@/components/error/notExist';

import ProtectedRoute from './ProtectedRoute';
import OrderManagement from '@/pages/admin/order';
import BrandManagement from '@/pages/admin/brand';
import CategoryManagement from '@/pages/admin/category/category';

import UserManagement from '@/pages/admin/user';
import RoleManagement from '@/pages/admin/role/role';
import UserRoleManagement from '@/pages/admin/role/userRole';
import WarehouseTransfer from '@/pages/admin/warehouse/transfer';
import BannerManagement from '@/pages/admin/banner';
import PermissionsManagement from '@/pages/admin/permission/permission';
import WarehouseTransferManagement from '@/pages/admin/warehouse/transfer';
import ForgotPasswordPage from '@/pages/app/forgotPassword';

const router = createBrowserRouter([
  {
    path: '/',
    element: <UsersLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'order',
        element: <Order />,
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
        path: 'product/all/:id',
        element: <ListProducts />,
      },
      {
        path: 'search/:query',
        element: <SearchProductResult />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
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
          {
            path: 'transfer',
            element: <WarehouseTransferManagement />,
          },
        ],
      },
      {
        path: 'user',
        children: [
          {
            index: true,
            element: <UserManagement />,
          },
          {
            path: 'management',
            element: <UserManagement />,
          },
        ],
      },

      {
        path: 'order',
        children: [
          {
            index: true,
            element: <OrderManagement />,
          },
        ],
      },
      {
        path: 'banner',
        children: [
          {
            index: true,
            element: <BannerManagement />,
          },
          {
            path: 'management',
            element: <BannerManagement />,
          },
        ],
      },
      {
        path: 'authorization',
        children: [
          {
            path: 'permission/management',
            element: <PermissionsManagement />,
          },
          {
            path: 'role/management',
            element: <RoleManagement />,
          },
          {
            path: 'roleuser/management',
            element: <UserRoleManagement />,
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
