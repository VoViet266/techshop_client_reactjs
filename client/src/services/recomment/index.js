const { default: axiosInstance } = require("../apis");

class Recomment {
    static getAll = async () => {
        const response = await axiosInstance.get(`/api/v1/recomment`);
        return response.data.data;
    }
}

export default Recomment