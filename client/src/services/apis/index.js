import axios from 'axios';
const ACCESS_TOKEN_KEY = "access_token";
// Tạo axios instance để dùng chung cho toàn bộ app
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL, // URL gốc của server
  withCredentials: true, // Cho phép gửi cookie trong request
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;        // Tránh gọi refresh token nhiều lần cùng lúc
let failedQueue = [];            // Hàng đợi chứa các request bị treo khi token hết hạn

// Hàm xử lý hàng đợi request khi refresh token xong
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);        // Nếu refresh thất bại → trả lỗi cho request trong queue
    } else {
      prom.resolve(token);       // Nếu refresh thành công → cung cấp token mới
    }
  });
  failedQueue = [];              // Xóa queue sau khi xử lý
};
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const callFreshToken = () => {
  return axiosInstance.get(`/api/v1/auth/refresh`, { _skipAuthRefresh: true });
};

//Thêm interceptor cho RESPONSE (xử lý lỗi sau khi nhận response)
axiosInstance.interceptors.response.use(
  (response) => response, // Nếu response OK → trả về luôn
  async (error) => {
    const originalRequest = error.config; // Lưu lại request gốc bị lỗi

    //Nếu server trả về 401 (Unauthorized) & request này không phải refresh token
    if (error.response && error.response.status === 401 && !originalRequest._skipAuthRefresh) {

      // Nếu đang refresh token -> đưa request này vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject }); // Lưu request bị lỗi để xử lý sau
        }).then(token => {
          // Khi refresh xong, gắn token mới vào request và gọi lại
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      // Nếu chưa refresh token → tiến hành refresh
      isRefreshing = true;

      try {
        const res = await callFreshToken();
        const newAccessToken = res.data?.data?.access_token;

        if (newAccessToken) {

          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          // Cập nhật Authorization cho axios instance
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          // Xử lý tất cả request đang chờ trong hàng đợi
          processQueue(null, newAccessToken);

          // Gắn token mới vào request cũ và gửi lại
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token thất bại -> Xóa token và đưa user về chủ
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.location.href = "/";
        processQueue(refreshError, null); // Thông báo lỗi cho tất cả request đang chờ
        return Promise.reject(refreshError);
      } finally {
        // ✅ Dù thành công hay thất bại → đánh dấu đã refresh xong
        isRefreshing = false;
      }
    }

    // Nếu lỗi khác 401 → trả lỗi về cho client xử lý
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
  console.log('sca', value);
  return axiosInstance.patch(`/api/v1/users/${value.userId}`, {
    role: value.roleId,
    branch: value.branchId

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
  console.log(value);
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
