import React, { useState } from "react";
import { useDrop } from "react-dnd";
import update from "immutability-helper";
import { ItemTypes } from "./ItemTypes";
import ColumnItem from "./columnItem";

const ColumnsArray = [
    {
        id: 1,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 1</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 2</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 3</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 4,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 4</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 5,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 5</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 6,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 6</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 7,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 7</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 8,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 8</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    },
    {
        id: 9,
        text: (
            <div className="column__reorder">
                <div className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number 9</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        )
    }
];

const ColumnsList = () => {
    const [columns, setColumns] = useState(ColumnsArray);

    const moveColumn = (id, atIndex) => {
        const { column, index } = findColumn(id);
        setColumns(
            update(columns, {
                $splice: [
                    [index, 1],
                    [atIndex, 0, column]
                ]
            })
        );
    };

    const findColumn = (id) => {
        const column = columns.filter((c) => `${c.id}` === id)[0];
        return {
            column,
            index: columns.indexOf(column)
        };
    };

    const [, drop] = useDrop({ accept: ItemTypes.COLUMN });

    return (
        <React.Fragment>
            <div ref={drop} style={{ display: "flex", flexWrap: "wrap" }}>
                {columns.map((column) => (
                    <ColumnItem
                        key={column.id}
                        id={`${column.id}`}
                        text={column.text}
                        moveColumn={moveColumn}
                        findColumn={findColumn}
                    />
                ))}
            </div>
        </React.Fragment>
    );
};

export default ColumnsList;
