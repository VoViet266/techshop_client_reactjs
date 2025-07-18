import axiosInstance from "../apis";

export default class Policy {
    static getAllWarranties() {
        return axiosInstance.get(`/api/v1/benefits/warranties`);
    }

    static getWarranties(id) {
        return axiosInstance.get(`/api/v1/benefits/warranties/${id}`);
    }

    static createWarranties(data) {
        return axiosInstance.post(`/api/v1/benefits/warranties`, data);
    }

    static updateWarranties(id, data) {
        return axiosInstance.put(`/api/v1/benefits/warranties/${id}`, data);
    }

    static deleteWarranties(id) {
        return axiosInstance.delete(`/api/v1/benefits/warranties/${id}`);
    }

    static getAllPromotions() {
        return axiosInstance.get(`/api/v1/benefits/promotions`);
    }

    static getPromotions(id) {
        return axiosInstance.get(`/api/v1/benefits/promotions/${id}`);
    }

    static createPromotions(data) {
        return axiosInstance.post(`/api/v1/benefits/promotions`, data);
    }

    static updatePromotions(id, data) {
        return axiosInstance.put(`/api/v1/benefits/promotions/${id}`, data);
    }

    static deletePromotions(id) {
        return axiosInstance.delete(`/api/v1/benefits/promotions/${id}`);
    }




}