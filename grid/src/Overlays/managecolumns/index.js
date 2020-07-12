import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import MultiBackend, { TouchTransition } from "react-dnd-multi-backend";
import ColumnsList from "./columnsList";

const ColumnReordering = (props) => {
    const { isManageColumnOpen, toggleManageColumns, columnsToManage } = props;

    const HTML5toTouch = {
        backends: [
            {
                backend: HTML5Backend
            },
            {
                backend: TouchBackend,
                options: { enableMouseEvents: true },
                preview: true,
                transition: TouchTransition
            }
        ]
    };

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
                            {columnsToManage.map((column, index) => {
                                return (
                                    <div className="column__wrap" key={index}>
                                        <div className="column__checkbox">
                                            <input type="checkbox"></input>
                                        </div>
                                        <div className="column__txt">{column.Header}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="column__settings">
                        <div className="column__header">
                            <div className="column__headerTxt">
                                <strong>Column Setting</strong>
                            </div>
                            <div className="column__close" onClick={toggleManageColumns}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className="column__body">
                            <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                                <ColumnsList columnsToManage={columnsToManage} />
                            </DndProvider>
                        </div>
                        <div className="column__footer">
                            <div className="column__btns">
                                <button className="btns">Reset</button>
                                <button className="btns" onClick={toggleManageColumns}>
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
