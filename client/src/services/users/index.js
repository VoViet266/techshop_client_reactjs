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

  update(user) {
    return axiosInstance.patch(`/api/v1/users/${user._id}`, { ...user });
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

export default UserService;
