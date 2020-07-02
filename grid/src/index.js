import React, { useCallback, useState, memo, useEffect, createRef, useMemo } from "react";
import {
    useTable,
    useResizeColumns,
    useFlexLayout,
    useRowSelect,
    useSortBy,
    useFilters,
    useGlobalFilter,
    useExpanded
} from "react-table";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import RowSelector from "./Functions/RowSelector";
import DefaultColumnFilter from "./Functions/DefaultColumnFilter";
import GlobalFilter from "./Functions/GlobalFilter";

const listRef = createRef(null);

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

    //Display error message if data or columns configuration is missing.
    if (!(data && data.length > 0) || !(columns && columns.length > 0)) {
        return <h2 style={{ marginTop: "50px", textAlign: "center" }}>Invalid Data or Columns Configuration</h2>;
    }

    //Variables used for handling infinite loading
    const itemCount = hasNextPage ? data.length + 1 : data.length;
    const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage ? loadNextPage : () => {};
    const isItemLoaded = (index) => !hasNextPage || index < data.length;

    //Local state value for checking if column filter is open/closed
    const [isFilterOpen, setFilterOpen] = useState(false);

    //Toggle column filter state value based on UI clicks
    const toggleColumnFilter = () => {
        setFilterOpen(!isFilterOpen);
    };

    //Column filter added for all columns by default
    const defaultColumn = useMemo(
        () => ({
            Filter: DefaultColumnFilter
        }),
        []
    );

    //Initialize react-table instance with the values received through properties
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
        state,
        setGlobalFilter
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            updateCellData,
            globalFilter: (rows, columns, filterValue) => {
                //Call global search function defined in application, if it is present
                if (globalSearchLogic && typeof globalSearchLogic === "function") {
                    return globalSearchLogic(rows, columns, filterValue);
                } else {
                    return rows;
                }
            },
            autoResetSelectedRows: false,
            autoResetSortBy: false,
            autoResetFilters: false
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        useRowSelect,
        useFlexLayout,
        useResizeColumns,
        useExpanded,
        (hooks) => {
            //Add checkbox for all rows in grid, with different properties for header row and body rows
            hooks.allColumns.push((columns) => [
                {
                    id: "selection",
                    disableResizing: true,
                    disableFilters: true,
                    disableSortBy: true,
                    minWidth: 35,
                    width: 35,
                    maxWidth: 35,
                    Header: ({ getToggleAllRowsSelectedProps }) => <RowSelector {...getToggleAllRowsSelectedProps()} />,
                    Cell: ({ row }) => <RowSelector {...row.getToggleRowSelectedProps()} />
                },
                ...columns
            ]);
        }
    );

    //Render each row and cells in each row, using attributes from react window list.
    const RenderRow = useCallback(
        ({ index, style }) => {
            if (isItemLoaded(index)) {
                const row = rows[index];
                prepareRow(row);
                return (
                    <div {...row.getRowProps({ style })} className="table-row tr">
                        <div className="table-row-wrap">
                            {row.cells.map((cell) => {
                                return (
                                    <div {...cell.getCellProps()} className="table-cell td">
                                        {cell.render("Cell")}
                                    </div>
                                );
                            })}
                        </div>
                        {/*Check if row eapand icon is clicked, and if yes, call function to bind content to the expanded region*/}
                        {row.isExpanded ? (
                            <div className="expand">{renderExpandedContent ? renderExpandedContent(row) : null}</div>
                        ) : null}
                    </div>
                );
            }
        },
        [prepareRow, rows, renderExpandedContent]
    );

    //Export selected row data and pass it to the callback method
    const bulkSelector = () => {
        if (selectBulkData) {
            selectBulkData(selectedFlatRows);
        }
    };

    //This code is to handle the row height calculation while expanding a row or resizing a column
    useEffect(() => {
        if (listRef && listRef.current) {
            listRef.current.resetAfterIndex(0, true);
        }
    });

    //Render table title, global search component, button to show/hide column filter, button to export selected row data & the grid
    //Use properties and methods provided by react-table
    //Autosizer used for calculating grid height (don't consider window width and column resizing value changes)
    //Infinite loader used for lazy loading, with the properties passed here and other values calculated at the top
    //React window list is used for implementing virtualization, specifying the item count in a frame and height of each rows in it.
    return (
        <div className="wrapper" style={{ width: gridWidth ? gridWidth : "100%" }}>
            <div className="table-filter">
                <div className="results">
                    <div className="name">
                        <strong>{rows.length}</strong>
                        <span> {title ? title : "Rows"}</span>
                    </div>
                </div>
                <div className="filter-utilities">
                    <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
                    <div className="filter-icon keyword-search" onClick={toggleColumnFilter}>
                        <i className="fa fa-filter" aria-hidden="true"></i>
                    </div>
                    <div className="filter-icon bulk-select" onClick={bulkSelector}>
                        <i className="fa fa-pencil-square-o"></i>
                    </div>
                </div>
            </div>
            <div
                className="tableContainer table-outer"
                style={{ height: gridHeight ? gridHeight : "50vh", overflowX: "auto", overflowY: "hidden" }}
            >
                <AutoSizer disableWidth disableResizing>
                    {({ height }) => (
                        <div {...getTableProps()} className="table">
                            <div className="thead table-row table-row--head">
                                {headerGroups.map((headerGroup) => (
                                    <div {...headerGroup.getHeaderGroupProps()} className="tr">
                                        {headerGroup.headers.map((column) => (
                                            <div {...column.getHeaderProps()} className="table-cell column-heading th">
                                                <div {...column.getSortByToggleProps()}>
                                                    {column.render("Header")}
                                                    <span>
                                                        {column.isSorted ? (
                                                            column.isSortedDesc ? (
                                                                <i className="fa fa-sort-desc" aria-hidden="true"></i>
                                                            ) : (
                                                                <i className="fa fa-sort-asc" aria-hidden="true"></i>
                                                            )
                                                        ) : (
                                                            ""
                                                        )}
                                                    </span>
                                                </div>
                                                <div className={`txt-wrap column-filter ${isFilterOpen ? "open" : ""}`}>
                                                    {!column.disableFilters ? column.render("Filter") : null}
                                                </div>
                                                {column.canResize && <div {...column.getResizerProps()} className="resizer" />}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div {...getTableBodyProps()} className="tbody">
                                <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                                    {({ onItemsRendered, ref }) => (
                                        <List
                                            ref={(list) => {
                                                ref(list);
                                                listRef.current = list;
                                            }}
                                            style={{ overflowX: "hidden" }}
                                            height={height - 50}
                                            itemCount={rows.length}
                                            itemSize={(index) => {
                                                if (calculateRowHeight && typeof calculateRowHeight === "function") {
                                                    return calculateRowHeight(rows, index, headerGroups);
                                                } else {
                                                    return 70;
                                                }
                                            }}
                                            onItemsRendered={onItemsRendered}
                                            overscanCount={20}
                                        >
                                            {RenderRow}
                                        </List>
                                    )}
                                </InfiniteLoader>
                            </div>
                        </div>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
});

export default Grid;
