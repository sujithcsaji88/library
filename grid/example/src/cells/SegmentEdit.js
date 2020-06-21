import React, { memo, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import FlightIcon from "../images/FlightIcon.png";

const SegmentEdit = memo(({ value: initialValue, index, id, airportCodeList, updateCellData }) => {
    const [value, setValue] = useState(initialValue);
    const [oldValue] = useState(initialValue);
    const [isEdit, setEdit] = useState(false);

    const openEdit = (e) => {
        setEdit(true);
    };

    const onChangeFrom = (e) => {
        setValue({
            ...value,
            from: e.target.value
        });
    };

    const onChangeTo = (e) => {
        setValue({
            ...value,
            to: e.target.value
        });
    };

    const saveEdit = () => {
        setEdit(false);
        if (updateCellData) {
            updateCellData(index, id, value);
        }
    };

    const clearEdit = () => {
        setValue(oldValue);
        setEdit(false);
    };

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <ClickAwayListener onClickAway={clearEdit}>
            <div className="revenue-details content">
                <div className="cell-edit" onClick={openEdit}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div className={`segment-details content ${isEdit ? "close" : "open"}`}>
                    <span>{value.from}</span>
                    <i>
                        <img src={FlightIcon} alt="segment" />
                    </i>
                    <span>{value.to}</span>
                </div>
                <div className={`content-edit ${isEdit ? "open" : "close"}`}>
                    <select onChange={onChangeFrom} key={value.from} value={value.from}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                    <select onChange={onChangeTo} key={value.to} value={value.to}>
                        {airportCodeList.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                    <button className="ok" onClick={saveEdit} />
                    <button className="cancel" onClick={clearEdit} />
                </div>
            </div>
        </ClickAwayListener>
    );
});

export default SegmentEdit;
