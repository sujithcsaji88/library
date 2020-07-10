import React, { memo } from "react";
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

    return (
        <Customgrid
            title={title}
            gridHeight={gridHeight}
            gridWidth={gridWidth}
            columns={columns}
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
