function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var reactTable = require('react-table');
var reactWindow = require('react-window');
var AutoSizer = _interopDefault(require('react-virtualized-auto-sizer'));
var InfiniteLoader = _interopDefault(require('react-window-infinite-loader'));

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var RowSelector = React.memo(React.forwardRef(function (_ref, ref) {
  var indeterminate = _ref.indeterminate,
      rest = _objectWithoutPropertiesLoose(_ref, ["indeterminate"]);

  var _useState = React.useState(indeterminate),
      checkValue = _useState[0],
      setCheckValue = _useState[1];

  var defaultRef = React.useRef();
  var resolvedRef = ref || defaultRef;

  var onChange = function onChange() {
    setCheckValue(!indeterminate);
  };

  React.useEffect(function () {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: "check-wrap"
  }, /*#__PURE__*/React__default.createElement("input", _extends({
    type: "checkbox",
    checked: checkValue,
    onChange: onChange,
    ref: resolvedRef
  }, rest)));
}));

var DefaultColumnFilter = React.memo(function (_ref) {
  var _ref$column = _ref.column,
      filterValue = _ref$column.filterValue,
      setFilter = _ref$column.setFilter;
  return /*#__PURE__*/React__default.createElement("input", {
    className: "txt",
    value: filterValue || "",
    onChange: function onChange(e) {
      setFilter(e.target.value || undefined);
    },
    placeholder: "Search"
  });
});

var GlobalFilter = React.memo(function (_ref) {
  var globalFilter = _ref.globalFilter,
      setGlobalFilter = _ref.setGlobalFilter;

  var _useState = React.useState(globalFilter),
      value = _useState[0],
      setValue = _useState[1];

  var _onChange = reactTable.useAsyncDebounce(function (value) {
    setGlobalFilter(value || undefined);
  }, 200);

  return /*#__PURE__*/React__default.createElement("div", {
    className: "txt-wrap"
  }, /*#__PURE__*/React__default.createElement("input", {
    type: "text",
    value: value || "",
    onChange: function onChange(e) {
      setValue(e.target.value);

      _onChange(e.target.value);
    },
    className: "txt",
    placeholder: "Search"
  }), /*#__PURE__*/React__default.createElement("i", {
    className: "fa fa-search fa-6",
    "aria-hidden": "true"
  }));
});

var listRef = React.createRef(null);
var Grid = React.memo(function (props) {
  var title = props.title,
      gridHeight = props.gridHeight,
      columns = props.columns,
      data = props.data,
      globalSearchLogic = props.globalSearchLogic,
      updateCellData = props.updateCellData,
      selectBulkData = props.selectBulkData,
      calculateRowHeight = props.calculateRowHeight,
      renderExpandedContent = props.renderExpandedContent,
      hasNextPage = props.hasNextPage,
      isNextPageLoading = props.isNextPageLoading,
      loadNextPage = props.loadNextPage;

  if (!(data && data.length) || !(columns && columns.length)) {
    return /*#__PURE__*/React__default.createElement("h2", {
      style: {
        marginTop: "50px",
        textAlign: "center"
      }
    }, "Invalid Data or Columns Configuration");
  }

  var itemCount = hasNextPage ? data.length + 1 : data.length;
  var loadMoreItems = isNextPageLoading ? function () {} : loadNextPage ? loadNextPage : function () {};

  var isItemLoaded = function isItemLoaded(index) {
    return !hasNextPage || index < data.length;
  };

  var _useState = React.useState(false),
      isFilterOpen = _useState[0],
      setFilterOpen = _useState[1];

  var toggleColumnFilter = function toggleColumnFilter() {
    setFilterOpen(!isFilterOpen);
  };

  var defaultColumn = React.useMemo(function () {
    return {
      Filter: DefaultColumnFilter
    };
  }, []);

  var _useTable = reactTable.useTable({
    columns: columns,
    data: data,
    defaultColumn: defaultColumn,
    updateCellData: updateCellData,
    globalFilter: function globalFilter(rows, columns, filterValue) {
      if (globalSearchLogic && typeof globalSearchLogic === "function") {
        return globalSearchLogic(rows, columns, filterValue);
      } else {
        return rows;
      }
    }
  }, reactTable.useFilters, reactTable.useGlobalFilter, reactTable.useSortBy, reactTable.useRowSelect, reactTable.useFlexLayout, reactTable.useResizeColumns, reactTable.useExpanded, function (hooks) {
    hooks.allColumns.push(function (columns) {
      return [{
        id: "selection",
        disableResizing: true,
        disableFilters: true,
        disableSortBy: true,
        minWidth: 35,
        width: 35,
        maxWidth: 35,
        Header: function Header(_ref) {
          var getToggleAllRowsSelectedProps = _ref.getToggleAllRowsSelectedProps;
          return /*#__PURE__*/React__default.createElement(RowSelector, getToggleAllRowsSelectedProps());
        },
        Cell: function Cell(_ref2) {
          var row = _ref2.row;
          return /*#__PURE__*/React__default.createElement(RowSelector, row.getToggleRowSelectedProps());
        }
      }].concat(columns);
    });
  }),
      getTableProps = _useTable.getTableProps,
      getTableBodyProps = _useTable.getTableBodyProps,
      headerGroups = _useTable.headerGroups,
      rows = _useTable.rows,
      prepareRow = _useTable.prepareRow,
      selectedFlatRows = _useTable.selectedFlatRows,
      state = _useTable.state,
      setGlobalFilter = _useTable.setGlobalFilter;

  var RenderRow = React.useCallback(function (_ref3) {
    var index = _ref3.index,
        style = _ref3.style;

    if (isItemLoaded(index)) {
      var row = rows[index];
      prepareRow(row);
      return /*#__PURE__*/React__default.createElement("div", _extends({}, row.getRowProps({
        style: style
      }), {
        className: "table-row tr"
      }), /*#__PURE__*/React__default.createElement("div", {
        className: "table-row-wrap"
      }, row.cells.map(function (cell) {
        return /*#__PURE__*/React__default.createElement("div", _extends({}, cell.getCellProps(), {
          className: "table-cell td"
        }), cell.render("Cell"));
      })), row.isExpanded ? /*#__PURE__*/React__default.createElement("div", {
        className: "expand"
      }, renderExpandedContent ? renderExpandedContent(row) : null) : null);
    }
  }, [prepareRow, rows, renderExpandedContent]);

  var bulkSelector = function bulkSelector() {
    if (selectBulkData) {
      selectBulkData(selectedFlatRows);
    }
  };

  React.useEffect(function () {
    if (listRef && listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  });
  return /*#__PURE__*/React__default.createElement("div", {
    className: "wrapper"
  }, /*#__PURE__*/React__default.createElement("div", {
    className: "table-filter"
  }, /*#__PURE__*/React__default.createElement("div", {
    className: "results"
  }, /*#__PURE__*/React__default.createElement("div", {
    className: "name"
  }, /*#__PURE__*/React__default.createElement("strong", null, rows.length), /*#__PURE__*/React__default.createElement("span", null, " ", title ? title : "Rows"))), /*#__PURE__*/React__default.createElement("div", {
    className: "filter-utilities"
  }, /*#__PURE__*/React__default.createElement(GlobalFilter, {
    globalFilter: state.globalFilter,
    setGlobalFilter: setGlobalFilter
  }), /*#__PURE__*/React__default.createElement("div", {
    className: "filter-icon keyword-search",
    onClick: toggleColumnFilter
  }, /*#__PURE__*/React__default.createElement("i", {
    className: "fa fa-filter",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default.createElement("div", {
    className: "filter-icon bulk-select",
    onClick: bulkSelector
  }, /*#__PURE__*/React__default.createElement("i", {
    className: "fa fa-pencil-square-o"
  })))), /*#__PURE__*/React__default.createElement("div", {
    className: "tableContainer table-outer",
    style: {
      height: gridHeight ? gridHeight : "50vh"
    }
  }, /*#__PURE__*/React__default.createElement(AutoSizer, {
    disableWidth: true,
    disableResizing: true
  }, function (_ref4) {
    var height = _ref4.height;
    return /*#__PURE__*/React__default.createElement("div", _extends({}, getTableProps(), {
      className: "table"
    }), /*#__PURE__*/React__default.createElement("div", {
      className: "thead table-row table-row--head"
    }, headerGroups.map(function (headerGroup) {
      return /*#__PURE__*/React__default.createElement("div", _extends({}, headerGroup.getHeaderGroupProps(), {
        className: "tr"
      }), headerGroup.headers.map(function (column) {
        return /*#__PURE__*/React__default.createElement("div", _extends({}, column.getHeaderProps(), {
          className: "table-cell column-heading th"
        }), /*#__PURE__*/React__default.createElement("div", column.getSortByToggleProps(), column.render("Header"), /*#__PURE__*/React__default.createElement("span", null, column.isSorted ? column.isSortedDesc ? /*#__PURE__*/React__default.createElement("i", {
          className: "fa fa-sort-desc",
          "aria-hidden": "true"
        }) : /*#__PURE__*/React__default.createElement("i", {
          className: "fa fa-sort-asc",
          "aria-hidden": "true"
        }) : "")), /*#__PURE__*/React__default.createElement("div", {
          className: "txt-wrap column-filter " + (isFilterOpen ? "open" : "")
        }, !column.disableFilters ? column.render("Filter") : null), column.canResize && /*#__PURE__*/React__default.createElement("div", _extends({}, column.getResizerProps(), {
          className: "resizer"
        })));
      }));
    })), /*#__PURE__*/React__default.createElement("div", _extends({}, getTableBodyProps(), {
      className: "tbody"
    }), /*#__PURE__*/React__default.createElement(InfiniteLoader, {
      isItemLoaded: isItemLoaded,
      itemCount: itemCount,
      loadMoreItems: loadMoreItems
    }, function (_ref5) {
      var onItemsRendered = _ref5.onItemsRendered,
          _ref6 = _ref5.ref;
      return /*#__PURE__*/React__default.createElement(reactWindow.VariableSizeList, {
        ref: function ref(list) {
          _ref6(list);

          listRef.current = list;
        },
        className: "table-list",
        height: height,
        itemCount: rows.length,
        itemSize: function itemSize(index) {
          if (calculateRowHeight && typeof calculateRowHeight === "function") {
            return calculateRowHeight(rows, index, headerGroups);
          } else {
            return 70;
          }
        },
        onItemsRendered: onItemsRendered,
        overscanCount: 20
      }, RenderRow);
    })));
  })));
});

module.exports = Grid;
//# sourceMappingURL=index.js.map
