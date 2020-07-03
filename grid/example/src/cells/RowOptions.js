import React, { useState, memo } from "react";
import ClickAwayListener from "react-click-away-listener";
import RowEditOverLay from '../cells/RowEditOverlay'
import RowDelete from "../images/RowDelete.svg";
import RowEdit from "../images/RowEdit.svg";
import RowPin from "../images/RowPin.png";

const RowOptions = memo((props) => {
    const [isOpen, setOpen] = useState(false);
    const [isOverLayOpen, setOverLayOpen] = useState(false);
    const openOverlay = () => {
        setOpen(true);
    };

    const closeOverlay = () => {
        setOpen(false);
    };

    const showEditOverLay = () => {
        setOpen(false);
        setOverLayOpen(true)
    }

    const setOverLayClose = () => {
        setOverLayOpen(false)
    }

    let htmlReturnValue = isOverLayOpen === false ?
        <ClickAwayListener onClickAway={closeOverlay}>
            <div className="row-options-edit-wrap">
                <span className="icon-edit" onClick={openOverlay}>
                    <i></i>
                    <i></i>
                    <i></i>
                </span>
                <div className={`row-options-edit ${isOpen ? "open" : "close"}`}>
                    <ul>
                        <li>
                            <span onClick={showEditOverLay}>
                                <i>
                                    <img src={RowEdit} alt="cargo" />
                                </i>
                                <span>Edit</span>
                            </span>
                        </li>
                        <li>
                            <span>
                                <i>
                                    <img src={RowPin} alt="cargo" width="15" height="15" />
                                </i>
                                <span>Pin This row</span>
                            </span>
                        </li>
                        <li>
                            <span>
                                <i>
                                    <img src={RowDelete} alt="cargo" />
                                </i>
                                <span>Delete</span>
                            </span>
                        </li>
                    </ul>
                    <span className="close" onClick={closeOverlay}>
                        <i className="fa fa-close"></i>
                    </span>
                </div>
            </div>
        </ClickAwayListener> :
        <ClickAwayListener onClickAway={setOverLayClose}>
            <RowEditOverLay setOverLayClose={setOverLayClose}
                isOpenOverLay={true} {...props} />
        </ClickAwayListener>

    return (
        htmlReturnValue
    );
});

export default RowOptions;
