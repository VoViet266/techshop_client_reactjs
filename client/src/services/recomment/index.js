import axiosInstance from '@services/apis';

class Recomment {
    static getRecommendedProducts = async (id) => {
        const response = await axiosInstance.get(`/api/v1/recomment/${id}`);
        return response.data.data;
    }
    static recordViewHistory = async (data) => {

        const response = await axiosInstance.post(`/api/v1/recomment/record-view-history`, data);
        return response.data.data;
    }

    static getRecommendationsByUser = async (id) => {
        const response = await axiosInstance.get(`/api/v1/recomment/get-by-user/${id}`);
        return response.data.data;
    }
}

export default Recomment