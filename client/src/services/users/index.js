import axiosInstance from '@services/apis';

class Users {
  login(user) {
    return axiosInstance.post('/api/v1/auth/login', {
      username: user.email,
      password: user.password,
    });
  }
}

export default Users;
