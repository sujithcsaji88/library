import React, { useState, useEffect, Component } from 'react';
import ReactDataGrid from 'react-data-grid';
import { Toolbar, Editors, Data, Filters } from 'react-data-grid-addons';
import { range } from 'lodash';
import { FormControl } from 'react-bootstrap';
import { faTimes, faAlignJustify, faCopy, faTrash, faPlus, faFilePdf, faFileExcel, faFileCsv, faSortAmountDown, faSortDown, faColumns, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import update from 'immutability-helper';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';

class ExtDataGrid extends ReactDataGrid {
  componentDidMount() {
    this._mounted = true;
    this.dataGridComponent = document.getElementsByClassName("react-grid-Container")[0];
    window.addEventListener("resize", this.metricsUpdated);

    if (this.props.cellRangeSelection) {
      this.dataGridComponent.addEventListener("mouseup", this.onWindowMouseUp);
    }

    this.metricsUpdated();
  }

  componentWillUnmount() {
    this._mounted = false;
    window.removeEventListener("resize", this.metricsUpdated);
    this.dataGridComponent.removeEventListener("mouseup", this.onWindowMouseUp);
  }

}

const applyFormula = (obj, columnName) => {
  let item = obj[columnName].toString();

  if (item && item.charAt(0) === "=") {
    var operation = item.split("(");
    var value = operation[1].substring(0, operation[1].length - 1).split(/[,:]/);

    switch (operation[0]) {
      case "=SUM":
      case "=ADD":
      case "=sum":
      case "=add":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) + Number(b);
        });
        break;

      case "=MUL":
      case "=mul":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) * Number(b);
        });
        break;

      case "=SUB":
      case "=sub":
      case "=DIFF":
      case "=diff":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) - Number(b);
        });
        break;

      case "=min":
      case "=MIN":
        obj[columnName] = Math.min.apply(Math, value);
        break;

      case "=max":
      case "=MAX":
        obj[columnName] = Math.max.apply(Math, value);
        break;

      default:
        console.log("No Calculation");
    }
  }

  return obj;
};

class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: new Date()
    };
    this.input = null;
    this.getInputNode = this.getInputNode.bind(this);
    this.getValue = this.getValue.bind(this);
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  getInputNode() {
    return this.input;
  }

  getValue() {
    var updated = {};
    let date;
    date = new Date(this.state.value);
    const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
    const [{
      value: month
    },, {
      value: day
    },, {
      value: year
    }] = dateTimeFormat.formatToParts(date);
    updated[this.props.column.key] = `${day}-${month}-${year}`;
    return updated;
  }

  onValueChanged(ev) {
    this.setState({
      value: ev.target.value
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "date",
      ref: ref => {
        this.input = ref;
      },
      value: this.state.value,
      onChange: this.onValueChanged
    }));
  }

}

const SEARCH_NOT_FOUNT_ERROR = "No Records Found!";

const ErrorMessage = props => {
  const [status, setStatus] = useState(props.status);
  useEffect(() => {
    setStatus(props.status);
  }, [props.status]);

  if (status === "invalid") {
    return /*#__PURE__*/React.createElement("div", {
      id: "errorMsg"
    }, /*#__PURE__*/React.createElement("div", {
      className: "alert alert-danger",
      role: "alert"
    }, SEARCH_NOT_FOUNT_ERROR), /*#__PURE__*/React.createElement("div", {
      className: "notification-close"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faTimes,
      onClick: e => {
        props.closeWarningStatus();
        props.clearSearchValue();
      }
    })));
  } else return /*#__PURE__*/React.createElement("div", null);
};

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
  const opacity = isDragging ? 0.1 : 1;
  return /*#__PURE__*/React.createElement("div", {
    ref: node => drag(drop(node)),
    style: { ...style,
      opacity
    }
  }, text);
};

const ColumnsList = props => {
  const [columns, setColumns] = useState([...props.columnsArray]);

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
  React.useEffect(() => {
    setColumns(props.columnsArray);
  }, [props.columnsArray]);
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

class ColumnReordering extends React.Component {
  constructor(props) {
    super(props);

    this.resetColumnReorderList = () => {
      this.setState({
        columnReorderEntityList: [],
        isAllSelected: false
      });
    };

    this.selectAllToColumnReOrderList = () => {
      this.resetColumnReorderList();
      this.setState({
        columnReorderEntityList: this.props.columns.map(item => item.name),
        isAllSelected: true
      });
    };

    this.addToColumnReorderEntityList = typeToBeAdded => {
      var existingColumnReorderEntityList = this.state.columnReorderEntityList;
      var existingLeftPinnedList = this.state.leftPinnedColumList;

      if (!existingColumnReorderEntityList.includes(typeToBeAdded)) {
        existingColumnReorderEntityList.push(typeToBeAdded);
      } else {
        existingColumnReorderEntityList = existingColumnReorderEntityList.filter(item => {
          if (item !== typeToBeAdded) return item;
        });

        if (existingLeftPinnedList.includes(typeToBeAdded)) {
          existingLeftPinnedList = existingLeftPinnedList.filter(item => item !== typeToBeAdded);
        }
      }

      this.setState({
        columnReorderEntityList: existingColumnReorderEntityList,
        isAllSelected: false,
        leftPinnedColumList: existingLeftPinnedList
      });
    };

    this.filterColumnReorderList = e => {
      var searchKey = String(e.target.value).toLowerCase();
      var existingList = this.props.columns.map(item => item.name);
      let filtererdColumnReorderList = [];

      if (searchKey.length > 0) {
        filtererdColumnReorderList = existingList.filter(item => {
          return item.toLowerCase().includes(searchKey);
        });
      } else {
        filtererdColumnReorderList = this.props.columns.map(item => item.name);
      }

      this.setState({
        columnSelectList: filtererdColumnReorderList
      });
    };

    this.createColumnsArrayFromProps = colsList => {
      return colsList.map(item => {
        return {
          id: item,
          text: /*#__PURE__*/React.createElement("div", {
            className: "column__reorder",
            key: item
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
            icon: faAlignJustify
          })), /*#__PURE__*/React.createElement("div", {
            className: "column__reorder__name"
          }, item), /*#__PURE__*/React.createElement("div", {
            className: "column__wrap"
          }, /*#__PURE__*/React.createElement("div", {
            className: "column__checkbox"
          }, /*#__PURE__*/React.createElement("input", {
            type: "checkbox",
            checked: this.state.leftPinnedColumList.includes(item),
            disabled: this.state.maxLeftPinnedColumn - this.state.leftPinnedColumList.length <= 0 ? this.state.leftPinnedColumList.includes(item) ? false : true : false,
            onChange: () => this.reArrangeLeftPinnedColumn(item)
          })), /*#__PURE__*/React.createElement("div", {
            className: "column__txt"
          }, "Pin Left")))
        };
      });
    };

    this.reArrangeLeftPinnedColumn = columHeaderName => {
      var existingLeftPinnedList = this.state.leftPinnedColumList;
      var existingColumnReorderEntityList = this.state.columnReorderEntityList;

      if (!existingLeftPinnedList.includes(columHeaderName)) {
        existingLeftPinnedList.unshift(columHeaderName);
      } else {
        existingLeftPinnedList = existingLeftPinnedList.filter(item => item !== columHeaderName);
      }

      this.setState({
        leftPinnedColumList: existingLeftPinnedList
      });
      existingLeftPinnedList.map(item => {
        existingColumnReorderEntityList = existingColumnReorderEntityList.filter(subItem => subItem !== item);
        existingColumnReorderEntityList.unshift(item);
      });
      this.setState({
        columnReorderEntityList: existingColumnReorderEntityList
      });
    };

    this.state = {
      columnReorderEntityList: this.props.headerKeys,
      columnSelectList: this.props.headerKeys,
      leftPinnedColumList: this.props.existingPinnedHeadersList,
      isAllSelected: false,
      maxLeftPinnedColumn: this.props.maxLeftPinnedColumn
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeColumnReOrdering();
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "columns--grid",
      ref: this.setWrapperRef
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
      className: "custom__ctrl",
      onChange: this.filterColumnReorderList
    })), /*#__PURE__*/React.createElement("div", {
      className: "column__selectAll"
    }, /*#__PURE__*/React.createElement("a", {
      className: "column__selectTxt",
      type: "button",
      onClick: () => this.selectAllToColumnReOrderList()
    }, "Select All")), this.state.columnSelectList.map(item => {
      return /*#__PURE__*/React.createElement("div", {
        className: "column__wrap",
        key: item
      }, /*#__PURE__*/React.createElement("div", {
        className: "column__checkbox"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: this.state.columnReorderEntityList.includes(item),
        onChange: () => this.addToColumnReorderEntityList(item)
      })), /*#__PURE__*/React.createElement("div", {
        className: "column__txt"
      }, item));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "column__settings"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__headerTxt"
    }, /*#__PURE__*/React.createElement("strong", null, "Column Setting")), /*#__PURE__*/React.createElement("div", {
      className: "column__close"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      className: "icon-close",
      icon: faTimes,
      onClick: () => this.props.closeColumnReOrdering()
    }))), /*#__PURE__*/React.createElement("div", {
      className: "column__headerTxt"
    }, /*#__PURE__*/React.createElement("strong", null, "\xA0 \xA0 Selected Column Count : ", this.state.columnReorderEntityList.length)), /*#__PURE__*/React.createElement("div", {
      className: "column__headerTxt"
    }, this.state.maxLeftPinnedColumn - this.state.leftPinnedColumList.length > 0 ? /*#__PURE__*/React.createElement("strong", null, "\xA0 \xA0 Left Pinned Column Count Remaining :", " ", this.state.maxLeftPinnedColumn - this.state.leftPinnedColumList.length) : /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "red"
      }
    }, "\xA0 \xA0 Maximum Count Of Left Pin Columns REACHED")), /*#__PURE__*/React.createElement("div", {
      className: "column__body"
    }, /*#__PURE__*/React.createElement(DndProvider, {
      backend: TouchBackend,
      options: {
        enableMouseEvents: true
      }
    }, /*#__PURE__*/React.createElement(ColumnsList, {
      columnsArray: this.createColumnsArrayFromProps(this.state.columnReorderEntityList)
    }))), /*#__PURE__*/React.createElement("div", {
      className: "column__footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "column__btns"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btns",
      onClick: () => this.resetColumnReorderList()
    }, "Reset"), /*#__PURE__*/React.createElement("button", {
      className: "btns",
      onClick: () => this.props.closeColumnReOrdering()
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btns btns__save",
      onClick: () => this.props.updateTableAsPerRowChooser(this.state.columnReorderEntityList, this.state.leftPinnedColumList)
    }, "Save"))))));
  }

}

const ItemTypes$1 = {
  CARD: "sort"
};

const style$1 = {
  cursor: "move"
};

const Card = ({
  id,
  text,
  moveCard,
  findCard
}) => {
  const originalIndex = findCard(id).index;
  const [{
    isDragging
  }, drag] = useDrag({
    item: {
      type: ItemTypes$1.CARD,
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
        moveCard(droppedId, originalIndex);
      }
    }
  });
  const [, drop] = useDrop({
    accept: ItemTypes$1.CARD,
    canDrop: () => false,

    hover({
      id: draggedId
    }) {
      if (draggedId !== id) {
        const {
          index: overIndex
        } = findCard(id);
        moveCard(draggedId, overIndex);
      }
    }

  });
  const opacity = isDragging ? 0.1 : 1;
  return /*#__PURE__*/React.createElement("div", {
    ref: node => drag(drop(node)),
    style: { ...style$1,
      opacity
    }
  }, text);
};

const SortingList = props => {
  const [cards, setCards] = useState([...props.sortsArray]);

  const moveCard = (id, atIndex) => {
    const {
      card,
      index
    } = findCard(id);
    setCards(update(cards, {
      $splice: [[index, 1], [atIndex, 0, card]]
    }));
  };

  const findCard = id => {
    const card = cards.filter(c => `${c.id}` === id)[0];
    return {
      card,
      index: cards.indexOf(card)
    };
  };

  const [, drop] = useDrop({
    accept: ItemTypes$1.CARD
  });
  useEffect(() => {
    setCards(props.sortsArray);
  }, [props.sortsArray]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: drop,
    style: {
      display: "flex",
      flexWrap: "wrap"
    }
  }, cards.map(card => /*#__PURE__*/React.createElement(Card, {
    key: card.id,
    id: `${card.id}`,
    text: card.text,
    moveCard: moveCard,
    findCard: findCard
  }))));
};

class App extends React.Component {
  constructor() {
    super();

    this.add = () => {
      let rowList = [...this.state.rowList];
      rowList.push(true);
      this.setState({
        rowList
      });
    };

    this.copy = i => {
    };

    this.clearAll = () => {
      this.setState({
        rowList: []
      });
    };

    this.remove = i => {
      let rowList = [...this.state.rowList];
      rowList.splice(i, 1);
      this.setState({
        rowList
      });
    };

    this.createColumnsArrayFromProps = rowList => {
      return rowList.map((i, index) => {
        return {
          id: index,
          text: /*#__PURE__*/React.createElement("div", {
            className: "sort__bodyContent",
            key: i
          }, /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "\xA0")), /*#__PURE__*/React.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
            icon: faAlignJustify
          }))), /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "Sort by")), /*#__PURE__*/React.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React.createElement("select", {
            className: "custom__ctrl"
          }, this.props.columnFieldValue.map((item, index) => /*#__PURE__*/React.createElement("option", {
            key: index
          }, item))))), /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "Sort on")), /*#__PURE__*/React.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React.createElement("select", {
            className: "custom__ctrl"
          }, /*#__PURE__*/React.createElement("option", null, "Value")))), /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "Order")), /*#__PURE__*/React.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React.createElement("select", {
            className: "custom__ctrl"
          }, /*#__PURE__*/React.createElement("option", null, "Ascending"), /*#__PURE__*/React.createElement("option", null, "Descending")))), /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "\xA0")), /*#__PURE__*/React.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
            icon: faCopy,
            title: "Copy",
            onClick: () => this.copy(i)
          }))), /*#__PURE__*/React.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React.createElement("div", {
            className: ""
          }, /*#__PURE__*/React.createElement("div", null, "\xA0")), /*#__PURE__*/React.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
            icon: faTrash,
            title: "Delete",
            onClick: () => this.remove(index)
          }))))
        };
      });
    };

    this.state = {
      rowList: [true]
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeSorting();
    }
  }

  render() {
    console.log(this.state.rowList);
    return /*#__PURE__*/React.createElement("div", {
      className: "sorts--grid",
      ref: this.setWrapperRef
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__settings"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__headerTxt"
    }, /*#__PURE__*/React.createElement("strong", null, "Sort ")), /*#__PURE__*/React.createElement("div", {
      className: "sort__close"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      className: "icon-close",
      icon: faTimes,
      onClick: () => this.props.closeSorting()
    }))), /*#__PURE__*/React.createElement("div", {
      className: "sort__body"
    }, /*#__PURE__*/React.createElement(DndProvider, {
      backend: TouchBackend,
      options: {
        enableMouseEvents: true
      }
    }, /*#__PURE__*/React.createElement(SortingList, {
      sortsArray: this.createColumnsArrayFromProps(this.state.rowList)
    })), /*#__PURE__*/React.createElement("div", {
      className: "sort__new"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__section"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faPlus,
      className: "sort__icon"
    }), /*#__PURE__*/React.createElement("div", {
      className: "sort__txt",
      onClick: () => this.add()
    }, "New Sort")))), /*#__PURE__*/React.createElement("div", {
      className: "sort__footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sort__btns"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btns",
      onClick: this.clearAll
    }, "Clear All"), /*#__PURE__*/React.createElement("button", {
      className: "btns btns__save"
    }, "Ok"))))));
  }

}

let downLaodFileType = [];

class ExportData extends React.Component {
  constructor(props) {
    super(props);

    this.resetColumnExportList = () => {
      this.setState({
        columnEntityList: [],
        isAllSelected: false
      });
    };

    this.selectAllToColumnList = () => {
      this.resetColumnExportList();
      this.setState({
        columnEntityList: !this.state.isAllSelected ? this.props.columnsList : [],
        isAllSelected: !this.state.isAllSelected
      });
    };

    this.addToColumnEntityList = typeToBeAdded => {
      var existingColumnEntityList = this.state.columnEntityList;

      if (!existingColumnEntityList.includes(typeToBeAdded)) {
        existingColumnEntityList.push(typeToBeAdded);
      } else {
        existingColumnEntityList = existingColumnEntityList.filter(item => {
          return item !== typeToBeAdded;
        });
      }

      this.setState({
        columnEntityList: existingColumnEntityList,
        isAllSelected: false
      });
    };

    this.selectDownLoadType = event => {
      if (event.target.checked && !this.state.downLaodFileType.includes(event.target.value)) {
        downLaodFileType.push(event.target.value);
        this.setState({
          downLaodFileType
        });
      } else {
        downLaodFileType.map(function (value, index) {
          if (value === event.target.value) {
            downLaodFileType = downLaodFileType.splice(index, value);
          }
        });
        this.setState({
          downLaodFileType
        });
      }
    };

    this.exportRowData = () => {
      const columnVlaueList = this.state.columnEntityList;

      if (columnVlaueList.length > 0 && this.state.downLaodFileType.length > 0) {
        this.props.rows.forEach(row => {
          const keys = Object.getOwnPropertyNames(row);
          var filteredColumnVal = {};
          keys.forEach(function (key) {
            columnVlaueList.forEach(columnName => {
              if (columnName.key === key) filteredColumnVal[key] = row[key];
            });
          });
          this.state.filteredRow.push(filteredColumnVal);
        });
        this.state.downLaodFileType.map(item => {
          if (item === "pdf") this.downloadPDF();else if (item === "excel") this.downloadXLSFile();else this.downloadCSVFile();
        });
      }
    };

    this.downloadPDF = () => {
      const unit = "pt";
      const size = "A4";
      const orientation = "landscape";
      const marginLeft = 300;
      const doc = new jsPDF(orientation, unit, size);
      doc.setFontSize(15);
      const title = "iCargo Report";
      const headers = [this.state.columnEntityList.map(column => {
        return column.name;
      })];
      var dataValues = [];
      this.props.rows.forEach(row => {
        const keys = Object.keys(row);
        var filteredColumnVal = [];
        this.state.columnEntityList.forEach(columnName => {
          keys.forEach(key => {
            if (columnName.key === key) filteredColumnVal.push(row[key]);
          });
        });
        dataValues.push(filteredColumnVal);
      });
      let content = {
        startY: 50,
        head: headers,
        body: dataValues
      };
      doc.text(title, marginLeft, 40);
      doc.autoTable(content);
      doc.save("report.pdf");
    };

    this.downloadCSVFile = () => {
      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".csv";
      const fileName = "CSVDownload";
      const ws = utils.json_to_sheet(this.state.filteredRow);
      const wb = {
        Sheets: {
          data: ws
        },
        SheetNames: ["data"]
      };
      const excelBuffer = write(wb, {
        bookType: "csv",
        type: "array"
      });
      const data = new Blob([excelBuffer], {
        type: fileType
      });
      saveAs(data, fileName + fileExtension);
    };

    this.downloadXLSFile = () => {
      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";
      const fileName = "XLSXDownload";
      const ws = utils.json_to_sheet(this.state.filteredRow);
      const wb = {
        Sheets: {
          data: ws
        },
        SheetNames: ["data"]
      };
      const excelBuffer = write(wb, {
        bookType: "xlsx",
        type: "array"
      });
      const data = new Blob([excelBuffer], {
        type: fileType
      });
      saveAs(data, fileName + fileExtension);
    };

    this.columnSearchLogic = e => {
      const searchKey = String(e.target.value).toLowerCase();
      let filteredRows = this.props.columnsList.filter(item => {
        return item.name.toLowerCase().includes(searchKey);
      });

      if (!filteredRows.length) {
        this.setState({
          columnValueList: this.props.columnsList
        });
      } else {
        this.setState({
          columnValueList: filteredRows
        });
      }
    };

    this.exportValidation = () => {
      let columnLength = this.state.columnEntityList.length;
      let fileLength = this.state.downLaodFileType.length;

      if (columnLength > 0 && fileLength > 0) {
        this.exportRowData();
        this.setState({
          clickTag: "none"
        });
      } else if (columnLength === 0) {
        this.setState({
          warning: "Column"
        });
        this.setState({
          clickTag: ""
        });
      } else if (fileLength === 0) {
        this.setState({
          warning: "File Type"
        });
        this.setState({
          clickTag: ""
        });
      }

      if (columnLength === 0 && fileLength === 0) {
        this.setState({
          warning: "File Type & Column"
        });
        this.setState({
          clickTag: ""
        });
      }
    };

    this.state = {
      columnValueList: this.props.columnsList,
      columnEntityList: [],
      isAllSelected: false,
      downLaodFileType: [],
      filteredRow: [],
      warning: "",
      clickTag: "none"
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

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "exports--grid",
      ref: this.setWrapperRef
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__chooser"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: ""
    }, /*#__PURE__*/React.createElement("strong", null, "Export Data"))), /*#__PURE__*/React.createElement("div", {
      className: "export__body"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Search export",
      className: "custom__ctrl",
      onChange: this.columnSearchLogic
    })), /*#__PURE__*/React.createElement("div", {
      className: "export__selectAll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__selectTxt",
      onClick: () => this.selectAllToColumnList()
    }, "Select All")), this.state.columnValueList.length > 0 ? this.state.columnValueList.map((column, index) => {
      return /*#__PURE__*/React.createElement("div", {
        className: "export__wrap",
        key: column.key
      }, /*#__PURE__*/React.createElement("div", {
        className: "export__checkbox"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: this.state.columnEntityList.includes(column),
        onChange: () => this.addToColumnEntityList(column)
      })), /*#__PURE__*/React.createElement("div", {
        className: "export__txt"
      }, column.name));
    }) : "")), /*#__PURE__*/React.createElement("div", {
      className: "export__settings"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__headerTxt"
    }), /*#__PURE__*/React.createElement("div", {
      className: "export__close"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faTimes,
      className: "icon-close",
      onClick: this.props.closeExport
    }))), /*#__PURE__*/React.createElement("div", {
      className: "export__as"
    }, "Export as"), /*#__PURE__*/React.createElement("div", {
      className: "export__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React.createElement("div", {
      className: ""
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      name: "pdf",
      value: "pdf",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faFilePdf,
      className: "temp"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React.createElement("div", {
      className: ""
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      name: "excel",
      value: "excel",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faFileExcel,
      className: "temp"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React.createElement("div", {
      className: ""
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      name: "csv",
      value: "csv",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faFileCsv,
      className: "temp"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "exportWarning"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: this.state.clickTag
      },
      className: "alert alert-danger"
    }, "You haven't selected ", /*#__PURE__*/React.createElement("strong", null, this.state.warning)))), /*#__PURE__*/React.createElement("div", {
      className: "export__footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export__btns"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btns",
      onClick: () => this.props.closeExport()
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btns btns__save",
      onClick: e => {
        this.exportValidation();
      }
    }, "Export"))))));
  }

}

const {
  DraggableHeader: {
    DraggableContainer
  }
} = require("react-data-grid-addons");

const {
  DropDownEditor
} = Editors;

const defaultParsePaste = str => str.split(/\r\n|\n|\r/).map(row => row.split("\t"));

const selectors = Data.Selectors;
const {
  AutoCompleteFilter,
  NumericFilter
} = Filters;

class spreadsheet extends Component {
  constructor(props) {
    super(props);

    this.updateRows = (startIdx, newRows) => {
      this.setState(state => {
        const rows = state.rows.slice();

        for (let i = 0; i < newRows.length; i++) {
          if (startIdx + i < rows.length) {
            rows[startIdx + i] = { ...rows[startIdx + i],
              ...newRows[i]
            };
          }
        }

        return {
          rows
        };
      });
    };

    this.rowGetter = i => {
      const {
        rows
      } = this.state;
      return rows[i];
    };

    this.handleCopy = e => {
      e.preventDefault();
      const {
        topLeft,
        botRight
      } = this.state;
      const text = range(topLeft.rowIdx, botRight.rowIdx + 1).map(rowIdx => this.state.columns.slice(topLeft.colIdx - 1, botRight.colIdx).map(col => this.rowGetter(rowIdx)[col.key]).join("\t")).join("\n");
      e.clipboardData.setData("text/plain", text);
    };

    this.handlePaste = e => {
      e.preventDefault();
      const {
        topLeft
      } = this.state;
      const newRows = [];
      const pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));
      pasteData.forEach(row => {
        const rowData = {};
        this.state.columns.slice(topLeft.colIdx - 1, topLeft.colIdx - 1 + row.length).forEach((col, j) => {
          rowData[col.key] = row[j];
        });
        newRows.push(rowData);
      });
      this.updateRows(topLeft.rowIdx, newRows);
    };

    this.setSelection = args => {
      this.setState({
        topLeft: {
          rowIdx: args.topLeft.rowIdx,
          colIdx: args.topLeft.idx
        },
        botRight: {
          rowIdx: args.bottomRight.rowIdx,
          colIdx: args.bottomRight.idx
        }
      });
    };

    this.handleWarningStatus = () => {
      this.setState({
        warningStatus: "invalid"
      });
    };

    this.closeWarningStatus = () => {
      this.setState({
        warningStatus: ""
      });
    };

    this.onGridRowsUpdated = ({
      fromRow,
      toRow,
      updated,
      action
    }) => {
      let columnName = "";
      const filter = this.formulaAppliedCols.filter(item => {
        if (updated[item.key] !== null && updated[item.key] !== undefined) {
          columnName = item.key;
          return true;
        } else return false;
      });

      if (filter.length > 0) {
        updated = applyFormula(updated, columnName);
      }

      if (action !== "COPY_PASTE") {
        this.setState(state => {
          const rows = state.rows.slice();

          for (let i = fromRow; i <= toRow; i++) {
            rows[i] = { ...rows[i],
              ...updated
            };
          }

          return {
            rows
          };
        });
        this.setState(state => {
          const filteringRows = state.filteringRows.slice();

          for (let i = fromRow; i <= toRow; i++) {
            filteringRows[i] = { ...filteringRows[i],
              ...updated
            };
          }

          return {
            filteringRows
          };
        });
        this.setState(state => {
          const tempRows = state.tempRows.slice();

          for (let i = fromRow; i <= toRow; i++) {
            tempRows[i] = { ...tempRows[i],
              ...updated
            };
          }

          return {
            tempRows
          };
        });
      }

      if (this.props.updateCellData) {
        this.props.updateCellData(this.state.tempRows[fromRow], this.state.tempRows[toRow], updated, action);
      }
    };

    this.onRowsSelected = rows => {
      this.setState({
        selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))
      });

      if (this.props.selectBulkData) {
        this.props.selectBulkData(rows);
      }
    };

    this.onRowsDeselected = rows => {
      let rowIndexes = rows.map(r => r.rowIdx);
      this.setState({
        selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1)
      });
    };

    this.handleFilterChange = value => {
      let junk = this.state.junk;

      if (!(value.filterTerm == null) && !(value.filterTerm.length <= 0)) {
        junk[value.column.key] = value;
      } else {
        delete junk[value.column.key];
      }

      this.setState({
        junk
      });
      const data = this.getrows(this.state.filteringRows, this.state.junk);
      this.setState({
        rows: data,
        tempRows: data,
        count: data.length
      });

      if (this.state.count === 0) {
        this.handleWarningStatus();
      } else {
        this.closeWarningStatus();
      }
    };

    this.getrows = (rows, filters) => {
      if (Object.keys(filters).length <= 0) {
        filters = {};
      }

      selectors.getRows({
        rows: [],
        filters: {}
      });
      return selectors.getRows({
        rows: rows,
        filters: filters
      });
    };

    this.sortRows = (data, sortColumn, sortDirection) => {
      const comparer = (a, b) => {
        if (sortDirection === "ASC") {
          return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else if (sortDirection === "DESC") {
          return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
      };

      this.setState({
        rows: [...data].sort(comparer)
      });
      return sortDirection === "NONE" ? data : this.state.rows;
    };

    this.onHeaderDrop = (source, target) => {
      const stateCopy = Object.assign({}, this.state);
      const columnSourceIndex = this.state.columns.findIndex(i => i.key === source);
      const columnTargetIndex = this.state.columns.findIndex(i => i.key === target);
      stateCopy.columns.splice(columnTargetIndex, 0, stateCopy.columns.splice(columnSourceIndex, 1)[0]);
      const emptyColumns = Object.assign({}, this.state, {
        columns: []
      });
      this.setState(emptyColumns);
      const reorderedColumns = Object.assign({}, this.state, {
        columns: stateCopy.columns
      });
      this.setState(reorderedColumns);
    };

    this.updateTableAsPerRowChooser = (inComingColumnsHeaderList, pinnedColumnsList) => {
      var existingColumnsHeaderList = this.props.columns;
      existingColumnsHeaderList = existingColumnsHeaderList.filter(item => {
        return inComingColumnsHeaderList.includes(item.name);
      });
      var rePositionedArray = existingColumnsHeaderList;
      var singleHeaderOneList;

      if (pinnedColumnsList.length > 0) {
        pinnedColumnsList.slice(0).reverse().map((item, index) => {
          singleHeaderOneList = existingColumnsHeaderList.filter(subItem => item === subItem.name);
          rePositionedArray = this.array_move(existingColumnsHeaderList, existingColumnsHeaderList.indexOf(singleHeaderOneList[0]), index);
        });
      }

      existingColumnsHeaderList = rePositionedArray;
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
        columns: existingColumnsHeaderList
      });
      this.closeColumnReOrdering();
    };

    this.array_move = (arr, old_index, new_index) => {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;

        while (k--) {
          arr.push(undefined);
        }
      }

      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    };

    this.columnReorderingPannel = () => {
      var headerNameList = [];
      var existingPinnedHeadersList = [];
      this.state.columns.filter(item => item.frozen !== undefined && item.frozen === true).map(item => existingPinnedHeadersList.push(item.name));
      this.state.columns.map(item => headerNameList.push(item.name));
      this.setState({
        columnReorderingComponent: /*#__PURE__*/React.createElement(ColumnReordering, Object.assign({
          maxLeftPinnedColumn: this.props.maxLeftPinnedColumn,
          updateTableAsPerRowChooser: this.updateTableAsPerRowChooser,
          headerKeys: headerNameList,
          closeColumnReOrdering: this.closeColumnReOrdering,
          existingPinnedHeadersList: existingPinnedHeadersList
        }, this.props))
      });
    };

    this.closeColumnReOrdering = () => {
      this.setState({
        columnReorderingComponent: null
      });
    };

    this.handleSearchValue = value => {
      this.setState({
        searchValue: value
      });
    };

    this.clearSearchValue = () => {
      this.setState({
        searchValue: ""
      });
    };

    this.sortingPanel = () => {
      let columnField = [];
      this.state.columns.map(item => columnField.push(item.name));
      this.setState({
        sortingPanelComponent: /*#__PURE__*/React.createElement(App, {
          columnFieldValue: columnField,
          closeSorting: this.closeSorting
        })
      });
    };

    this.closeSorting = () => {
      this.setState({
        sortingPanelComponent: null
      });
    };

    this.exportColumnData = () => {
      this.setState({
        exportComponent: /*#__PURE__*/React.createElement(ExportData, {
          rows: this.state.rows,
          columnsList: this.state.columns,
          closeExport: this.closeExport
        })
      });
    };

    this.closeExport = () => {
      this.setState({
        exportComponent: null
      });
    };

    const airportCodes = [];
    this.props.airportCodes.forEach(item => {
      airportCodes.push({
        id: item,
        value: item
      });
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
      count: this.props.count,
      columns: this.props.columns.map(item => {
        if (item.editor === "DatePicker") {
          item.editor = DatePicker;
        } else if (item.editor === "DropDown") {
          item.editor = /*#__PURE__*/React.createElement(DropDownEditor, {
            options: airportCodes
          });
        } else if (item.editor === "Text") {
          item.editor = "text";
        } else {
          item.editor = null;
        }

        if (item.type === "numeric") {
          item.filterRenderer = NumericFilter;
        } else {
          item.filterRenderer = AutoCompleteFilter;
        }

        return item;
      })
    };
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    this.handleSearchValue = this.handleSearchValue.bind(this);
    this.clearSearchValue = this.clearSearchValue.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.formulaAppliedCols = this.props.columns.filter(item => {
      return item.formulaApplicable;
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      rows: props.rows
    });
    this.setState({
      status: props.status
    });
    this.setState({
      textValue: props.textValue
    });
    this.setState({
      count: props.count
    });
    this.setState({
      warningStatus: props.status
    });
  }

  getValidFilterValues(rows, columnId) {
    return rows.map(r => r[columnId]).filter((item, i, a) => {
      return i === a.indexOf(item);
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "parentDiv"
    }, /*#__PURE__*/React.createElement("div", {
      className: "totalCount"
    }, "Showing ", /*#__PURE__*/React.createElement("strong", null, " ", this.state.count, " "), " records"), /*#__PURE__*/React.createElement("div", {
      className: "globalSearch"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-search"
    }), /*#__PURE__*/React.createElement(FormControl, {
      className: "globalSeachInput",
      type: "text",
      placeholder: "Search",
      onChange: e => {
        this.handleSearchValue(e.target.value);
        this.props.globalSearchLogic(e, this.state.tempRows);
      },
      value: this.state.searchValue
    })), /*#__PURE__*/React.createElement("div", {
      className: "filterIcons",
      onClick: this.sortingPanel
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      title: "Group Sort",
      icon: faSortAmountDown
    }), /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faSortDown,
      className: "filterArrow"
    })), this.state.sortingPanelComponent, /*#__PURE__*/React.createElement("div", {
      className: "filterIcons",
      onClick: this.columnReorderingPannel
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      title: "Column Chooser",
      icon: faColumns
    }), /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faSortDown,
      className: "filterArrow"
    })), this.state.columnReorderingComponent, /*#__PURE__*/React.createElement("div", {
      className: "filterIcons"
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      title: "Export",
      icon: faShareAlt,
      onClick: this.exportColumnData
    })), this.state.exportComponent), /*#__PURE__*/React.createElement(ErrorMessage, {
      className: "errorDiv",
      status: this.state.warningStatus,
      closeWarningStatus: this.props.closeWarningStatus,
      clearSearchValue: this.clearSearchValue
    }), /*#__PURE__*/React.createElement(DraggableContainer, {
      className: "gridDiv",
      onHeaderDrop: this.onHeaderDrop
    }, /*#__PURE__*/React.createElement(ExtDataGrid, {
      toolbar: /*#__PURE__*/React.createElement(Toolbar, {
        enableFilter: true
      }),
      getValidFilterValues: columnKey => this.getValidFilterValues(this.state.filteringRows, columnKey),
      minHeight: this.state.height,
      columns: this.state.columns,
      rowGetter: i => this.state.rows[i],
      rowsCount: this.state.rows.length,
      onGridRowsUpdated: this.onGridRowsUpdated,
      enableCellSelect: true,
      onClearFilters: () => {
        this.setState({
          junk: {}
        });
      },
      onColumnResize: (idx, width) => console.log(`Column ${idx} has been resized to ${width}`),
      onAddFilter: filter => this.handleFilterChange(filter),
      rowSelection: {
        showCheckbox: true,
        enableShiftSelect: true,
        onRowsSelected: this.onRowsSelected,
        onRowsDeselected: this.onRowsDeselected,
        selectBy: {
          indexes: this.state.selectedIndexes
        }
      },
      onGridSort: (sortColumn, sortDirection) => this.sortRows(this.state.rows, sortColumn, sortDirection)
    })));
  }

}

export default spreadsheet;
//# sourceMappingURL=index.modern.js.map
