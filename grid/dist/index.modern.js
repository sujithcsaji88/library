import React, { memo, forwardRef, useState, useRef, useEffect, createRef, useMemo, useCallback } from 'react';
import { useAsyncDebounce, useTable, useFilters, useGlobalFilter, useSortBy, useRowSelect, useFlexLayout, useResizeColumns, useExpanded } from 'react-table';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

const RowSelector = memo(forwardRef(({
  indeterminate,
  ...rest
}, ref) => {
  const [checkValue, setCheckValue] = useState(indeterminate);
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  const onChange = () => {
    setCheckValue(!indeterminate);
  };

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return /*#__PURE__*/React.createElement("div", {
    className: "check-wrap"
  }, /*#__PURE__*/React.createElement("input", Object.assign({
    type: "checkbox",
    checked: checkValue,
    onChange: onChange,
    ref: resolvedRef
  }, rest)));
}));

const DefaultColumnFilter = memo(({
  column: {
    filterValue,
    setFilter
  }
}) => {
  return /*#__PURE__*/React.createElement("input", {
    className: "txt",
    value: filterValue || "",
    onChange: e => {
      setFilter(e.target.value || undefined);
    },
    placeholder: "Search"
  });
});

const GlobalFilter = memo(({
  globalFilter,
  setGlobalFilter
}) => {
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);
  return /*#__PURE__*/React.createElement("div", {
    className: "txt-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: value || "",
    onChange: e => {
      setValue(e.target.value);
      onChange(e.target.value);
    },
    className: "txt",
    placeholder: "Search"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-search fa-6",
    "aria-hidden": "true"
  }));
});

const listRef = createRef(null);
const Grid = memo(props => {
  const {
    title,
    gridHeight,
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

  if (!(data && data.length) || !(columns && columns.length)) {
    return /*#__PURE__*/React.createElement("h2", {
      style: {
        marginTop: "50px",
        textAlign: "center"
      }
    }, "Invalid Data or Columns Configuration");
  }

  const itemCount = hasNextPage ? data.length + 1 : data.length;
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage ? loadNextPage : () => {};

  const isItemLoaded = index => !hasNextPage || index < data.length;

  const [isFilterOpen, setFilterOpen] = useState(false);

  const toggleColumnFilter = () => {
    setFilterOpen(!isFilterOpen);
  };

  const defaultColumn = useMemo(() => ({
    Filter: DefaultColumnFilter
  }), []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state,
    setGlobalFilter
  } = useTable({
    columns,
    data,
    defaultColumn,
    updateCellData,
    globalFilter: (rows, columns, filterValue) => {
      if (globalSearchLogic && typeof globalSearchLogic === "function") {
        return globalSearchLogic(rows, columns, filterValue);
      } else {
        return rows;
      }
    }
  }, useFilters, useGlobalFilter, useSortBy, useRowSelect, useFlexLayout, useResizeColumns, useExpanded, hooks => {
    hooks.allColumns.push(columns => [{
      id: "selection",
      disableResizing: true,
      disableFilters: true,
      disableSortBy: true,
      minWidth: 35,
      width: 35,
      maxWidth: 35,
      Header: ({
        getToggleAllRowsSelectedProps
      }) => /*#__PURE__*/React.createElement(RowSelector, getToggleAllRowsSelectedProps()),
      Cell: ({
        row
      }) => /*#__PURE__*/React.createElement(RowSelector, row.getToggleRowSelectedProps())
    }, ...columns]);
  });
  const RenderRow = useCallback(({
    index,
    style
  }) => {
    if (isItemLoaded(index)) {
      const row = rows[index];
      prepareRow(row);
      return /*#__PURE__*/React.createElement("div", Object.assign({}, row.getRowProps({
        style
      }), {
        className: "table-row tr"
      }), /*#__PURE__*/React.createElement("div", {
        className: "table-row-wrap"
      }, row.cells.map(cell => {
        return /*#__PURE__*/React.createElement("div", Object.assign({}, cell.getCellProps(), {
          className: "table-cell td"
        }), cell.render("Cell"));
      })), row.isExpanded ? /*#__PURE__*/React.createElement("div", {
        className: "expand"
      }, renderExpandedContent ? renderExpandedContent(row) : null) : null);
    }
  }, [prepareRow, rows, renderExpandedContent]);

  const bulkSelector = () => {
    if (selectBulkData) {
      selectBulkData(selectedFlatRows);
    }
  };

  useEffect(() => {
    if (listRef && listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-filter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "results"
  }, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, /*#__PURE__*/React.createElement("strong", null, rows.length), /*#__PURE__*/React.createElement("span", null, " ", title ? title : "Rows"))), /*#__PURE__*/React.createElement("div", {
    className: "filter-utilities"
  }, /*#__PURE__*/React.createElement(GlobalFilter, {
    globalFilter: state.globalFilter,
    setGlobalFilter: setGlobalFilter
  }), /*#__PURE__*/React.createElement("div", {
    className: "filter-icon keyword-search",
    onClick: toggleColumnFilter
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-filter",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "filter-icon bulk-select",
    onClick: bulkSelector
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-pencil-square-o"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "tableContainer table-outer",
    style: {
      height: gridHeight ? gridHeight : "50vh"
    }
  }, /*#__PURE__*/React.createElement(AutoSizer, {
    disableWidth: true,
    disableResizing: true
  }, ({
    height
  }) => /*#__PURE__*/React.createElement("div", Object.assign({}, getTableProps(), {
    className: "table"
  }), /*#__PURE__*/React.createElement("div", {
    className: "thead table-row table-row--head"
  }, headerGroups.map(headerGroup => /*#__PURE__*/React.createElement("div", Object.assign({}, headerGroup.getHeaderGroupProps(), {
    className: "tr"
  }), headerGroup.headers.map(column => /*#__PURE__*/React.createElement("div", Object.assign({}, column.getHeaderProps(), {
    className: "table-cell column-heading th"
  }), /*#__PURE__*/React.createElement("div", column.getSortByToggleProps(), column.render("Header"), /*#__PURE__*/React.createElement("span", null, column.isSorted ? column.isSortedDesc ? /*#__PURE__*/React.createElement("i", {
    className: "fa fa-sort-desc",
    "aria-hidden": "true"
  }) : /*#__PURE__*/React.createElement("i", {
    className: "fa fa-sort-asc",
    "aria-hidden": "true"
  }) : "")), /*#__PURE__*/React.createElement("div", {
    className: `txt-wrap column-filter ${isFilterOpen ? "open" : ""}`
  }, !column.disableFilters ? column.render("Filter") : null), column.canResize && /*#__PURE__*/React.createElement("div", Object.assign({}, column.getResizerProps(), {
    className: "resizer"
  }))))))), /*#__PURE__*/React.createElement("div", Object.assign({}, getTableBodyProps(), {
    className: "tbody"
  }), /*#__PURE__*/React.createElement(InfiniteLoader, {
    isItemLoaded: isItemLoaded,
    itemCount: itemCount,
    loadMoreItems: loadMoreItems
  }, ({
    onItemsRendered,
    ref
  }) => /*#__PURE__*/React.createElement(VariableSizeList, {
    ref: list => {
      ref(list);
      listRef.current = list;
    },
    className: "table-list",
    height: height,
    itemCount: rows.length,
    itemSize: index => {
      if (calculateRowHeight && typeof calculateRowHeight === "function") {
        return calculateRowHeight(rows, index, headerGroups);
      } else {
        return 70;
      }
    },
    onItemsRendered: onItemsRendered,
    overscanCount: 20
  }, RenderRow)))))));
});

export default Grid;
//# sourceMappingURL=index.modern.js.map
