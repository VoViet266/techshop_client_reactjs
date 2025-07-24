import axiosInstance from '@services/apis';

class UserService {
  login(user) {



    return axiosInstance.post('/api/v1/auth/login', {
      username: user.email,
      password: user.password,
    });
  }

  get(id) {
    return axiosInstance.get(`/api/v1/users/${id}`);
  }

  static create(user) {
    return axiosInstance.post('/api/v1/users', { ...user });
  }

  static getUserHasPermission() {
    return axiosInstance.get('/api/v1/users/get/all-users-has-permission');
  }

  signup(user) {
    return axiosInstance.post('/api/v1/auth/register', user);
  }

  getAll() {
    return axiosInstance.get('/api/v1/users');
  }

  static deleteOne(id) {
    return axiosInstance.delete(`/api/v1/users/${id}`);
  }

  static update(id, user) {
    return axiosInstance.patch(`/api/v1/users/${id}`, user);
  }

  updateRole(value) {
    return axiosInstance.patch(`/api/v1/users/${value.userId}`, {
      ...value,
    });
  }

  static forgotPassword(email) {
    return axiosInstance.post('/api/v1/auth/forgot-password', {
      email: email,
    });
  }

  static resetPassword(token, password) {
    return axiosInstance.post('/api/v1/auth/reset-password', {
      token: token,
      password: password,
    });
  }

  static loginWithGoogle() {
    return axiosInstance.get('/api/v1/auth/google');
  }
}

export default UserService;
