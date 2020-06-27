import React, { memo, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import FlightIcon from "../images/FlightIcon.png";

const SegmentEdit = memo(({ index, segmentId, segmentValue, weightId, weightValue, airportCodeList, updateCellData }) => {
    const [cellSegmentValue, setCellSegmentValue] = useState(segmentValue);
    const [oldSegValue] = useState(segmentValue);
    const [cellWeightValue, setCellWeightValue] = useState(weightValue);
    const [oldWeightValue] = useState(weightValue);
    const [isEdit, setEdit] = useState(false);

    const openEdit = (e) => {
        setEdit(true);
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

    const saveEdit = () => {
        setEdit(false);
        if (updateCellData) {
            updateCellData(index, segmentId, cellSegmentValue);
            updateCellData(index, weightId, cellWeightValue);
        }
    };

    const clearEdit = () => {
        setCellSegmentValue(oldSegValue);
        setCellWeightValue(oldWeightValue);
        setEdit(false);
    };

    useEffect(() => {
        setCellSegmentValue(cellSegmentValue);
        setCellWeightValue(cellWeightValue);
    }, [cellSegmentValue, cellWeightValue]);

    return (
        <ClickAwayListener onClickAway={clearEdit}>
            <div className="revenue-details content">
                <div className="cell-edit" onClick={openEdit}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div className={`segment-details content ${isEdit ? "close" : "open"}`}>
                    <span>{cellSegmentValue.from}</span>
                    <i>
                        <img src={FlightIcon} alt="segment" />
                    </i>
                    <span>{cellSegmentValue.to}</span>
                </div>
                <div className={`content-edit ${isEdit ? "open" : "close"}`}>
                    <select onChange={onChangeFrom} key={cellSegmentValue.from} value={cellSegmentValue.from}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                    <select onChange={onChangeTo} key={cellSegmentValue.to} value={cellSegmentValue.to}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                    <input type="text" value={cellWeightValue.percentage} onChange={onWeightPercentageChange} />
                    <input type="text" value={cellWeightValue.value} onChange={onWeightValueChange} />
                    <button className="ok" onClick={saveEdit} />
                    <button className="cancel" onClick={clearEdit} />
                </div>
            </div>
        </ClickAwayListener>
    );
});

export default SegmentEdit;
