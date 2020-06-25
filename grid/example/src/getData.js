import data from "./data.json";

export const getData = (startIndex, endIndex) => {
    if (data && data.length && typeof startIndex === "number" && typeof endIndex === "number" && endIndex > startIndex) {
        return data.filter((dataItem, index) => {
            return index >= startIndex && index < endIndex;
        });
    }
    return [];
};

export const getFullDataCount = () => {
    return data ? data.length : 0;
};
