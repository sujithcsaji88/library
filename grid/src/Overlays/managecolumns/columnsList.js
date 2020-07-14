import React, { useState } from "react";
import { useDrop } from "react-dnd";
import update from "immutability-helper";
import { ItemTypes } from "./ItemTypes";
import ColumnItem from "./columnItem";

const ColumnsList = (props) => {
    const [columns, setColumns] = useState(props.columnsToManage);

    const moveColumn = (columnId, atIndex) => {
        const { column, index } = findColumn(columnId);
        setColumns(
            update(columns, {
                $splice: [
                    [index, 1],
                    [atIndex, 0, column]
                ]
            })
        );
    };

    const findColumn = (columnId) => {
        const column = columns.filter((c) => `${c.columnId}` === columnId)[0];
        return {
            column,
            index: columns.indexOf(column)
        };
    };

    const [, drop] = useDrop({ accept: ItemTypes.COLUMN });

    return (
        <React.Fragment>
            <div ref={drop} style={{ display: "flex", flexWrap: "wrap" }}>
                {columns.map((column, index) => {
                    return (
                        <ColumnItem
                            key={index}
                            id={`${column.columnId}`}
                            name={`${column.Header}`}
                            moveColumn={moveColumn}
                            findColumn={findColumn}
                            innerCells={column.innerCells}
                        />
                    );
                })}
            </div>
        </React.Fragment>
    );
};

export default ColumnsList;
