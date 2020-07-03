import React, { memo, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import getDateValue from '../utils/DateUtility';

const FlightEdit = memo(({ value: initialValue, row: { index }, column: { id }, updateCellData }) => {
    const [value, setValue] = useState(initialValue);
    const [oldValue] = useState(initialValue);
    const [isEdit, setEdit] = useState(false);

    const onFlightChange = (e) => {
        setValue({
            ...value,
            flightno: e.target.value
        });
    };

    const onDateChange = (e) => {
        setValue({
            ...value,
            date: getDateValue(e.target.value)
        });
    };

    const openEdit = (e) => {
        setEdit(true);
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
            <div className="flight-details content">
                <div className="cell-edit" onClick={openEdit}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div>
                    <strong>{value.flightno}</strong>
                    <span>{value.date}</span>
                </div>
                <div className={`content-edit ${isEdit ? "open" : "close"}`}>
                    <input type="text" value={value.flightno} onChange={onFlightChange} />
                    <input type="date" value={getDateValue(value.date, "calendar")} onChange={onDateChange} />
                    <button className="ok" onClick={saveEdit} />
                    <button className="cancel" onClick={clearEdit} />
                </div>
            </div>
        </ClickAwayListener>
    );
});

export default FlightEdit;
