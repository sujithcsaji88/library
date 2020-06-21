import React, { useState, useEffect, memo } from "react";
import ClickAwayListener from "react-click-away-listener";

const SREdit = memo(({ value: initialValue, row: { index }, column: { id }, updateCellData }) => {
    const [value, setValue] = useState(initialValue);
    const [oldValue] = useState(initialValue);
    const [isEdit, setEdit] = useState(false);

    const openEdit = (e) => {
        setEdit(true);
    };

    const onChange = (e) => {
        setValue(e.target.value);
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
            <div className="sr-details content">
                <div className="cell-edit" onClick={openEdit}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div className={`content-display ${isEdit ? "close" : "open"}`}>{value}</div>
                <div className={`content-edit ${isEdit ? "open" : "close"}`}>
                    <input type="text" value={value} onChange={onChange} />
                    <button className="ok" onClick={saveEdit} />
                    <button className="cancel" onClick={clearEdit} />
                </div>
            </div>
        </ClickAwayListener>
    );
});

export default SREdit;
