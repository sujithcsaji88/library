import axios from "axios";

export const fetchData = async (currentPage, pageSize) => {
    const response = await axios(
        `https://skyforce-api.azurewebsites.net/api/cargoflightdetails?currentPage=${currentPage}&pageSize=${pageSize}`
    );
    if (response && response.data && response.data.data) {
        const { result } = response.data.data;
        if (result) {
            return result;
        }
    }
    return [];
};
