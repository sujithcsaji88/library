import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faAlignJustify,
  faTrash,
  faPlus,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import SortingList from "./SortingList";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      rowList: [true],
      rows: [],
      sortingOrderList: [
        {
          sortBy: "Flight #",
          order: "Ascending",
          sortOn: "Value",
        },
      ],
      errorMessage: false,
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
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
      this.props.closeSorting();
    }
  }

  add = () => {
    let rowList = [...this.state.rowList];
    rowList.push(true);
    var existingSortingOrderList = this.state.sortingOrderList;
    existingSortingOrderList.push({
      sortBy: "Flight #",
      order: "Ascending",
      sortOn: "Value",
    });
    this.setState({
      rowList,
      sortingOrderList: existingSortingOrderList,
    });
  };

  copy = (i) => {
    let rowList = [...this.state.sortingOrderList];
    rowList.push(JSON.parse(JSON.stringify(rowList[i])));
    this.setState({ sortingOrderList: rowList });
  };

  clearAll = () => {
    this.setState({ sortingOrderList: [] });
  };

  remove = (i) => {
    let sortingOrderList = [...this.state.sortingOrderList];
    sortingOrderList.splice(i, 1);
    this.setState({ sortingOrderList });
  };

  createColumnsArrayFromProps = (rowsValue) => {
    return rowsValue.map((row, index) => {
      return {
        id: index,
        text: (
          <div className="sort__bodyContent" key={index}>
            <div className="sort__reorder">
              <div className="">
                <div>&nbsp;</div>
              </div>

              <div className="sort__icon">
                <FontAwesomeIcon icon={faAlignJustify}></FontAwesomeIcon>
              </div>
            </div>

            <div className="sort__reorder">
              <div className="">
                <div>Sort by</div>
              </div>

              <div className="sort__file">
                <select
                  className="custom__ctrl"
                  name={"sortBy"}
                  onChange={(e) =>
                    this.captureSortingFeildValues(e, index, "sortBy")
                  }
                  value={row.sortBy}
                >
                  {this.props.columnFieldValue.map((item, index) => (
                    <option key={index}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sort__reorder">
              <div className="">
                <div>Sort on</div>
              </div>

              <div className="sort__file">
                <select
                  className="custom__ctrl"
                  name={"sortOn"}
                  onChange={(e) =>
                    this.captureSortingFeildValues(e, index, "sortOn")
                  }
                  value={row.sortOn}
                >
                  <option>Value</option>
                </select>
              </div>
            </div>

            <div className="sort__reorder">
              <div className="">
                <div>Order</div>
              </div>

              <div className="sort__file">
                <select
                  className="custom__ctrl"
                  name={"order"}
                  onChange={(e) =>
                    this.captureSortingFeildValues(e, index, "order")
                  }
                  value={row.order}
                >
                  <option>Ascending</option>
                  <option>Descending</option>
                </select>
              </div>
            </div>

            <div className="sort__reorder">
              <div className="">
                <div>&nbsp;</div>
              </div>

              <div className="sort__icon">
                <FontAwesomeIcon
                  icon={faCopy}
                  title="Copy"
                  onClick={() => this.copy(index)}
                ></FontAwesomeIcon>
              </div>
            </div>

            <div className="sort__reorder">
              <div className="">
                <div>&nbsp;</div>
              </div>

              <div className="sort__icon">
                <FontAwesomeIcon
                  icon={faTrash}
                  title="Delete"
                  onClick={() => this.remove(index)}
                ></FontAwesomeIcon>
              </div>
            </div>
          </div>
        ),
      };
    });
  };

  captureSortingFeildValues = (event, index, sortingKey) => {
    var sortingObj = {
      //``
    };

    var existingSortingOrderList = this.state.sortingOrderList;

    if (sortingKey === "sortBy") {
      existingSortingOrderList[index]["sortBy"] = event.target.value;
    }
    if (sortingKey === "order") {
      existingSortingOrderList[index]["order"] = event.target.value;
    }
    if (
      existingSortingOrderList[index]["sortOn"] === "" ||
      existingSortingOrderList[index]["sortOn"] === undefined
    ) {
      existingSortingOrderList[index]["sortOn"] = "Value";
    }
    this.setState({
      sortingOrderList: existingSortingOrderList,
    });
  };

  updateTableAsPerSortCondition = () => {
    const unique = new Set();
    const showError = this.state.sortingOrderList.some(
      (element) => unique.size === unique.add(element.sortBy).size
    );
    showError
      ? this.setState({
          errorMessage: true,
        })
      : this.setState({
          errorMessage: false,
        });
    console.log("FILTER SORT LIST OF OBJECTS ", this.state.sortingOrderList);
    this.props.setTableAsPerSortingParams(this.state.sortingOrderList);
  };

  render() {
    let { rowList } = this.state.rowList;
    return (
      <div className="sorts--grid" ref={this.setWrapperRef}>
        <div className="sort__grid">
          <div className="sort__settings">
            <div className="sort__header">
              <div className="sort__headerTxt">
                <strong>Sort </strong>
              </div>

              <div className="sort__close">
                <FontAwesomeIcon
                  className="icon-close"
                  icon={faTimes}
                  onClick={() => this.props.closeSorting()}
                ></FontAwesomeIcon>
              </div>
            </div>

            <div className="sort__body">
              <DndProvider
                backend={TouchBackend}
                options={{ enableMouseEvents: true }}
              >
                <SortingList
                  sortsArray={this.createColumnsArrayFromProps(
                    this.state.sortingOrderList
                  )}
                />
              </DndProvider>
              <div className="sort-warning">
                {this.state.errorMessage ? (
                  <span
                    style={{ display: this.state.clickTag }}
                    className="alert alert-danger"
                  >
                    Sort types opted are same, Please choose different one.
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="sort__new">
              <div className="sort__section">
                <FontAwesomeIcon
                  icon={faPlus}
                  className="sort__icon"
                ></FontAwesomeIcon>

                <div className="sort__txt" onClick={() => this.add()}>
                  New Sort
                </div>
              </div>
            </div>
            <div className="sort__footer">
              <div className="sort__btns">
                <button className="btns" onClick={this.clearAll}>
                  Clear All
                </button>

                <button
                  className="btns btns__save"
                  onClick={() => this.updateTableAsPerSortCondition()}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
