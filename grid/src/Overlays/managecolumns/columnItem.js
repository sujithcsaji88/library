import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const ColumnItem = ({ id, text, moveColumn, findColumn }) => {
    const originalIndex = findColumn(id).index;

    const [{ isDragging }, drag] = useDrag({
        item: { type: ItemTypes.COLUMN, id, originalIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        }),
        end: (dropResult, monitor) => {
            const { id: droppedId, originalIndex } = monitor.getItem();
            const didDrop = monitor.didDrop();
            if (!didDrop) {
                moveColumn(droppedId, originalIndex);
            }
        }
    });

    const [, drop] = useDrop({
        accept: ItemTypes.COLUMN,
        canDrop: () => false,
        hover({ id: draggedId }) {
            if (draggedId !== id) {
                const { index: overIndex } = findColumn(id);
                moveColumn(draggedId, overIndex);
            }
        }
    });

    const opacity = isDragging ? 0.1 : 1;

    return (
        <div style={{ opacity }}>
            <div className="column__reorder">
                <div ref={(node) => drag(drop(node))} style={{ cursor: "move" }} className="">
                    <i className="fa fa-align-justify" aria-hidden="true"></i>
                </div>
                <div className="">AWB Number {id}</div>
                <div className="column__wrap">
                    <div className="column__checkbox">
                        <input type="checkbox"></input>
                    </div>
                    <div className="column__txt">Pin Left</div>
                </div>
            </div>
        </div>
    );
};

export default ColumnItem;
