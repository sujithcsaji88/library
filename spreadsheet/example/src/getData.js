import axios from "axios";

export const fetchData = async (index) => {
    const response = await axios(
        `https://skyforce-api.azurewebsites.net/api/cargoFlightDetilsForExcel`
    );
    if (response && response.data && response.data.data) {
        const { result } = response.data.data;
        if (result) {
            return result;
        }
    }
    return [];
};