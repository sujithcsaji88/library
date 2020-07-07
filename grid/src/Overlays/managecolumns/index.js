import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ColumnsList from "./columnsList";

const ColumnReordering = (props) => {
    const { isManageColumnOpen, manageColumns } = props;

    if (isManageColumnOpen) {
        return (
            <div className="columns--grid">
                <div className="column__grid">
                    <div className="column__chooser">
                        <div className="column__header">
                            <div className="">
                                <strong>Column Chooser</strong>
                            </div>
                        </div>
                        <div className="column__body">
                            <div>
                                <input type="text" placeholder="Search column" className="custom__ctrl"></input>
                            </div>
                            <div className="column__selectAll">
                                <a href="" className="column__selectTxt">
                                    Select All
                                </a>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                            <div className="column__wrap">
                                <div className="column__checkbox">
                                    <input type="checkbox"></input>
                                </div>
                                <div className="column__txt">AWB Number</div>
                            </div>
                        </div>
                    </div>
                    <div className="column__settings">
                        <div className="column__header">
                            <div className="column__headerTxt">
                                <strong>Column Setting</strong>
                            </div>
                            <div className="column__close" onClick={manageColumns}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className="column__body">
                            <DndProvider backend={HTML5Backend}>
                                <ColumnsList />
                            </DndProvider>
                        </div>
                        <div className="column__footer">
                            <div className="column__btns">
                                <button className="btns">Reset</button>
                                <button className="btns" onClick={manageColumns}>
                                    Cancel
                                </button>
                                <button className="btns btns__save">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return <div></div>;
    }
};

export default ColumnReordering;
