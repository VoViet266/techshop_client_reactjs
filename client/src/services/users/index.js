import axiosInstance from '@services/apis';

class Users {
  login(user) {
    return axiosInstance.post('/api/v1/auth/login', {
      username: user.email,
      password: user.password,
    });
  }

  get() {
    return axiosInstance.get('/api/v1/auth/account');
  }

  signup(user) {
    return axiosInstance.post('/api/v1/auth/register', user);
  }

  getAll() {
    return axiosInstance.get('/api/v1/users');
  }

  deleteOne(id) {
    return axiosInstance.delete(`/api/v1/users/${id}`);
  }

  update(user) {
    return axiosInstance.patch(`/api/v1/users/${user._id}`, user);
  }

  updateRole(value) {
    return axiosInstance.patch(`/api/v1/users/${value.userId}`, {
      ...value,
    });
  }
}

export default Users;
