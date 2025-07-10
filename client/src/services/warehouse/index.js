import axiosInstance from "../apis";

export default class Warehouse {
    callImportInventory = (value) => {
        return axiosInstance.post(`/api/v1/inventories/import`, {
            ...value,
        });
    };

    callExportInventory = (value) => {
        return axiosInstance.post(`/api/v1/inventories/export`, {
            ...value,
        });
    };


    static transferInventory = (value) => {
        return axiosInstance.get(`/api/v1/inventories/transfer`);
    };

    static createTransfer = (value) => {

        return axiosInstance.post(`/api/v1/inventories/transfer`, {
            ...value,
        })
    }

    static updateTransfer = (_id, value) => {
        
        return axiosInstance.patch(`/api/v1/inventories/transfer/${_id}`, {
            ...value,
        })
    }
}