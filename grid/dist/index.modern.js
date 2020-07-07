import React, { memo, forwardRef, useState, useRef, useEffect, createRef, useMemo, useCallback } from 'react';
import { useAsyncDebounce, useTable, useFilters, useGlobalFilter, useSortBy, useExpanded, useRowSelect, useFlexLayout, useResizeColumns } from 'react-table';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

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

const ItemTypes = {
  COLUMN: "column"
};

const style = {
  cursor: "move"
};

const ColumnItem = ({
  id,
  text,
  moveColumn,
  findColumn
}) => {
  const originalIndex = findColumn(id).index;
  const [{
    isDragging
  }, drag] = useDrag({
    item: {
      type: ItemTypes.COLUMN,
      id,
      originalIndex
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    end: (dropResult, monitor) => {
      const {
        id: droppedId,
        originalIndex
      } = monitor.getItem();
      const didDrop = monitor.didDrop();

      if (!didDrop) {
        moveColumn(droppedId, originalIndex);
      }
    }
  });
  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    canDrop: () => false,

    hover({
      id: draggedId
    }) {
      if (draggedId !== id) {
        const {
          index: overIndex
        } = findColumn(id);
        moveColumn(draggedId, overIndex);
      }
    }

  });
  const opacity = isDragging ? 0 : 1;
  return /*#__PURE__*/React.createElement("div", {
    ref: node => drag(drop(node)),
    style: { ...style,
      opacity
    }
  }, text);
};

const ColumnsArray = [{
  id: 1,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 1"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 2,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 2"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 3,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 3"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 4,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 4"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 5,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 5"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 6,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 6"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 7,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 7"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 8,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 8"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}, {
  id: 9,
  text: /*#__PURE__*/React.createElement("div", {
    className: "column__reorder"
  }, /*#__PURE__*/React.createElement("div", {
    className: ""
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-align-justify",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: ""
  }, "AWB Number 9"), /*#__PURE__*/React.createElement("div", {
    className: "column__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "column__checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("div", {
    className: "column__txt"
  }, "Pin Left")))
}];

const ColumnsList = () => {
  const [columns, setColumns] = useState(ColumnsArray);

  const moveColumn = (id, atIndex) => {
    const {
      column,
      index
    } = findColumn(id);
    setColumns(update(columns, {
      $splice: [[index, 1], [atIndex, 0, column]]
    }));
  };

  const findColumn = id => {
    const column = columns.filter(c => `${c.id}` === id)[0];
    return {
      column,
      index: columns.indexOf(column)
    };
  };

  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: drop,
    style: {
      display: "flex",
      flexWrap: "wrap"
    }
  }, columns.map(column => /*#__PURE__*/React.createElement(ColumnItem, {
    key: column.id,
    id: `${column.id}`,
    text: column.text,
    moveColumn: moveColumn,
    findColumn: findColumn
  }))));
};

const ColumnReordering = props => {
  const {
    isManageColumnOpen,
    manageColumns
  } = props;

  if (isManageColumnOpen) {
    return /*#__PURE__*/React.createElement("div", {
      className: "columns--grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__chooser"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: ""
    }, /*#__PURE__*/React.createElement("strong", null, "Column Chooser"))), /*#__PURE__*/React.createElement("div", {
      className: "column__body"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Search column",
      className: "custom__ctrl"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__selectAll"
    }, /*#__PURE__*/React.createElement("a", {
      href: "",
      className: "column__selectTxt"
    }, "Select All")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")), /*#__PURE__*/React.createElement("div", {
      className: "column__wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__checkbox"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__txt"
    }, "AWB Number")))), /*#__PURE__*/React.createElement("div", {
      className: "column__settings"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__headerTxt"
    }, /*#__PURE__*/React.createElement("strong", null, "Column Setting")), /*#__PURE__*/React.createElement("div", {
      className: "column__close",
      onClick: manageColumns
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-times",
      "aria-hidden": "true"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "column__body"
    }, /*#__PURE__*/React.createElement(DndProvider, {
      backend: HTML5Backend
    }, /*#__PURE__*/React.createElement(ColumnsList, null))), /*#__PURE__*/React.createElement("div", {
      className: "column__footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__btns"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btns"
    }, "Reset"), /*#__PURE__*/React.createElement("button", {
      className: "btns",
      onClick: manageColumns
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btns btns__save"
    }, "Save"))))));
  } else {
    return /*#__PURE__*/React.createElement("div", null);
  }
};

const listRef = createRef(null);
const Grid = memo(props => {
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

  if (!(data && data.length > 0) || !(columns && columns.length > 0)) {
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

  const [isManageColumnOpen, setManageColumnOpen] = useState(false);

  const manageColumns = () => {
    setManageColumnOpen(!isManageColumnOpen);
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
    },
    autoResetFilters: false,
    autoResetGlobalFilter: false,
    autoResetSortBy: false,
    autoResetExpanded: false,
    autoResetSelectedRows: false
  }, useFilters, useGlobalFilter, useSortBy, useExpanded, useRowSelect, useFlexLayout, useResizeColumns, hooks => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "wrapper",
    style: {
      width: gridWidth ? gridWidth : "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-filter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "results"
  }, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, /*#__PURE__*/React.createElement("strong", null, rows.length), /*#__PURE__*/React.createElement("span", null, " ", title ? title : "Rows"))), /*#__PURE__*/React.createElement("div", {
    className: "filter-utilities"
  }, /*#__PURE__*/React.createElement(ColumnReordering, {
    isManageColumnOpen: isManageColumnOpen,
    manageColumns: manageColumns
  }), /*#__PURE__*/React.createElement(GlobalFilter, {
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
    className: "fa fa-pencil-square-o",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "filter-icon manage-columns",
    onClick: manageColumns
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-columns",
    "aria-hidden": "true"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "tableContainer table-outer",
    style: {
      height: gridHeight ? gridHeight : "50vh",
      overflowX: "auto",
      overflowY: "hidden"
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
    style: {
      overflowX: "hidden"
    },
    height: height - 60,
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
