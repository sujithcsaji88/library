import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const ColumnItem = ({ id, name, moveColumn, findColumn, innerCells }) => {
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
                <div className="">{name}</div>
                {innerCells && innerCells.length
                    ? innerCells.map((cell, index) => {
                          return (
                              <div className="column__wrap" key={index}>
                                  <div className="column__checkbox">
                                      <input type="checkbox"></input>
                                  </div>
                                  <div className="column__txt">{cell.Header}</div>
                              </div>
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

export default ColumnItem;
