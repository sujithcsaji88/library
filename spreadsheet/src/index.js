import React, { Component } from "react";
import ExtDataGrid from "./common/extDataGrid";
import { Toolbar, Data, Filters, Editors } from "react-data-grid-addons";
import { range } from "lodash";
import { applyFormula } from "./utilities/utils";
import { FormControl } from "react-bootstrap";
import DatePicker from "./functions/DatePicker.js";
//import {onRowsSelected} from "../components/functions/OnRowsSelected.js"
import {
  faSortAmountDown,
  faColumns,
  // faSyncAlt,
  faShareAlt,
  // faAlignLeft,
  // faFilter,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ErrorMessage from "./common/ErrorMessage";
import ColumnReordering from "./overlays/column_chooser/Chooser";
import Sorting from "./overlays/sorting/Sorting";
import ExportData from "./overlays/export_data/ExportData";

const {
  DraggableHeader: { DraggableContainer },
} = require("react-data-grid-addons");

const { DropDownEditor } = Editors;

const defaultParsePaste = (str) => str.split(/\r\n|\n|\r/).map((row) => row.split("\t"));

// let newFilters = {};

const selectors = Data.Selectors;
let swapList = [];
const { AutoCompleteFilter, NumericFilter } = Filters;
class spreadsheet extends Component {
  constructor(props) {
    super(props);
    const airportCodes = [];
    this.props.airportCodes.forEach((item) => {
      airportCodes.push({ id: item, value: item });
    });
    this.state = {
      warningStatus: "",
      height: 680,
      displayNoRows: "none",
      searchIconDisplay: "",
      searchValue: "",
      filter: {},
      rows: this.props.rows,
      selectedIndexes: [],
      junk: {},
      topLeft: {},
      columnReorderingComponent: null,
      exportComponent: null,
      filteringRows: this.props.rows,
      tempRows: this.props.rows,
      sortingPanelComponent: null,
      count: this.props.rows.length,
      columns: this.props.columns.map((item) => {
        if (item.editor === "DatePicker") {
          item.editor = DatePicker;
        } else if (item.editor === "DropDown") {
          item.editor = <DropDownEditor options={airportCodes} />;
        } else if (item.editor === "Text") {
          item.editor = "text";
        } else {
          item.editor = null;
        }
        if (item.filterType === "numeric") {
          item.filterRenderer = NumericFilter;
        }
        else {
          item.filterRenderer = AutoCompleteFilter;
        }
        return item;
      }),
    };
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    this.handleSearchValue = this.handleSearchValue.bind(this);
    this.clearSearchValue = this.clearSearchValue.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);

    this.formulaAppliedCols = this.props.columns.filter((item) => {
      return item.formulaApplicable;
    });
  }
  componentDidUpdate(prevProps) {
    //Fix for column re-order and pin left issue (functionality was working only after doing a window re-size)
    const resizeEvent = document.createEvent("HTMLEvents");
    resizeEvent.initEvent("resize", true, false);
    window.dispatchEvent(resizeEvent);
  }
  updateRows = (startIdx, newRows) => {
    this.setState((state) => {
      const rows = state.rows.slice();
      for (let i = 0; i < newRows.length; i++) {
        if (startIdx + i < rows.length) {
          rows[startIdx + i] = {
            ...rows[startIdx + i],
            ...newRows[i],
          };
        }
      }
      return {
        rows,
      };
    });
  }

  rowGetter = (i) => {
    const { rows } = this.state;
    return rows[i];
  };

  handleCopy = (e) => {
    e.preventDefault();
    const { topLeft, botRight } = this.state;
    const text = range(topLeft.rowIdx, botRight.rowIdx + 1)
      .map((rowIdx) =>
        this.state.columns
          .slice(topLeft.colIdx - 1, botRight.colIdx)
          .map((col) => this.rowGetter(rowIdx)[col.key])
          .join("\t")
      )
      .join("\n");
    e.clipboardData.setData("text/plain", text);
  };

  handlePaste = (e) => {
    e.preventDefault();
    const { topLeft } = this.state;
    const newRows = [];
    const pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));
    pasteData.forEach((row) => {
      const rowData = {};
      // Merge the values from pasting and the keys from the columns
      this.state.columns.slice(topLeft.colIdx - 1, topLeft.colIdx - 1 + row.length).forEach((col, j) => {
        rowData[col.key] = row[j];
      });
      newRows.push(rowData);
    });
    this.updateRows(topLeft.rowIdx, newRows);
  };

  setSelection = (args) => {
    this.setState({
      topLeft: {
        rowIdx: args.topLeft.rowIdx,
        colIdx: args.topLeft.idx,
      },
      botRight: {
        rowIdx: args.bottomRight.rowIdx,
        colIdx: args.bottomRight.idx,
      },
    });
  };

  handleWarningStatus = () => {
    this.setState({ warningStatus: "invalid" })
  }
  closeWarningStatus = () => {
    this.setState({ warningStatus: "" })
  }
  componentWillReceiveProps(props) {
    this.setState({
      rows: props.rows,
    });
    this.setState({
      status: props.status,
    });
    this.setState({
      textValue: props.textValue,
    });
    this.setState({ count: props.count });
    this.setState({ warningStatus: props.status })
  }

  /**
 * Method To update the cell/cells with the edited values
 * @param {*} fromRow is the row from which this edit is performed
 * @param {*} toRow is the row upto which this edit is performed
 * @param {*} updated is the value of change
 * @param {*} action is type of edit action performed
 */
  onGridRowsUpdated = ({ fromRow, toRow, updated, action }) => {
    let columnName = "";
    const filter = this.formulaAppliedCols.filter((item) => {
      if (updated[item.key] !== null && updated[item.key] !== undefined) {
        columnName = item.key;
        return true;
      } else return false;
    });

    if (filter.length > 0) {
      updated = applyFormula(updated, columnName);
    }

    if (action !== "COPY_PASTE") {
      this.setState((state) => {
        const rows = state.rows.slice();
        for (let i = fromRow; i <= toRow; i++) {
          rows[i] = {
            ...rows[i],
            ...updated,
          };
        }

        return {
          rows,
        };
      });
      this.setState((state) => {
        const filteringRows = state.filteringRows.slice();
        for (let i = fromRow; i <= toRow; i++) {
          filteringRows[i] = {
            ...filteringRows[i],
            ...updated,
          };
        }

        return {
          filteringRows,
        };
      });
      this.setState((state) => {
        const tempRows = state.tempRows.slice();
        for (let i = fromRow; i <= toRow; i++) {
          tempRows[i] = {
            ...tempRows[i],
            ...updated,
          };
        }

        return {
          tempRows,
        };
      });
    }
    if (this.props.updateCellData) {
      this.props.updateCellData(this.state.tempRows[fromRow], this.state.tempRows[toRow], updated, action);
    }
  };
	/**
	 * Method To bulk/individual select of rows
	 * @param {*} rows is the selected row
	 */
  onRowsSelected = (rows) => {
    this.setState({
      selectedIndexes: this.state.selectedIndexes.concat(rows.map((r) => r.rowIdx)),
    });
    if (this.props.selectBulkData) {
      this.props.selectBulkData(rows);
    }
  };
	/**
	 * Method To bulk/individual deselect of rows
	 * @param {*} rows is the deselected row
	 */
  onRowsDeselected = (rows) => {
    let rowIndexes = rows.map((r) => r.rowIdx);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.filter((i) => rowIndexes.indexOf(i) === -1),
    });
  };

	/**
	 * Method To filter the multiple columns
	 * @param {*} value is the  incoming filtering event
	 */
  handleFilterChange = (value) => {
    let junk = this.state.junk;
    if (!(value.filterTerm == null) && !(value.filterTerm.length <= 0)) {
      junk[value.column.key] = value;
    } else {
      delete junk[value.column.key];
    }
    this.setState({ junk });
    const data = this.getrows(this.state.filteringRows, this.state.junk);
    this.setState({
      rows: data,
      tempRows: data,
      count: data.length,
    });
    if (data.length === 0) {
      this.handleWarningStatus();
    }
    else {
      this.closeWarningStatus();
    }
  };
  getrows = (rows, filters) => {
    if (Object.keys(filters).length <= 0) {
      filters = {};
    }
    selectors.getRows({ rows: [], filters: {} });
    return selectors.getRows({ rows: rows, filters: filters });
  };

  /**
 * Method To render the filter values for filtering rows
 * @param {*} rows is the row data to be considered for filtering
 * @param {*} columnId is the specific columnId for which the row datas are being considered
 */
  getValidFilterValues(rows, columnId) {
    return rows
      .map((r) => r[columnId])
      .filter((item, i, a) => {
        return i === a.indexOf(item);
      });
  }
  /**
* Method To sort the rows for a particular column
* @param {*} data is the row datas to be considered for sorting
* @param {*} sortColumn is the specific column for which the row sort is being triggered
* @param {*} sortDirection is the type of sort
*/
  sortRows = (data, sortColumn, sortDirection) => {
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    };
    this.setState({
      rows: [...data].sort(comparer),
    });
    return sortDirection === "NONE" ? data : this.state.rows;
  };
  /**
     * Method To swap the columns
     * @param {*} source is source column
     * @param {*} target is the target column 
     */
  onHeaderDrop = (source, target) => {
    const stateCopy = Object.assign({}, this.state);
    const columnSourceIndex = this.state.columns.findIndex((i) => i.key === source);
    const columnTargetIndex = this.state.columns.findIndex((i) => i.key === target);

    stateCopy.columns.splice(columnTargetIndex, 0, stateCopy.columns.splice(columnSourceIndex, 1)[0]);

    const emptyColumns = Object.assign({}, this.state, {
      columns: [],
    });
    this.setState(emptyColumns);

    const reorderedColumns = Object.assign({}, this.state, {
      columns: stateCopy.columns,
    });
    this.setState(reorderedColumns);
  }
  /**
    * Method To dynamically swap the column from column chooser
    * @param {*} reordered is the swapped array of columns
    */
  handleheaderNameList = (reordered) => {
    swapList = reordered;
  }
  updateTableAsPerRowChooser = (inComingColumnsHeaderList, pinnedColumnsList) => {
    var existingColumnsHeaderList = this.props.columns;
    existingColumnsHeaderList = existingColumnsHeaderList.filter((item) => {
      return inComingColumnsHeaderList.includes(item.name);
    });
    var rePositionedArray = existingColumnsHeaderList;
    var singleHeaderOneList;
    if (pinnedColumnsList.length > 0) {
      pinnedColumnsList
        .slice(0)
        .reverse()
        .map((item, index) => {
          singleHeaderOneList = existingColumnsHeaderList.filter((subItem) => item === subItem.name);
          rePositionedArray = this.array_move(
            existingColumnsHeaderList,
            existingColumnsHeaderList.indexOf(singleHeaderOneList[0]),
            index
          );
        });
    }
    if (swapList.length > 0) {
      swapList
        .map((item, index) => {
          singleHeaderOneList = existingColumnsHeaderList.filter((subItem) => item === subItem.name);
          rePositionedArray = this.array_move(
            existingColumnsHeaderList,
            existingColumnsHeaderList.indexOf(singleHeaderOneList[0]),
            index
          );
        });
    }

    existingColumnsHeaderList = rePositionedArray;
		/**
       making all the frozen attribute as false for all the columns and then 
       setting items of pinnedColumnsList as frozen = true
       */
    existingColumnsHeaderList.map((headerItem, index) => {
      if (headerItem.frozen !== undefined && headerItem.frozen === true) {
        existingColumnsHeaderList[index]["frozen"] = false;
      }
      if (pinnedColumnsList.includes(headerItem.name)) {
        existingColumnsHeaderList[index]["frozen"] = true;
      }
    });

    console.log("existingColumnsHeaderList ", existingColumnsHeaderList);

    this.setState({
      columns: existingColumnsHeaderList,
    });

    this.closeColumnReOrdering();
  };

	/**
	 * Method To re-position a particular object in an Array from old_index to new_index
	 * @param {*} arr inComing array
	 * @param {*} old_index initial index
	 * @param {*} new_index final index
	 */
  array_move = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  };

	/**
	 * Method to render the column Selector Pannel
	 */
  columnReorderingPannel = () => {
    var headerNameList = [];
    var existingPinnedHeadersList = [];
    this.state.columns
      .filter((item) => item.frozen !== undefined && item.frozen === true)
      .map((item) => existingPinnedHeadersList.push(item.name));
    this.state.columns.map((item) => headerNameList.push(item.name));
    this.setState({
      columnReorderingComponent: (
        <ColumnReordering
          maxLeftPinnedColumn={this.props.maxLeftPinnedColumn}
          updateTableAsPerRowChooser={this.updateTableAsPerRowChooser}
          headerKeys={headerNameList}
          closeColumnReOrdering={this.closeColumnReOrdering}
          existingPinnedHeadersList={existingPinnedHeadersList}
          handleheaderNameList={this.handleheaderNameList}
          {...this.props}
        />
      ),
    });
  };

	/**
	 * Method to stop the render the column Selector Pannel
	 */
  closeColumnReOrdering = () => {
    this.setState({
      columnReorderingComponent: null,
    });
  };
  handleSearchValue = (value) => {
    this.setState({ searchValue: value });
  };
  clearSearchValue = () => {
    this.setState({ searchValue: "" });
    this.setState({ filteringRows: this.state.filteringRows });
  };

  sortingPanel = () => {
    let columnField = [];
    this.state.columns.map((item) => columnField.push(item.name));
    this.setState({
      sortingPanelComponent: <Sorting setTableAsPerSortingParams={(args) =>this.setTableAsPerSortingParams(args)}
      columnFieldValue={columnField} 
      closeSorting={this.closeSorting} />,
    });
  };

  closeSorting = () => {
    this.setState({
      sortingPanelComponent: null,
    });
  };

  //Export Data Logic
  exportColumnData = () => {
    this.setState({
      exportComponent: (
        <ExportData rows={this.state.rows} columnsList={this.state.columns} closeExport={this.closeExport} />
      ),
    });
  };

  closeExport = () => {
    this.setState({
      exportComponent: null,
    });
  };

  setTableAsPerSortingParams = (tableSortList) => {
   
    var existingRows = this.state.rows;
    var sortingOrderNameList = [];
    tableSortList.map((item, index) => {
      var nameOfItem = "";
      Object.keys(this.state.rows[0]).map(rowItem=>{
        if(item.sortBy === "Flight #" && rowItem === "flightno"){
          nameOfItem = "flightno";
        }
        else if(rowItem.toLowerCase() === this.toCamelCase(item.sortBy).toLowerCase()){
          nameOfItem= rowItem;
        }
      })
      console.log(nameOfItem)
      var typeOfItem = this.state.rows[0][
        item.sortBy === "Flight #" ? "flightno" : nameOfItem
      ];
      if (typeof typeOfItem === "number") {
        sortingOrderNameList.push({
          name:nameOfItem,
          primer: parseInt,
          reverse: item.order === "Ascending" ? false : true,
        });
      } else {
        sortingOrderNameList.push({
          name: nameOfItem,
          reverse: item.order === "Ascending" ? false : true,
        });
      }
    });
    existingRows.sort(sort_by(...sortingOrderNameList));
    this.setState({
      rows: existingRows,
    });

    this.closeSorting();
  };

  toCamelCase = (str) => {
    return str
      .replace(/\s(.)/g, function ($1) {
        return $1.toUpperCase();
      })
      .replace(/\s/g, "")
      .replace(/^(.)/, function ($1) {
        return $1.toLowerCase();
      });
  };

  render() {
    return (
      <div>
        <div className='parentDiv'>
          <div className='totalCount'>
            Showing <strong> {this.state.count} </strong> records
					</div>
          <div className='globalSearch'>
            <i className="fa fa-search"></i>
            <FormControl
              className="globalSeachInput"
              type='text'
              placeholder="Search"
              onChange={(e) => {
                this.handleSearchValue(e.target.value);
                this.props.globalSearchLogic(e, this.state.tempRows);
              }}
              value={this.state.searchValue}
            />
          </div>
          {/* <div className="filterIcons">
            <FontAwesomeIcon icon={faFilter} />
          </div> */}
          <div className='filterIcons' onClick={this.sortingPanel}>
            <FontAwesomeIcon title='Group Sort' icon={faSortAmountDown} />
            <FontAwesomeIcon icon={faSortDown} className='filterArrow' />
          </div>
          {this.state.sortingPanelComponent}
          <div className='filterIcons' onClick={this.columnReorderingPannel}>
            <FontAwesomeIcon title='Column Chooser' icon={faColumns} />
            <FontAwesomeIcon icon={faSortDown} className='filterArrow' />
          </div>
          {this.state.columnReorderingComponent}
          <div className='filterIcons'>
            <FontAwesomeIcon title='Export' icon={faShareAlt} onClick={this.exportColumnData} />
          </div>
          {this.state.exportComponent}
          {/* <div className="filterIcons">
            <FontAwesomeIcon title="Reload" icon={faSyncAlt} />
          </div> */}
          {/* <div className="filterIcons">
            <FontAwesomeIcon icon={faAlignLeft} />
          </div> */}
        </div>
        <ErrorMessage
          className='errorDiv'
          status={this.state.warningStatus}
          closeWarningStatus={(e) => {
            this.props.closeWarningStatus();
            this.closeWarningStatus();
          }}
          clearSearchValue={this.clearSearchValue}
        />
        <DraggableContainer className='gridDiv' onHeaderDrop={this.onHeaderDrop}>
          <ExtDataGrid
            toolbar={<Toolbar enableFilter={true} />}
            getValidFilterValues={(columnKey) => this.getValidFilterValues(this.state.filteringRows, columnKey)}
            minHeight={this.state.height}
            columns={this.state.columns}
            rowGetter={(i) => this.state.rows[i]}
            rowsCount={this.state.rows.length}
            onGridRowsUpdated={this.onGridRowsUpdated}
            enableCellSelect={true}
            onClearFilters={() => {
              this.setState({ junk: {} });
            }}
            onColumnResize={(idx, width) => console.log(`Column ${idx} has been resized to ${width}`)}
            onAddFilter={(filter) => this.handleFilterChange(filter)}
            rowSelection={{
              showCheckbox: true,
              enableShiftSelect: true,
              onRowsSelected: this.onRowsSelected,
              onRowsDeselected: this.onRowsDeselected,
              selectBy: {
                indexes: this.state.selectedIndexes,
              },
            }}
            onGridSort={(sortColumn, sortDirection) => this.sortRows(this.state.filteringRows, sortColumn, sortDirection)}
          // cellRangeSelection={{
          //   onComplete: this.setSelection,
          // }}
          />
        </DraggableContainer>
      </div>
    );
  }
}

/**
 * Global Method To Sort The Grid.
 */
var sort_by;
(function () {
  // utility functions
  var default_cmp = function (a, b) {
      if (a == b) return 0;
      return a < b ? -1 : 1;
    },
    getCmpFunc = function (primer, reverse) {
      var cmp = default_cmp;
      if (primer) {
        cmp = function (a, b) {
          return default_cmp(primer(a), primer(b));
        };
      }
      if (reverse) {
        return function (a, b) {
          return -1 * cmp(a, b);
        };
      }
      return cmp;
    };

  // actual implementation
  sort_by = function () {
    var fields = [],
      n_fields = arguments.length,
      field,
      name,
      reverse,
      cmp;

    // preprocess sorting options
    for (var i = 0; i < n_fields; i++) {
      field = arguments[i];
      if (typeof field === "string") {
        name = field;
        cmp = default_cmp;
      } else {
        name = field.name;
        cmp = getCmpFunc(field.primer, field.reverse);
      }
      fields.push({
        name: name,
        cmp: cmp,
      });
    }

    return function (A, B) {
      var a, b, name, cmp, result;
      for (var i = 0, l = n_fields; i < l; i++) {
        result = 0;
        field = fields[i];
        name = field.name;
        cmp = field.cmp;

        result = cmp(A[name], B[name]);
        if (result !== 0) break;
      }
      return result;
    };
  };
})();

export default spreadsheet;
