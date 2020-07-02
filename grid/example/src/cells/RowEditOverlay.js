import React, { memo, useState } from "react";

const divStyle = {
    backgroundColor: "#ccc",
    height: "90px",
    width: "1365px",
    marginLeft: "-1370px",
    marginTop: "-5px"
}

const segmetEditStyle = {
    marginLeft: "240px",
    marginTop: "-60px"
}

const weightPercentageStyle = {
    width: "25%",
    marginLeft: "410px",
    marginTop: "-20px",
}

const weightValueStyle = {
    width: "25%",
    marginLeft: "410px",
    marginTop: "6px",
}
const srStyle = {
    marginLeft: "410px",
    marginTop: "4px"
}

const editRemarksStyle = {
    marginTop: "-75px",
    marginLeft: "700px"
}

const buttonDivStyle = {
    width: "15%",
    marginTop: "-80px",
    marginLeft: "1244px"
}
const RowEditOverLay = memo((props) => {
    const { row, airportCodeList, updateCellData } = props;
    const [value, setValue] = useState(row.original.flight);
    const [cellSegmentValue, setCellSegmentValue] = useState(row.original.segment);
    const [cellWeightValue, setCellWeightValue] = useState(row.original.weight);
    const [srValue, setSrValue] = useState(row.original.sr);
    const [remarksValue, setRemarksValue] = useState(row.original.remarks);


    const onChangeSaveRemarks=(e)=>{
    setRemarksValue(e.target.value)
    }
    const onChangeSaveSr = (e) => {
        setSrValue(e.target.value);
    };


    const onWeightPercentageChange = (e) => {
        setCellWeightValue({
            ...cellWeightValue,
            percentage: e.target.value
        });
    };

    const onWeightValueChange = (e) => {
        setCellWeightValue({
            ...cellWeightValue,
            value: e.target.value
        });
    };

    const onChangeFrom = (e) => {
        setCellSegmentValue({
            ...cellSegmentValue,
            from: e.target.value
        });
    };

    const onChangeTo = (e) => {
        setCellSegmentValue({
            ...cellSegmentValue,
            to: e.target.value
        });
    };

    const onChangeSaveFlightNo = (e) => {
        setValue({
            ...value,
            flightno: e.target.value
        });
    }

    const onDateChange = (e) => {
        setValue({
            ...value,
            date: getValueOfDate(e.target.value)
        });
    };

    /**
     * Method to Convert Date to required Format as per value of type
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

    const saveChangesForRowEdit = (row) => {
        updateCellData(row.index, "flight", value);
        updateCellData(row.index, "segment", cellSegmentValue);
        updateCellData(row.index, "weight", cellWeightValue);
        updateCellData(row.index, "sr", srValue);
        updateCellData(row.index, "remarks", remarksValue);
    }
    return (
        <div className="main-div" style={divStyle}>
            {/* <ClickAwayListener onClickAway={closeOverlay}> */}
            <div className={`row-options-edit open`}>
                <br />
                <div className="edit-flight-no">
                    &nbsp;&nbsp;
                <span>Flight No</span> &nbsp;
                    <input type="text" onChange={(e) => onChangeSaveFlightNo(e)}
                        defaultValue={row.original.flight.flightno} />
                </div>
                <br />
                <div className="edit-flight-date">
                    &nbsp;&nbsp;
                    <span>
                        Date
                    </span> &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="date" onChange={(e) => onDateChange(e)} defaultValue={getValueOfDate(row.original.flight.date, "calendar")} />
                </div>
                <div className="edit-flight-segment" style={segmetEditStyle}>
                    <span>
                        From
                    </span>
                    &nbsp;
                    <select defaultValue={row.original.segment.from} onChange={(e) => onChangeFrom(e)}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;&nbsp;
                    <span>
                        To
                    </span>
                    &nbsp;
                    <select defaultValue={row.original.segment.to} onChange={(e) => onChangeTo(e)}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="edit-weight-value">
                    <div className="edit-weight-percentage-value" style={weightPercentageStyle}>
                        <span>Weight Percentage</span>
                    &nbsp;
                <input type="text" defaultValue={row.original.weight.percentage}
                            onChange={(e) => onWeightPercentageChange(e)} />
                    </div>
                    <div className="edit-weight-value-value" style={weightValueStyle}>
                        <span>Weight Value</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="text" onChange={(e) => onWeightValueChange(e)}
                            defaultValue={row.original.weight.value} />
                    </div>
                </div>

                <div className="edit-sr-value" style={srStyle}>
                    <span>
                        SR
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="text" onChange={(e)=>onChangeSaveSr(e)} defaultValue={row.original.sr} />
                </div>
                <div className="edit-remarks-value" style={editRemarksStyle}>
                    <span>
                        Remarks
                </span>
                    <br />
                    <textarea onChange={(e)=>onChangeSaveRemarks(e)} defaultValue={row.original.remarks} rows="3" cols="80"></textarea>
                </div>
            </div>
            {/* </ClickAwayListener> */}
            <div className="cancel-save-buttons" style={buttonDivStyle}>
                <button className="save-Button" onClick={() => saveChangesForRowEdit(row)}>Save</button>
                    &nbsp;&nbsp;&nbsp;
            <button className="cancel-Button" onClick={props.setOverLayClose}>Cancel</button>
            </div>
        </div>
    );
});

export default RowEditOverLay;
