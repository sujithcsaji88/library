import React, { useState } from "react";
import { useDrop } from "react-dnd";
import update from "immutability-helper";
import { ItemTypes } from "./ItemTypes";
import ColumnItem from "./columnItem";

const ColumnsArray = [
    {
        id: 1
    },
    {
        id: 2
    },
    {
        id: 3
    },
    {
        id: 4
    },
    {
        id: 5
    },
    {
        id: 6
    },
    {
        id: 7
    },
    {
        id: 8
    },
    {
        id: 9
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
                    <ColumnItem key={column.id} id={`${column.id}`} moveColumn={moveColumn} findColumn={findColumn} />
                ))}
            </div>
        </React.Fragment>
    );
};

export default ColumnsList;
