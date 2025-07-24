import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export const callFreshToken = () => {
  return axiosInstance.get(`/api/v1/auth/refresh`);
};
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    // Kiểm tra nếu lỗi là Unauthorized (401) - access token hết hạn
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const res = await callFreshToken();
          if (res.data && res.data.data && res.data.data.access_token) {
            // Lưu access token mới vào localStorage
            localStorage.setItem("access_token", res.data.data.access_token);
            // Cập nhật lại header Authorization cho request ban đầu
            originalRequest.headers["Authorization"] = `Bearer ${res.data.data.access_token}`;
            // Gọi lại request ban đầu với access token mới
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log(refreshError);

        // Nếu token refresh thất bại, yêu cầu người dùng đăng nhập lại
        if (refreshError.response && refreshError.response.status === 401) {
          // Clear localStorage trước khi redirect để tránh loop
          localStorage.clear();
          callLogout();
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export const callLogin = async (email, password) => {
  const response = await axiosInstance.post(`/api/v1/auth/login`, {
    username: email,
    password: password,
  });
  return response.data;
};

export const callLogout = () => {
  return axiosInstance.get(`/api/v1/auth/logout`);
};

export const callRegister = async (value) => {
  const response = await axiosInstance.post(`/api/v1/auth/register`, {
    ...value,
  });
  return response.data;
};

export const callFetchAccount = () => {
  return axiosInstance.get(`/api/v1/auth/account`);
};





export const callFetchUsers = () => {
  return axiosInstance.get(`/api/v1/users`);
};
export const callCreateUser = (value) => {
  return axiosInstance.post(`/api/v1/users`, {
    ...value,
  });
}
export const callDeleteUser = (id) => {
  return axiosInstance.delete(`/api/v1/users/${id}`);
};
export const callUpdateUser = (value) => {
  console.log('sca', value);
  return axiosInstance.patch(`/api/v1/users/${value._id}`, {
    ...value,
  });
};
export const callUpdateRoleUser = (value) => {
  return axiosInstance.patch(`/api/v1/users/${value.userId}`, {
    role: value.roleId,
    brand: value.brand

  });
}
export const callCreateProduct = (value) => {
  return axiosInstance.post(`/api/v1/products`, {
    ...value,
  });
};

export const callSearchProduct = (query) => {
  return axiosInstance.get(`/api/v1/products/search?q=${query}`);
};

export const callFetchProducts = (page, limit, category, brand) => {
  const params = { page, limit };
  if (category) {
    params.category = category;
  }
  if (brand) {
    params.brand = brand;
  }
  return axiosInstance.get(`/api/v1/products`, { params });
};

export const callFetchProductDetail = (id) => {
  return axiosInstance.get(`/api/v1/products/${id}`);
};

export const callUpdateProduct = (value) => {

  return axiosInstance.patch(`/api/v1/products/${value._id}`, {
    ...value,
  });
};
export const callDeleteProduct = (id) => {
  return axiosInstance.delete(`/api/v1/products/${id}`);
};
export const callFetchBranches = () => {
  return axiosInstance.get(`/api/v1/branchs`);
};

export const callCreateBranch = (value) => {
  return axiosInstance.post(`/api/v1/branchs`, {
    ...value,
  });
};

export const callDeleteBranch = (id) => {
  return axiosInstance.delete(`/api/v1/branchs/${id}`);
};

export const callUpdateBranch = (value) => {
  return axiosInstance.patch(`/api/v1/branchs/${value._id}`, {
    ...value,
  });
};
export const callFetchInventories = () => {
  return axiosInstance.get(`/api/v1/inventories`);
};

export const callImportInventory = (value) => {
  return axiosInstance.post(`/api/v1/inventories/import`, {
    ...value,
  });
};

export const callExportInventory = (value) => {
  return axiosInstance.post(`/api/v1/inventories/export`, {
    ...value,
  });
};

export const callFetchInboundHistory = () => {
  return axiosInstance.get(`/api/v1/inventories/getImport`);
};

export const callFetchDetailInbound = (id) => {
  return axiosInstance.get(`/api/v1/inventories/getImport/${id}`);
};

export const callFetchOutboundHistory = () => {
  return axiosInstance.get(`/api/v1/inventories/getExport`);
};

export const callFetchDetailOutbound = (id) => {

  return axiosInstance.get(`/api/v1/inventories/getExport/${id}`);
};

export const callTransferInventory = (value) => {
  return axiosInstance.post(`/api/v1/inventories/transfer`, {
    ...value,
  });
}
export const callFetchTransferHistory = () => {
  return axiosInstance.get(`/api/v1/inventories/transfer`);
};
export const callFetchDetailTransfer = (id) => {
  return axiosInstance.get(`/api/v1/inventories/get_transfer/${id}`);
}


export const callFetchCategories = () => {
  return axiosInstance.get(`/api/v1/categories`);
};

export const callCreateCategory = (value) => {
  return axiosInstance.post(`/api/v1/categories`, {
    ...value,
  });
};

export const callUpdateCategory = (value) => {
  return axiosInstance.patch(`/api/v1/categories/${value._id}`, {
    ...value,
  });
};

export const callDeleteCategory = (id) => {
  return axiosInstance.delete(`/api/v1/categories/${id}`);
};

export const callCreateBrand = (value) => {
  return axiosInstance.post(`/api/v1/brands`, {
    ...value,
  });
};

export const callUpdateBrand = (value) => {
  return axiosInstance.patch(`/api/v1/brands/${value._id}`, {
    ...value,
  });
};

export const callDeleteBrand = (id) => {
  return axiosInstance.delete(`/api/v1/brands/${id}`);
};

export const callFetchBrands = () => {
  return axiosInstance.get(`/api/v1/brands`);
};

export const callFetchOrders = () => {
  return axiosInstance.get(`/api/v1/orders`);
};
export const callFetchOrderByUserId = (userId) => {
  return axiosInstance.get(`/api/v1/orders/user/${userId}`);
};
export const callCreateOrder = (value) => {
  ;
  return axiosInstance.post(`/api/v1/orders`, {
    ...value,
  });
};

export const callUpdateOrder = (id, value) => {
  return axiosInstance.patch(`/api/v1/orders/${id}`, {
    ...value,
  });
};

export const callDeleteOrder = (id) => {
  return axiosInstance.delete(`/api/v1/orders/${id}`);
};

export const callFetchCart = () => {
  return axiosInstance.get(`/api/v1/carts`);
};

export const callCreateCart = (value) => {
  return axiosInstance.post(`/api/v1/carts`, {
    products: [
      {
        productId: value.productId,
        variant: value.variant,
        quantity: value.quantity,
      },
    ],
  });
};

export const callUpdateCart = (id, products) => {
  return axiosInstance.patch(`/api/v1/carts/${id}`, {
    ...products,
  });
};

export const callDeleteCart = (id) => {
  return axiosInstance.delete(`/api/v1/carts/${id}`);
};

export const callFetchRoles = () => {
  return axiosInstance.get(`/api/v1/roles`);
};
export const callCreateRole = (value) => {
  return axiosInstance.post(`/api/v1/roles`, {
    ...value,
  });
}


export const callUpdateRole = (value) => {

  return axiosInstance.patch(`/api/v1/roles/${value._id}`, {
    ...value,
  });
}
export const callDeleteRole = (id) => {
  return axiosInstance.delete(`/api/v1/roles/${id}`);
}
export const callCreatePermission = (value) => {
  return axiosInstance.post(`/api/v1/permissions`, {
    ...value,
  });
}
export const callUpdatePermission = (value) => {
  return axiosInstance.patch(`/api/v1/permissions/${value._id}`, {
    ...value,
  });
}
export const callDeletePermission = (id) => {
  return axiosInstance.delete(`/api/v1/permissions/${id}`);
}
export const callFetchPermission = () => {
  return axiosInstance.get(`/api/v1/permissions`);
}

export const callFetchBanners = () => {
  return axiosInstance.get(`/api/v1/banners`);
};
export const callCreateBanners = (value) => {
  return axiosInstance.post(`/api/v1/banners`, {
    ...value,
  });
}
export const callUpdateBanners = (value) => {
  return axiosInstance.patch(`/api/v1/banners/${value._id}`, {
    ...value,
  });
}
export const callDeleteBanners = (id) => {
  return axiosInstance.delete(`/api/v1/banners/${id}`);
}

export const callUploadSingleImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post(`/api/v1/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const callDeleteFile = (url) => {
  return axiosInstance.delete(`/api/v1/upload/image`, {
    params: { url }
  });
};


export const callCreateReview = (value) => {

  return axiosInstance.post(`api/v1/review`, {
    ...value
  })
}
export const callFetchReviewByProduct = (id, page, limit) => {

  const params = { page, limit }

  return axiosInstance.get(`api/v1/review/${id}`, { params })
}
export const callFetchStats = (id) => {
  return axiosInstance.get(`api/v1/products/${id}/rating-stats`)
}

export const callReplyReview = (commentId, replyData) => {
  return axiosInstance.post(`/api/v1/review/${commentId}/reply`, replyData);
}

export default axiosInstance; 
