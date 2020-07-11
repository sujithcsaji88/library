import React, { memo, useState, useMemo, useEffect } from "react";
import Customgrid from "./Customgrid";

const Grid = memo((props) => {
    const {
        title,
        gridHeight,
        gridWidth,
        columns,
        globalSearchLogic,
        updateCellData,
        selectBulkData,
        calculateRowHeight,
        renderExpandedContent,
        fetchData
    } = props;

    //Set state value for variable to check if there is anext page available
    const [hasNextPage, setHasNextPage] = useState(true);
    //Set state value for variable to check if the loading process is going on
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    //Set state value for variable to hold grid data
    const [items, setItems] = useState([]);
    //Crete a memoized variable for columns
    const gridColumns = useMemo(() => columns, []);

    //Gets called when page scroll reaches the bottom of the grid.
    //Fetch the next set of data and append it to the variable holding grid data and update the state value.
    //Also update the hasNextPage state value to False once API response is empty, to avoid unwanted API calls.
    const loadNextPage = (...args) => {
        const newIndex = args && args.length > 0 ? args[0] : -1;
        if (newIndex >= 0 && hasNextPage) {
            setIsNextPageLoading(true);
            fetchData(newIndex).then((data) => {
                setHasNextPage(data && data.length > 0);
                setIsNextPageLoading(false);
                setItems(items.concat(data));
            });
        }
    };

    useEffect(() => {
        //Make API call to fetch initial set of data.
        fetchData(0).then((data) => {
            setItems(data);
        });
    }, []);

    if (items && items.length > 0) {
        return (
            <div>
                <Customgrid
                    title={title}
                    gridHeight={gridHeight}
                    gridWidth={gridWidth}
                    columns={gridColumns}
                    data={items}
                    globalSearchLogic={globalSearchLogic}
                    updateCellData={updateCellData}
                    selectBulkData={selectBulkData}
                    calculateRowHeight={calculateRowHeight}
                    renderExpandedContent={renderExpandedContent}
                    hasNextPage={hasNextPage}
                    isNextPageLoading={isNextPageLoading}
                    loadNextPage={loadNextPage}
                />
                {isNextPageLoading ? <h2 style={{ textAlign: "center" }}>Loading...</h2> : null}
            </div>
        );
    } else {
        return <h2 style={{ textAlign: "center", marginTop: "70px" }}>Initializing Grid...</h2>;
    }
});

export default Grid;
