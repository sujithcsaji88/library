import React, { memo, useMemo } from "react";
import Customgrid from "./Customgrid";

const Grid = memo((props) => {
    const {
        title,
        gridHeight,
        gridWidth,
        columns,
        data,
        globalSearchLogic,
        updateCellData,
        selectBulkData,
        calculateRowHeight,
        renderExpandedContent,
        hasNextPage,
        isNextPageLoading,
        loadNextPage
    } = props;

    let processedColumns = [];
    columns.forEach((column, index) => {
        column.columnId = `column_${index}`;
        processedColumns.push(column);
    });
    const gridColumns = useMemo(() => processedColumns, []);

    return (
        <Customgrid
            title={title}
            gridHeight={gridHeight}
            gridWidth={gridWidth}
            columns={gridColumns}
            data={data}
            globalSearchLogic={globalSearchLogic}
            updateCellData={updateCellData}
            selectBulkData={selectBulkData}
            calculateRowHeight={calculateRowHeight}
            renderExpandedContent={renderExpandedContent}
            hasNextPage={hasNextPage}
            isNextPageLoading={isNextPageLoading}
            loadNextPage={loadNextPage}
        />
    );
});

export default Grid;
