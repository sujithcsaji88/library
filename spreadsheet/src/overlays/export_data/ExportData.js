import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFilePdf,
  faFileExcel,
  faFileCsv,
} from "@fortawesome/free-solid-svg-icons";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

let downLaodFileType = [];
class ExportData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnValueList: this.props.columnsList,
      columnEntityList: [],
      isAllSelected: false,
      downLaodFileType: [],
      filteredRow: [],
      warning: "",
      clickTag: "none",
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.selectDownLoadType = this.selectDownLoadType.bind(this);
    this.exportValidation = this.exportValidation.bind(this);
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeExport();
    }
  }

  resetColumnExportList = () => {
    this.setState({
      columnEntityList: [],
      isAllSelected: false,
    });
  };

  selectAllToColumnList = () => {
    this.resetColumnExportList();
    this.setState({
      columnEntityList: !this.state.isAllSelected ? this.props.columnsList : [],
      isAllSelected: !this.state.isAllSelected,
    });
  };

  addToColumnEntityList = (typeToBeAdded) => {
    var existingColumnEntityList = this.state.columnEntityList;
    if (!existingColumnEntityList.includes(typeToBeAdded)) {
      existingColumnEntityList.push(typeToBeAdded);
    } else {
      existingColumnEntityList = existingColumnEntityList.filter((item) => {
        return item !== typeToBeAdded 
      });
    }
    this.setState({
      columnEntityList: existingColumnEntityList,
      isAllSelected: false,
    });
  };

  selectDownLoadType = (event) => {
    if (
      event.target.checked &&
      !this.state.downLaodFileType.includes(event.target.value)
    ) {
      downLaodFileType.push(event.target.value);
      this.setState({ downLaodFileType });
    } else {
      downLaodFileType.map(function (value, index) {
        if (value === event.target.value) {
          downLaodFileType = downLaodFileType.splice(index, value);
        }
      });
      this.setState({ downLaodFileType });
    }
  };

  exportRowData = () => {
    const columnVlaueList = this.state.columnEntityList;
    if (columnVlaueList.length > 0 && this.state.downLaodFileType.length > 0) {
      this.props.rows.forEach((row) => {
        const keys = Object.getOwnPropertyNames(row);
        var filteredColumnVal = {};
        keys.forEach(function (key) {
          columnVlaueList.forEach((columnName) => {
            if (columnName.key === key) filteredColumnVal[key] = row[key];
          });
        });
        this.state.filteredRow.push(filteredColumnVal);
      });

      this.state.downLaodFileType.map((item) => {
        if (item === "pdf") this.downloadPDF();
        else if (item === "excel") this.downloadXLSFile();
        else this.downloadCSVFile();
      });
    }
  };

  downloadPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 300;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = "iCargo Report";
    const headers = [
      this.state.columnEntityList.map((column) => {
        return column.name;
      }),
    ];
    var dataValues = [];
    this.props.rows.forEach((row) => {
      const keys = Object.keys(row);
      var filteredColumnVal = [];
      this.state.columnEntityList.forEach((columnName) => {
        keys.forEach((key) => {
          if (columnName.key === key) filteredColumnVal.push(row[key]);
        });
      });
      dataValues.push(filteredColumnVal);
    });

    let content = {
      startY: 50,
      head: headers,
      body: dataValues,
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save("report.pdf");
  };

  downloadCSVFile = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".csv";
    const fileName = "CSVDownload";
    const ws = XLSX.utils.json_to_sheet(this.state.filteredRow);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "csv", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  downloadXLSFile = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const fileName = "XLSXDownload";
    const ws = XLSX.utils.json_to_sheet(this.state.filteredRow);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  columnSearchLogic = (e) => {
    const searchKey = String(e.target.value).toLowerCase();
    let filteredRows = this.props.columnsList.filter((item) => {
      return item.name.toLowerCase().includes(searchKey);
    });
    if (!filteredRows.length) {
      this.setState({ columnValueList: this.props.columnsList });
    } else {
      this.setState({ columnValueList: filteredRows });
    }
  };

  exportValidation = () => {
    let columnLength = this.state.columnEntityList.length;
    let fileLength = this.state.downLaodFileType.length;
    if (columnLength > 0 && fileLength > 0) {
      this.exportRowData();
      this.setState({ clickTag: "none" });
    } else if (columnLength === 0) {
      this.setState({ warning: "Column" });
      this.setState({ clickTag: "" });
    } else if (fileLength === 0) {
      this.setState({ warning: "File Type" });
      this.setState({ clickTag: "" });
    }
    if (columnLength === 0 && fileLength === 0) {
      this.setState({ warning: "File Type & Column" });
      this.setState({ clickTag: "" });
    }
  };
  render() {
    return (
      <div className="exports--grid" ref={this.setWrapperRef}>
        <div className="export__grid">
          <div className="export__chooser">
            <div className="export__header">
              <div className="">
                <strong>Export Data</strong>
              </div>
            </div>
            <div className="export__body">
              <div>
                <input
                  type="text"
                  placeholder="Search export"
                  className="custom__ctrl"
                  onChange={this.columnSearchLogic}
                ></input>
              </div>
              <div className="export__selectAll">
                <div>
                <input 
									className='column__checkbox'
									type='checkbox'
                  onChange={() => this.selectAllToColumnList()}
								  checked={this.state.isAllSelected}
								/>
									Select All
                </div>
              </div>
              {this.state.columnValueList.length > 0
                ? this.state.columnValueList.map((column, index) => {
                    return (
                      <div className="export__wrap" key={column.key}>
                        <div className="export__checkbox">
                          <input
                            type="checkbox"
                            checked={this.state.columnEntityList.includes(
                              column
                            )}
                            onChange={() => this.addToColumnEntityList(column)}
                          ></input>
                        </div>
                        <div className="export__txt">{column.name}</div>
                      </div>
                    );
                  })
                : ""}
            </div>
          </div>
          <div className="export__settings">
            <div className="export__header">
              <div className="export__headerTxt"></div>
              <div className="export__close">
                <FontAwesomeIcon icon={faTimes} className="icon-close" onClick={this.props.closeExport}></FontAwesomeIcon>
              </div>
            </div>
            <div className="export__as">Export as</div>
            <div className="export__body">
              <div className="export__reorder">
                <div className="">
                  <input
                    type="checkbox"
                    name="pdf"
                    value="pdf"
                    onChange={this.selectDownLoadType}
                  ></input>
                </div>
                <div className="export__file">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="temp"
                  ></FontAwesomeIcon>
                </div>
              </div>
              <div className="export__reorder">
                <div className="">
                  <input
                    type="checkbox"
                    name="excel"
                    value="excel"
                    onChange={this.selectDownLoadType}
                  ></input>
                </div>
                <div className="export__file">
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    className="temp"
                  ></FontAwesomeIcon>
                </div>
              </div>
              <div className="export__reorder">
                <div className="">
                  <input
                    type="checkbox"
                    name="csv"
                    value="csv"
                    onChange={this.selectDownLoadType}
                  ></input>
                </div>
                <div className="export__file">
                  <FontAwesomeIcon
                    icon={faFileCsv}
                    className="temp"
                  ></FontAwesomeIcon>
                </div>
              </div>
              <div className="exportWarning">
                <span
                  style={{ display: this.state.clickTag }}
                  className="alert alert-danger"
                >
                  You haven't selected <strong>{this.state.warning}</strong>
                </span>
              </div>
            </div>
            <div className="export__footer">
              <div className="export__btns">
                <button
                  className="btns"
                  onClick={() => this.props.closeExport()}
                >
                  Cancel
                </button>
                <button
                  className="btns btns__save"
                  onClick={(e) => {
                    this.exportValidation();
                  }}
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ExportData;

