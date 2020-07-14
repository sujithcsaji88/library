import React from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faAlignJustify } from "@fortawesome/free-solid-svg-icons";
import ColumnsList from "./columnsList";

class ColumnReordering extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnReorderEntityList: this.props.headerKeys,
      columnSelectList: this.props.columns.map((item) => item.name),
      leftPinnedColumList: this.props.existingPinnedHeadersList,
      isAllSelected: true,
      maxLeftPinnedColumn: this.props.maxLeftPinnedColumn,
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
      this.props.closeColumnReOrdering();
    }
  }

  /**
   * Method to reset the coloumn list onClick of Reset button
   */
  resetColumnReorderList = () => {
    this.setState({
      columnReorderEntityList: this.props.columns.map((item) => item.name),
      leftPinnedColumList: [],
      isAllSelected: true,
    });
  };

  /**
   * Method to Select all options in the coloumn list onClick of Select All button
   */
  selectAllToColumnReOrderList = () => {
    this.resetColumnReorderList();
    var existingColumnReorderEntityList = this.state.columnReorderEntityList;
    var isExistingAllSelect = this.state.isAllSelected;
    if (!isExistingAllSelect) {
      existingColumnReorderEntityList = this.props.columns.map(
        (item) => item.name
      );
      isExistingAllSelect = true;
    } else {
      existingColumnReorderEntityList = [];
      isExistingAllSelect = false;
    }
    this.setState({
      columnReorderEntityList: existingColumnReorderEntityList,
      isAllSelected: isExistingAllSelect,
      leftPinnedColumList: [],
    });
  };

  /**
   * Method To add a column to columnReorderEntityList when selected.
   * @param {String} typeToBeAdded
   */
  addToColumnReorderEntityList = (typeToBeAdded) => {
    var existingColumnReorderEntityList = this.state.columnReorderEntityList;
    var existingLeftPinnedList = this.state.leftPinnedColumList;
    if (!existingColumnReorderEntityList.includes(typeToBeAdded)) {
      var indexOfInsertion = this.state.columnSelectList.findIndex(
        (item) => item === typeToBeAdded
      );
      while (indexOfInsertion > 0) {
        if (
          existingColumnReorderEntityList.includes(
            this.state.columnSelectList[indexOfInsertion - 1]
          )
        ) {
          if (
            !existingLeftPinnedList.includes(
              this.state.columnSelectList[indexOfInsertion - 1]
            )
          ) {
            indexOfInsertion = existingColumnReorderEntityList.findIndex(
              (item) =>
                item === this.state.columnSelectList[indexOfInsertion - 1]
            );
            indexOfInsertion = indexOfInsertion + 1;
            break;
          } else {
            indexOfInsertion = indexOfInsertion - 1;
          }
        } else {
          indexOfInsertion = indexOfInsertion - 1;
        }
      }
      existingColumnReorderEntityList.splice(
        indexOfInsertion,
        0,
        typeToBeAdded
      );
    } else {
      existingColumnReorderEntityList = existingColumnReorderEntityList.filter(
        (item) => {
          if (item !== typeToBeAdded) return item;
        }
      );
      if (existingLeftPinnedList.includes(typeToBeAdded)) {
        existingLeftPinnedList = existingLeftPinnedList.filter(
          (item) => item !== typeToBeAdded
        );
      }
    }
    this.setState({
      columnReorderEntityList: existingColumnReorderEntityList,
      isAllSelected: false,
      leftPinnedColumList: existingLeftPinnedList,
    });
  };

  /**
   * Method to handle the like-search on key stroke.
   * @param {Event} e
   */
  filterColumnReorderList = (e) => {
    var searchKey = String(e.target.value).toLowerCase();
    var existingList = this.props.columns.map((item) => item.name);
    let filtererdColumnReorderList = [];
    if (searchKey.length > 0) {
      filtererdColumnReorderList = existingList.filter((item) => {
        return item.toLowerCase().includes(searchKey);
      });
    } else {
      filtererdColumnReorderList = this.props.columns.map((item) => item.name);
    }
    this.setState({
      columnSelectList: filtererdColumnReorderList,
    });
  };

  createColumnsArrayFromProps = (colsList) => {
    return colsList.map((item) => {
      return {
        id: item,
        text: (
          <div className="column__reorder" key={item}>
            <div className="">
              <FontAwesomeIcon icon={faAlignJustify}></FontAwesomeIcon>
            </div>
            <div className="column__reorder__name">{item}</div>
            <div className="column__wrap">
              <div className="column__checkbox">
                <input
                  type="checkbox"
                  checked={this.state.leftPinnedColumList.includes(item)}
                  disabled={
                    this.state.maxLeftPinnedColumn -
                      this.state.leftPinnedColumList.length <=
                    0
                      ? this.state.leftPinnedColumList.includes(item)
                        ? false
                        : true
                      : false
                  }
                  onChange={() => this.reArrangeLeftPinnedColumn(item)}
                ></input>
              </div>
              <div className="column__txt">Pin Left</div>
            </div>
          </div>
        ),
      };
    });
  };

  /**
   * Method to handle the position of columns Names when left pinned in coloumn selector view.
   * @param {String} columHeaderName
   */
  reArrangeLeftPinnedColumn = (columHeaderName) => {
    var existingLeftPinnedList = this.state.leftPinnedColumList;
    var existingColumnReorderEntityList = this.state.columnReorderEntityList;
    if (!existingLeftPinnedList.includes(columHeaderName)) {
      existingLeftPinnedList.unshift(columHeaderName);
    } else {
      existingLeftPinnedList = existingLeftPinnedList.filter(
        (item) => item !== columHeaderName
      );
    }
    this.setState({
      leftPinnedColumList: existingLeftPinnedList,
    });

    existingLeftPinnedList.map((item) => {
      existingColumnReorderEntityList = existingColumnReorderEntityList.filter(
        (subItem) => subItem !== item
      );
      existingColumnReorderEntityList.unshift(item);
    });
    this.setState({
      columnReorderEntityList: existingColumnReorderEntityList,
    });
  };
  handleReorderList = (reordered) => {
    this.props.handleheaderNameList(reordered);
  };
  render() {
    return (
      <div className="columns--grid" ref={this.setWrapperRef}>
        <div className="column__grid">
          <div className="column__chooser">
            <div className="column__header">
              <div className="">
                <strong>Column Chooser</strong>
              </div>
            </div>
            <div className="column__body">
              <div>
                <input
                  type="text"
                  placeholder="Search column"
                  className="custom__ctrl"
                  onChange={this.filterColumnReorderList}
                ></input>
              </div>
              <div className="column__wrap column__headertxt">
                <div className="column__checkbox">
                  <input
                    type="checkbox"
                    onChange={() => this.selectAllToColumnReOrderList()}
                    checked={
                      this.state.columnReorderEntityList.length ===
                      this.props.columns.length
                    }
                  />
                </div>
                <div className="column__txt">Select all</div>
              </div>
              {this.state.columnSelectList.map((item) => {
                return (
                  <div className="column__wrap" key={item}>
                    <div className="column__checkbox">
                      <input
                        type="checkbox"
                        checked={this.state.columnReorderEntityList.includes(
                          item
                        )}
                        onChange={() => this.addToColumnReorderEntityList(item)}
                      ></input>
                    </div>
                    <div className="column__txt">{item}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="column__settings">
            <div className="column__header">
              <div className="column__headerTxt">
                <strong>Column Setting</strong>
              </div>
              <div className="column__close">
                <FontAwesomeIcon
                  className="icon-close"
                  icon={faTimes}
                  onClick={() => this.props.closeColumnReOrdering()}
                ></FontAwesomeIcon>
              </div>
            </div>
            <div className="column__header">
              <div className="column__headerTxt">
                <strong>
                  &nbsp; &nbsp; Selected Column Count :{" "}
                  {this.state.columnReorderEntityList.length}
                </strong>
              </div>
              <div className="column__headerTxt">
                {this.state.maxLeftPinnedColumn -
                  this.state.leftPinnedColumList.length >
                0 ? (
                  <strong>
                    &nbsp; &nbsp; Left Pinned Column Count Remaining :{" "}
                    {this.state.maxLeftPinnedColumn -
                      this.state.leftPinnedColumList.length}
                  </strong>
                ) : (
                  <strong style={{ color: "red" }}>
                    &nbsp; &nbsp; Maximum Count Of Left Pin Columns REACHED
                  </strong>
                )}
              </div>
            </div>
            <div className="column__body">
              <DndProvider
                backend={TouchBackend}
                options={{ enableMouseEvents: true }}
              >
                <ColumnsList
                  columnsArray={this.createColumnsArrayFromProps(
                    this.state.columnReorderEntityList
                  )}
                  handleReorderList={this.handleReorderList}
                />
              </DndProvider>
            </div>
            <div className="column__footer">
              <div className="column__btns">
                <button
                  className="btns"
                  onClick={() => this.resetColumnReorderList()}
                >
                  Reset
                </button>
                <button
                  className="btns"
                  onClick={() => this.props.closeColumnReOrdering()}
                >
                  Cancel
                </button>
                <button
                  className="btns btns__save"
                  onClick={() =>
                    this.props.updateTableAsPerRowChooser(
                      this.state.columnReorderEntityList,
                      this.state.leftPinnedColumList
                    )
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ColumnReordering;
