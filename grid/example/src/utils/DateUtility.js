/**
* Utils Method to Convert Date to required Format as per value of type
* @param {String} inputDate 
* @param {String} type 
*/
const getValueOfDate = (dateValue, type) => {
    const date = new Date(dateValue);
    if (type === "calendar") {
        const dateTimeFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
        const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);
        return `${year}-${month}-${day}`;
    } else {
        const dateTimeFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" });
        const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);
        return `${day}-${month}-${year}`;
    }
};

export default getValueOfDate