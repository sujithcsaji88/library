function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var ReactDataGrid = _interopDefault(require('react-data-grid'));
var reactDataGridAddons = require('react-data-grid-addons');
var lodash = require('lodash');
var reactBootstrap = require('react-bootstrap');
var freeSolidSvgIcons = require('@fortawesome/free-solid-svg-icons');
var reactFontawesome = require('@fortawesome/react-fontawesome');
var reactDnd = require('react-dnd');
var reactDndTouchBackend = require('react-dnd-touch-backend');
var update = _interopDefault(require('immutability-helper'));
var jsPDF = _interopDefault(require('jspdf'));
require('jspdf-autotable');
var FileSaver = require('file-saver');
var XLSX = require('xlsx');

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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var ExtDataGrid = /*#__PURE__*/function (_ReactDataGrid) {
  _inheritsLoose(ExtDataGrid, _ReactDataGrid);

  function ExtDataGrid() {
    return _ReactDataGrid.apply(this, arguments) || this;
  }

  var _proto = ExtDataGrid.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this._mounted = true;
    this.dataGridComponent = document.getElementsByClassName("react-grid-Container")[0];
    window.addEventListener("resize", this.metricsUpdated);

    if (this.props.cellRangeSelection) {
      this.dataGridComponent.addEventListener("mouseup", this.onWindowMouseUp);
    }

    this.metricsUpdated();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._mounted = false;
    window.removeEventListener("resize", this.metricsUpdated);
    this.dataGridComponent.removeEventListener("mouseup", this.onWindowMouseUp);
  };

  return ExtDataGrid;
}(ReactDataGrid);

var applyFormula = function applyFormula(obj, columnName) {
  var item = obj[columnName].toString();

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

var DatePicker = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DatePicker, _React$Component);

  function DatePicker(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.state = {
      value: new Date()
    };
    _this.input = null;
    _this.getInputNode = _this.getInputNode.bind(_assertThisInitialized(_this));
    _this.getValue = _this.getValue.bind(_assertThisInitialized(_this));
    _this.onValueChanged = _this.onValueChanged.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = DatePicker.prototype;

  _proto.getInputNode = function getInputNode() {
    return this.input;
  };

  _proto.getValue = function getValue() {
    var updated = {};
    var date;
    date = new Date(this.state.value);
    var dateTimeFormat = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });

    var _dateTimeFormat$forma = dateTimeFormat.formatToParts(date),
        month = _dateTimeFormat$forma[0].value,
        day = _dateTimeFormat$forma[2].value,
        year = _dateTimeFormat$forma[4].value;

    updated[this.props.column.key] = day + "-" + month + "-" + year;
    return updated;
  };

  _proto.onValueChanged = function onValueChanged(ev) {
    this.setState({
      value: ev.target.value
    });
  };

  _proto.render = function render() {
    var _this2 = this;

    return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("input", {
      type: "date",
      ref: function ref(_ref) {
        _this2.input = _ref;
      },
      value: this.state.value,
      onChange: this.onValueChanged
    }));
  };

  return DatePicker;
}(React__default.Component);

var SEARCH_NOT_FOUNT_ERROR = "No Records Found!";

var ErrorMessage = function ErrorMessage(props) {
  var _useState = React.useState(props.status),
      status = _useState[0],
      setStatus = _useState[1];

  React.useEffect(function () {
    setStatus(props.status);
  }, [props.status]);

  if (status === "invalid") {
    return /*#__PURE__*/React__default.createElement("div", {
      id: "errorMsg"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "alert alert-danger",
      role: "alert"
    }, SEARCH_NOT_FOUNT_ERROR), /*#__PURE__*/React__default.createElement("div", {
      className: "notification-close"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faTimes,
      onClick: function onClick(e) {
        props.closeWarningStatus();
        props.clearSearchValue();
      }
    })));
  } else return /*#__PURE__*/React__default.createElement("div", null);
};

var ItemTypes = {
  COLUMN: "column"
};

var style = {
  cursor: "move"
};

var ColumnItem = function ColumnItem(_ref) {
  var id = _ref.id,
      text = _ref.text,
      moveColumn = _ref.moveColumn,
      findColumn = _ref.findColumn;
  var originalIndex = findColumn(id).index;

  var _useDrag = reactDnd.useDrag({
    item: {
      type: ItemTypes.COLUMN,
      id: id,
      originalIndex: originalIndex
    },
    collect: function collect(monitor) {
      return {
        isDragging: monitor.isDragging()
      };
    },
    end: function end(dropResult, monitor) {
      var _monitor$getItem = monitor.getItem(),
          droppedId = _monitor$getItem.id,
          originalIndex = _monitor$getItem.originalIndex;

      var didDrop = monitor.didDrop();

      if (!didDrop) {
        moveColumn(droppedId, originalIndex);
      }
    }
  }),
      isDragging = _useDrag[0].isDragging,
      drag = _useDrag[1];

  var _useDrop = reactDnd.useDrop({
    accept: ItemTypes.COLUMN,
    canDrop: function canDrop() {
      return false;
    },
    hover: function hover(_ref2) {
      var draggedId = _ref2.id;

      if (draggedId !== id) {
        var _findColumn = findColumn(id),
            overIndex = _findColumn.index;

        moveColumn(draggedId, overIndex);
      }
    }
  }),
      drop = _useDrop[1];

  var opacity = isDragging ? 0.1 : 1;
  return /*#__PURE__*/React__default.createElement("div", {
    ref: function ref(node) {
      return drag(drop(node));
    },
    style: _extends({}, style, {
      opacity: opacity
    })
  }, text);
};

var ColumnsList = function ColumnsList(props) {
  var _useState = React.useState([].concat(props.columnsArray)),
      columns = _useState[0],
      setColumns = _useState[1];

  var moveColumn = function moveColumn(id, atIndex) {
    var _findColumn = findColumn(id),
        column = _findColumn.column,
        index = _findColumn.index;

    setColumns(update(columns, {
      $splice: [[index, 1], [atIndex, 0, column]]
    }));
  };

  var findColumn = function findColumn(id) {
    var column = columns.filter(function (c) {
      return "" + c.id === id;
    })[0];
    return {
      column: column,
      index: columns.indexOf(column)
    };
  };

  var _useDrop = reactDnd.useDrop({
    accept: ItemTypes.COLUMN
  }),
      drop = _useDrop[1];

  React__default.useEffect(function () {
    setColumns(props.columnsArray);
  }, [props.columnsArray]);
  return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    ref: drop,
    style: {
      display: "flex",
      flexWrap: "wrap"
    }
  }, columns.map(function (column) {
    return /*#__PURE__*/React__default.createElement(ColumnItem, {
      key: column.id,
      id: "" + column.id,
      text: column.text,
      moveColumn: moveColumn,
      findColumn: findColumn
    });
  })));
};

var ColumnReordering = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(ColumnReordering, _React$Component);

  function ColumnReordering(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;

    _this.resetColumnReorderList = function () {
      _this.setState({
        columnReorderEntityList: [],
        isAllSelected: false
      });
    };

    _this.selectAllToColumnReOrderList = function () {
      _this.resetColumnReorderList();

      _this.setState({
        columnReorderEntityList: _this.props.columns.map(function (item) {
          return item.name;
        }),
        isAllSelected: true
      });
    };

    _this.addToColumnReorderEntityList = function (typeToBeAdded) {
      var existingColumnReorderEntityList = _this.state.columnReorderEntityList;
      var existingLeftPinnedList = _this.state.leftPinnedColumList;

      if (!existingColumnReorderEntityList.includes(typeToBeAdded)) {
        existingColumnReorderEntityList.push(typeToBeAdded);
      } else {
        existingColumnReorderEntityList = existingColumnReorderEntityList.filter(function (item) {
          if (item !== typeToBeAdded) return item;
        });

        if (existingLeftPinnedList.includes(typeToBeAdded)) {
          existingLeftPinnedList = existingLeftPinnedList.filter(function (item) {
            return item !== typeToBeAdded;
          });
        }
      }

      _this.setState({
        columnReorderEntityList: existingColumnReorderEntityList,
        isAllSelected: false,
        leftPinnedColumList: existingLeftPinnedList
      });
    };

    _this.filterColumnReorderList = function (e) {
      var searchKey = String(e.target.value).toLowerCase();

      var existingList = _this.props.columns.map(function (item) {
        return item.name;
      });

      var filtererdColumnReorderList = [];

      if (searchKey.length > 0) {
        filtererdColumnReorderList = existingList.filter(function (item) {
          return item.toLowerCase().includes(searchKey);
        });
      } else {
        filtererdColumnReorderList = _this.props.columns.map(function (item) {
          return item.name;
        });
      }

      _this.setState({
        columnSelectList: filtererdColumnReorderList
      });
    };

    _this.createColumnsArrayFromProps = function (colsList) {
      return colsList.map(function (item) {
        return {
          id: item,
          text: /*#__PURE__*/React__default.createElement("div", {
            className: "column__reorder",
            key: item
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
            icon: freeSolidSvgIcons.faAlignJustify
          })), /*#__PURE__*/React__default.createElement("div", {
            className: "column__reorder__name"
          }, item), /*#__PURE__*/React__default.createElement("div", {
            className: "column__wrap"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: "column__checkbox"
          }, /*#__PURE__*/React__default.createElement("input", {
            type: "checkbox",
            checked: _this.state.leftPinnedColumList.includes(item),
            disabled: _this.state.maxLeftPinnedColumn - _this.state.leftPinnedColumList.length <= 0 ? _this.state.leftPinnedColumList.includes(item) ? false : true : false,
            onChange: function onChange() {
              return _this.reArrangeLeftPinnedColumn(item);
            }
          })), /*#__PURE__*/React__default.createElement("div", {
            className: "column__txt"
          }, "Pin Left")))
        };
      });
    };

    _this.reArrangeLeftPinnedColumn = function (columHeaderName) {
      var existingLeftPinnedList = _this.state.leftPinnedColumList;
      var existingColumnReorderEntityList = _this.state.columnReorderEntityList;

      if (!existingLeftPinnedList.includes(columHeaderName)) {
        existingLeftPinnedList.unshift(columHeaderName);
      } else {
        existingLeftPinnedList = existingLeftPinnedList.filter(function (item) {
          return item !== columHeaderName;
        });
      }

      _this.setState({
        leftPinnedColumList: existingLeftPinnedList
      });

      existingLeftPinnedList.map(function (item) {
        existingColumnReorderEntityList = existingColumnReorderEntityList.filter(function (subItem) {
          return subItem !== item;
        });
        existingColumnReorderEntityList.unshift(item);
      });

      _this.setState({
        columnReorderEntityList: existingColumnReorderEntityList
      });
    };

    _this.state = {
      columnReorderEntityList: _this.props.headerKeys,
      columnSelectList: _this.props.headerKeys,
      leftPinnedColumList: _this.props.existingPinnedHeadersList,
      isAllSelected: false,
      maxLeftPinnedColumn: _this.props.maxLeftPinnedColumn
    };
    _this.setWrapperRef = _this.setWrapperRef.bind(_assertThisInitialized(_this));
    _this.handleClickOutside = _this.handleClickOutside.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ColumnReordering.prototype;

  _proto.componentDidMount = function componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  };

  _proto.setWrapperRef = function setWrapperRef(node) {
    this.wrapperRef = node;
  };

  _proto.handleClickOutside = function handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeColumnReOrdering();
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    return /*#__PURE__*/React__default.createElement("div", {
      className: "columns--grid",
      ref: this.setWrapperRef
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__grid"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__chooser"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__header"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: ""
    }, /*#__PURE__*/React__default.createElement("strong", null, "Column Chooser"))), /*#__PURE__*/React__default.createElement("div", {
      className: "column__body"
    }, /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("input", {
      type: "text",
      placeholder: "Search column",
      className: "custom__ctrl",
      onChange: this.filterColumnReorderList
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "column__selectAll"
    }, /*#__PURE__*/React__default.createElement("a", {
      className: "column__selectTxt",
      type: "button",
      onClick: function onClick() {
        return _this2.selectAllToColumnReOrderList();
      }
    }, "Select All")), this.state.columnSelectList.map(function (item) {
      return /*#__PURE__*/React__default.createElement("div", {
        className: "column__wrap",
        key: item
      }, /*#__PURE__*/React__default.createElement("div", {
        className: "column__checkbox"
      }, /*#__PURE__*/React__default.createElement("input", {
        type: "checkbox",
        checked: _this2.state.columnReorderEntityList.includes(item),
        onChange: function onChange() {
          return _this2.addToColumnReorderEntityList(item);
        }
      })), /*#__PURE__*/React__default.createElement("div", {
        className: "column__txt"
      }, item));
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "column__settings"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__header"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__headerTxt"
    }, /*#__PURE__*/React__default.createElement("strong", null, "Column Setting")), /*#__PURE__*/React__default.createElement("div", {
      className: "column__close"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      className: "icon-close",
      icon: freeSolidSvgIcons.faTimes,
      onClick: function onClick() {
        return _this2.props.closeColumnReOrdering();
      }
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "column__headerTxt"
    }, /*#__PURE__*/React__default.createElement("strong", null, "\xA0 \xA0 Selected Column Count : ", this.state.columnReorderEntityList.length)), /*#__PURE__*/React__default.createElement("div", {
      className: "column__headerTxt"
    }, this.state.maxLeftPinnedColumn - this.state.leftPinnedColumList.length > 0 ? /*#__PURE__*/React__default.createElement("strong", null, "\xA0 \xA0 Left Pinned Column Count Remaining :", " ", this.state.maxLeftPinnedColumn - this.state.leftPinnedColumList.length) : /*#__PURE__*/React__default.createElement("strong", {
      style: {
        color: "red"
      }
    }, "\xA0 \xA0 Maximum Count Of Left Pin Columns REACHED")), /*#__PURE__*/React__default.createElement("div", {
      className: "column__body"
    }, /*#__PURE__*/React__default.createElement(reactDnd.DndProvider, {
      backend: reactDndTouchBackend.TouchBackend,
      options: {
        enableMouseEvents: true
      }
    }, /*#__PURE__*/React__default.createElement(ColumnsList, {
      columnsArray: this.createColumnsArrayFromProps(this.state.columnReorderEntityList)
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "column__footer"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "column__btns"
    }, /*#__PURE__*/React__default.createElement("button", {
      className: "btns",
      onClick: function onClick() {
        return _this2.resetColumnReorderList();
      }
    }, "Reset"), /*#__PURE__*/React__default.createElement("button", {
      className: "btns",
      onClick: function onClick() {
        return _this2.props.closeColumnReOrdering();
      }
    }, "Cancel"), /*#__PURE__*/React__default.createElement("button", {
      className: "btns btns__save",
      onClick: function onClick() {
        return _this2.props.updateTableAsPerRowChooser(_this2.state.columnReorderEntityList, _this2.state.leftPinnedColumList);
      }
    }, "Save"))))));
  };

  return ColumnReordering;
}(React__default.Component);

var ItemTypes$1 = {
  CARD: "sort"
};

var style$1 = {
  cursor: "move"
};

var Card = function Card(_ref) {
  var id = _ref.id,
      text = _ref.text,
      moveCard = _ref.moveCard,
      findCard = _ref.findCard;
  var originalIndex = findCard(id).index;

  var _useDrag = reactDnd.useDrag({
    item: {
      type: ItemTypes$1.CARD,
      id: id,
      originalIndex: originalIndex
    },
    collect: function collect(monitor) {
      return {
        isDragging: monitor.isDragging()
      };
    },
    end: function end(dropResult, monitor) {
      var _monitor$getItem = monitor.getItem(),
          droppedId = _monitor$getItem.id,
          originalIndex = _monitor$getItem.originalIndex;

      var didDrop = monitor.didDrop();

      if (!didDrop) {
        moveCard(droppedId, originalIndex);
      }
    }
  }),
      isDragging = _useDrag[0].isDragging,
      drag = _useDrag[1];

  var _useDrop = reactDnd.useDrop({
    accept: ItemTypes$1.CARD,
    canDrop: function canDrop() {
      return false;
    },
    hover: function hover(_ref2) {
      var draggedId = _ref2.id;

      if (draggedId !== id) {
        var _findCard = findCard(id),
            overIndex = _findCard.index;

        moveCard(draggedId, overIndex);
      }
    }
  }),
      drop = _useDrop[1];

  var opacity = isDragging ? 0.1 : 1;
  return /*#__PURE__*/React__default.createElement("div", {
    ref: function ref(node) {
      return drag(drop(node));
    },
    style: _extends({}, style$1, {
      opacity: opacity
    })
  }, text);
};

var SortingList = function SortingList(props) {
  var _useState = React.useState([].concat(props.sortsArray)),
      cards = _useState[0],
      setCards = _useState[1];

  var moveCard = function moveCard(id, atIndex) {
    var _findCard = findCard(id),
        card = _findCard.card,
        index = _findCard.index;

    setCards(update(cards, {
      $splice: [[index, 1], [atIndex, 0, card]]
    }));
  };

  var findCard = function findCard(id) {
    var card = cards.filter(function (c) {
      return "" + c.id === id;
    })[0];
    return {
      card: card,
      index: cards.indexOf(card)
    };
  };

  var _useDrop = reactDnd.useDrop({
    accept: ItemTypes$1.CARD
  }),
      drop = _useDrop[1];

  React.useEffect(function () {
    setCards(props.sortsArray);
  }, [props.sortsArray]);
  return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    ref: drop,
    style: {
      display: "flex",
      flexWrap: "wrap"
    }
  }, cards.map(function (card) {
    return /*#__PURE__*/React__default.createElement(Card, {
      key: card.id,
      id: "" + card.id,
      text: card.text,
      moveCard: moveCard,
      findCard: findCard
    });
  })));
};

var App = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(App, _React$Component);

  function App() {
    var _this;

    _this = _React$Component.call(this) || this;

    _this.add = function () {
      var rowList = [].concat(_this.state.rowList);
      rowList.push(true);

      _this.setState({
        rowList: rowList
      });
    };

    _this.copy = function (i) {
    };

    _this.clearAll = function () {
      _this.setState({
        rowList: []
      });
    };

    _this.remove = function (i) {
      var rowList = [].concat(_this.state.rowList);
      rowList.splice(i, 1);

      _this.setState({
        rowList: rowList
      });
    };

    _this.createColumnsArrayFromProps = function (rowList) {
      return rowList.map(function (i, index) {
        return {
          id: index,
          text: /*#__PURE__*/React__default.createElement("div", {
            className: "sort__bodyContent",
            key: i
          }, /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "\xA0")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
            icon: freeSolidSvgIcons.faAlignJustify
          }))), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "Sort by")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React__default.createElement("select", {
            className: "custom__ctrl"
          }, _this.props.columnFieldValue.map(function (item, index) {
            return /*#__PURE__*/React__default.createElement("option", {
              key: index
            }, item);
          })))), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "Sort on")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React__default.createElement("select", {
            className: "custom__ctrl"
          }, /*#__PURE__*/React__default.createElement("option", null, "Value")))), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "Order")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__file"
          }, /*#__PURE__*/React__default.createElement("select", {
            className: "custom__ctrl"
          }, /*#__PURE__*/React__default.createElement("option", null, "Ascending"), /*#__PURE__*/React__default.createElement("option", null, "Descending")))), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "\xA0")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
            icon: freeSolidSvgIcons.faCopy,
            title: "Copy",
            onClick: function onClick() {
              return _this.copy(i);
            }
          }))), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__reorder"
          }, /*#__PURE__*/React__default.createElement("div", {
            className: ""
          }, /*#__PURE__*/React__default.createElement("div", null, "\xA0")), /*#__PURE__*/React__default.createElement("div", {
            className: "sort__icon"
          }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
            icon: freeSolidSvgIcons.faTrash,
            title: "Delete",
            onClick: function onClick() {
              return _this.remove(index);
            }
          }))))
        };
      });
    };

    _this.state = {
      rowList: [true]
    };
    _this.setWrapperRef = _this.setWrapperRef.bind(_assertThisInitialized(_this));
    _this.handleClickOutside = _this.handleClickOutside.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = App.prototype;

  _proto.componentDidMount = function componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  };

  _proto.setWrapperRef = function setWrapperRef(node) {
    this.wrapperRef = node;
  };

  _proto.handleClickOutside = function handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeSorting();
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    console.log(this.state.rowList);
    return /*#__PURE__*/React__default.createElement("div", {
      className: "sorts--grid",
      ref: this.setWrapperRef
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__grid"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__settings"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__header"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__headerTxt"
    }, /*#__PURE__*/React__default.createElement("strong", null, "Sort ")), /*#__PURE__*/React__default.createElement("div", {
      className: "sort__close"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      className: "icon-close",
      icon: freeSolidSvgIcons.faTimes,
      onClick: function onClick() {
        return _this2.props.closeSorting();
      }
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "sort__body"
    }, /*#__PURE__*/React__default.createElement(reactDnd.DndProvider, {
      backend: reactDndTouchBackend.TouchBackend,
      options: {
        enableMouseEvents: true
      }
    }, /*#__PURE__*/React__default.createElement(SortingList, {
      sortsArray: this.createColumnsArrayFromProps(this.state.rowList)
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "sort__new"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__section"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faPlus,
      className: "sort__icon"
    }), /*#__PURE__*/React__default.createElement("div", {
      className: "sort__txt",
      onClick: function onClick() {
        return _this2.add();
      }
    }, "New Sort")))), /*#__PURE__*/React__default.createElement("div", {
      className: "sort__footer"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "sort__btns"
    }, /*#__PURE__*/React__default.createElement("button", {
      className: "btns",
      onClick: this.clearAll
    }, "Clear All"), /*#__PURE__*/React__default.createElement("button", {
      className: "btns btns__save"
    }, "Ok"))))));
  };

  return App;
}(React__default.Component);

var downLaodFileType = [];

var ExportData = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(ExportData, _React$Component);

  function ExportData(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;

    _this.resetColumnExportList = function () {
      _this.setState({
        columnEntityList: [],
        isAllSelected: false
      });
    };

    _this.selectAllToColumnList = function () {
      _this.resetColumnExportList();

      _this.setState({
        columnEntityList: !_this.state.isAllSelected ? _this.props.columnsList : [],
        isAllSelected: !_this.state.isAllSelected
      });
    };

    _this.addToColumnEntityList = function (typeToBeAdded) {
      var existingColumnEntityList = _this.state.columnEntityList;

      if (!existingColumnEntityList.includes(typeToBeAdded)) {
        existingColumnEntityList.push(typeToBeAdded);
      } else {
        existingColumnEntityList = existingColumnEntityList.filter(function (item) {
          return item !== typeToBeAdded;
        });
      }

      _this.setState({
        columnEntityList: existingColumnEntityList,
        isAllSelected: false
      });
    };

    _this.selectDownLoadType = function (event) {
      if (event.target.checked && !_this.state.downLaodFileType.includes(event.target.value)) {
        downLaodFileType.push(event.target.value);

        _this.setState({
          downLaodFileType: downLaodFileType
        });
      } else {
        downLaodFileType.map(function (value, index) {
          if (value === event.target.value) {
            downLaodFileType = downLaodFileType.splice(index, value);
          }
        });

        _this.setState({
          downLaodFileType: downLaodFileType
        });
      }
    };

    _this.exportRowData = function () {
      var columnVlaueList = _this.state.columnEntityList;

      if (columnVlaueList.length > 0 && _this.state.downLaodFileType.length > 0) {
        _this.props.rows.forEach(function (row) {
          var keys = Object.getOwnPropertyNames(row);
          var filteredColumnVal = {};
          keys.forEach(function (key) {
            columnVlaueList.forEach(function (columnName) {
              if (columnName.key === key) filteredColumnVal[key] = row[key];
            });
          });

          _this.state.filteredRow.push(filteredColumnVal);
        });

        _this.state.downLaodFileType.map(function (item) {
          if (item === "pdf") _this.downloadPDF();else if (item === "excel") _this.downloadXLSFile();else _this.downloadCSVFile();
        });
      }
    };

    _this.downloadPDF = function () {
      var unit = "pt";
      var size = "A4";
      var orientation = "landscape";
      var marginLeft = 300;
      var doc = new jsPDF(orientation, unit, size);
      doc.setFontSize(15);
      var title = "iCargo Report";
      var headers = [_this.state.columnEntityList.map(function (column) {
        return column.name;
      })];
      var dataValues = [];

      _this.props.rows.forEach(function (row) {
        var keys = Object.keys(row);
        var filteredColumnVal = [];

        _this.state.columnEntityList.forEach(function (columnName) {
          keys.forEach(function (key) {
            if (columnName.key === key) filteredColumnVal.push(row[key]);
          });
        });

        dataValues.push(filteredColumnVal);
      });

      var content = {
        startY: 50,
        head: headers,
        body: dataValues
      };
      doc.text(title, marginLeft, 40);
      doc.autoTable(content);
      doc.save("report.pdf");
    };

    _this.downloadCSVFile = function () {
      var fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      var fileExtension = ".csv";
      var fileName = "CSVDownload";
      var ws = XLSX.utils.json_to_sheet(_this.state.filteredRow);
      var wb = {
        Sheets: {
          data: ws
        },
        SheetNames: ["data"]
      };
      var excelBuffer = XLSX.write(wb, {
        bookType: "csv",
        type: "array"
      });
      var data = new Blob([excelBuffer], {
        type: fileType
      });
      FileSaver.saveAs(data, fileName + fileExtension);
    };

    _this.downloadXLSFile = function () {
      var fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      var fileExtension = ".xlsx";
      var fileName = "XLSXDownload";
      var ws = XLSX.utils.json_to_sheet(_this.state.filteredRow);
      var wb = {
        Sheets: {
          data: ws
        },
        SheetNames: ["data"]
      };
      var excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array"
      });
      var data = new Blob([excelBuffer], {
        type: fileType
      });
      FileSaver.saveAs(data, fileName + fileExtension);
    };

    _this.columnSearchLogic = function (e) {
      var searchKey = String(e.target.value).toLowerCase();

      var filteredRows = _this.props.columnsList.filter(function (item) {
        return item.name.toLowerCase().includes(searchKey);
      });

      if (!filteredRows.length) {
        _this.setState({
          columnValueList: _this.props.columnsList
        });
      } else {
        _this.setState({
          columnValueList: filteredRows
        });
      }
    };

    _this.exportValidation = function () {
      var columnLength = _this.state.columnEntityList.length;
      var fileLength = _this.state.downLaodFileType.length;

      if (columnLength > 0 && fileLength > 0) {
        _this.exportRowData();

        _this.setState({
          clickTag: "none"
        });
      } else if (columnLength === 0) {
        _this.setState({
          warning: "Column"
        });

        _this.setState({
          clickTag: ""
        });
      } else if (fileLength === 0) {
        _this.setState({
          warning: "File Type"
        });

        _this.setState({
          clickTag: ""
        });
      }

      if (columnLength === 0 && fileLength === 0) {
        _this.setState({
          warning: "File Type & Column"
        });

        _this.setState({
          clickTag: ""
        });
      }
    };

    _this.state = {
      columnValueList: _this.props.columnsList,
      columnEntityList: [],
      isAllSelected: false,
      downLaodFileType: [],
      filteredRow: [],
      warning: "",
      clickTag: "none"
    };
    _this.setWrapperRef = _this.setWrapperRef.bind(_assertThisInitialized(_this));
    _this.handleClickOutside = _this.handleClickOutside.bind(_assertThisInitialized(_this));
    _this.selectDownLoadType = _this.selectDownLoadType.bind(_assertThisInitialized(_this));
    _this.exportValidation = _this.exportValidation.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ExportData.prototype;

  _proto.componentDidMount = function componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  };

  _proto.setWrapperRef = function setWrapperRef(node) {
    this.wrapperRef = node;
  };

  _proto.handleClickOutside = function handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeExport();
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    return /*#__PURE__*/React__default.createElement("div", {
      className: "exports--grid",
      ref: this.setWrapperRef
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__grid"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__chooser"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__header"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: ""
    }, /*#__PURE__*/React__default.createElement("strong", null, "Export Data"))), /*#__PURE__*/React__default.createElement("div", {
      className: "export__body"
    }, /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("input", {
      type: "text",
      placeholder: "Search export",
      className: "custom__ctrl",
      onChange: this.columnSearchLogic
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "export__selectAll"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__selectTxt",
      onClick: function onClick() {
        return _this2.selectAllToColumnList();
      }
    }, "Select All")), this.state.columnValueList.length > 0 ? this.state.columnValueList.map(function (column, index) {
      return /*#__PURE__*/React__default.createElement("div", {
        className: "export__wrap",
        key: column.key
      }, /*#__PURE__*/React__default.createElement("div", {
        className: "export__checkbox"
      }, /*#__PURE__*/React__default.createElement("input", {
        type: "checkbox",
        checked: _this2.state.columnEntityList.includes(column),
        onChange: function onChange() {
          return _this2.addToColumnEntityList(column);
        }
      })), /*#__PURE__*/React__default.createElement("div", {
        className: "export__txt"
      }, column.name));
    }) : "")), /*#__PURE__*/React__default.createElement("div", {
      className: "export__settings"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__header"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__headerTxt"
    }), /*#__PURE__*/React__default.createElement("div", {
      className: "export__close"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faTimes,
      className: "icon-close",
      onClick: this.props.closeExport
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "export__as"
    }, "Export as"), /*#__PURE__*/React__default.createElement("div", {
      className: "export__body"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: ""
    }, /*#__PURE__*/React__default.createElement("input", {
      type: "checkbox",
      name: "pdf",
      value: "pdf",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faFilePdf,
      className: "temp"
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: ""
    }, /*#__PURE__*/React__default.createElement("input", {
      type: "checkbox",
      name: "excel",
      value: "excel",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faFileExcel,
      className: "temp"
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "export__reorder"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: ""
    }, /*#__PURE__*/React__default.createElement("input", {
      type: "checkbox",
      name: "csv",
      value: "csv",
      onChange: this.selectDownLoadType
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "export__file"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faFileCsv,
      className: "temp"
    }))), /*#__PURE__*/React__default.createElement("div", {
      className: "exportWarning"
    }, /*#__PURE__*/React__default.createElement("span", {
      style: {
        display: this.state.clickTag
      },
      className: "alert alert-danger"
    }, "You haven't selected ", /*#__PURE__*/React__default.createElement("strong", null, this.state.warning)))), /*#__PURE__*/React__default.createElement("div", {
      className: "export__footer"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "export__btns"
    }, /*#__PURE__*/React__default.createElement("button", {
      className: "btns",
      onClick: function onClick() {
        return _this2.props.closeExport();
      }
    }, "Cancel"), /*#__PURE__*/React__default.createElement("button", {
      className: "btns btns__save",
      onClick: function onClick(e) {
        _this2.exportValidation();
      }
    }, "Export"))))));
  };

  return ExportData;
}(React__default.Component);

var _require = require("react-data-grid-addons"),
    DraggableContainer = _require.DraggableHeader.DraggableContainer;

var DropDownEditor = reactDataGridAddons.Editors.DropDownEditor;

var defaultParsePaste = function defaultParsePaste(str) {
  return str.split(/\r\n|\n|\r/).map(function (row) {
    return row.split("\t");
  });
};

var selectors = reactDataGridAddons.Data.Selectors;
var AutoCompleteFilter = reactDataGridAddons.Filters.AutoCompleteFilter,
    NumericFilter = reactDataGridAddons.Filters.NumericFilter;

var spreadsheet = /*#__PURE__*/function (_Component) {
  _inheritsLoose(spreadsheet, _Component);

  function spreadsheet(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    _this.updateRows = function (startIdx, newRows) {
      _this.setState(function (state) {
        var rows = state.rows.slice();

        for (var i = 0; i < newRows.length; i++) {
          if (startIdx + i < rows.length) {
            rows[startIdx + i] = _extends({}, rows[startIdx + i], newRows[i]);
          }
        }

        return {
          rows: rows
        };
      });
    };

    _this.rowGetter = function (i) {
      var rows = _this.state.rows;
      return rows[i];
    };

    _this.handleCopy = function (e) {
      e.preventDefault();
      var _this$state = _this.state,
          topLeft = _this$state.topLeft,
          botRight = _this$state.botRight;
      var text = lodash.range(topLeft.rowIdx, botRight.rowIdx + 1).map(function (rowIdx) {
        return _this.state.columns.slice(topLeft.colIdx - 1, botRight.colIdx).map(function (col) {
          return _this.rowGetter(rowIdx)[col.key];
        }).join("\t");
      }).join("\n");
      e.clipboardData.setData("text/plain", text);
    };

    _this.handlePaste = function (e) {
      e.preventDefault();
      var topLeft = _this.state.topLeft;
      var newRows = [];
      var pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));
      pasteData.forEach(function (row) {
        var rowData = {};

        _this.state.columns.slice(topLeft.colIdx - 1, topLeft.colIdx - 1 + row.length).forEach(function (col, j) {
          rowData[col.key] = row[j];
        });

        newRows.push(rowData);
      });

      _this.updateRows(topLeft.rowIdx, newRows);
    };

    _this.setSelection = function (args) {
      _this.setState({
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

    _this.handleWarningStatus = function () {
      _this.setState({
        warningStatus: "invalid"
      });
    };

    _this.closeWarningStatus = function () {
      _this.setState({
        warningStatus: ""
      });
    };

    _this.sortRows = function (data, sortColumn, sortDirection) {
      var comparer = function comparer(a, b) {
        if (sortDirection === "ASC") {
          return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else if (sortDirection === "DESC") {
          return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
      };

      _this.setState({
        rows: [].concat(_this.state.rows).sort(comparer)
      });

      return sortDirection === "NONE" ? data : _this.state.rows;
    };

    _this.onGridRowsUpdated = function (_ref) {
      var fromRow = _ref.fromRow,
          toRow = _ref.toRow,
          updated = _ref.updated,
          action = _ref.action;
      var columnName = "";

      var filter = _this.formulaAppliedCols.filter(function (item) {
        if (updated[item.key] !== null && updated[item.key] !== undefined) {
          columnName = item.key;
          return true;
        } else return false;
      });

      if (filter.length > 0) {
        updated = applyFormula(updated, columnName);
      }

      if (action !== "COPY_PASTE") {
        _this.setState(function (state) {
          var rows = state.rows.slice();

          for (var i = fromRow; i <= toRow; i++) {
            rows[i] = _extends({}, rows[i], updated);
          }

          return {
            rows: rows
          };
        });

        _this.setState(function (state) {
          var filteringRows = state.filteringRows.slice();

          for (var i = fromRow; i <= toRow; i++) {
            filteringRows[i] = _extends({}, filteringRows[i], updated);
          }

          return {
            filteringRows: filteringRows
          };
        });

        _this.setState(function (state) {
          var tempRows = state.tempRows.slice();

          for (var i = fromRow; i <= toRow; i++) {
            tempRows[i] = _extends({}, tempRows[i], updated);
          }

          return {
            tempRows: tempRows
          };
        });
      }

      if (_this.props.updateCellData) {
        _this.props.updateCellData(_this.state.tempRows[fromRow], _this.state.tempRows[toRow], updated, action);
      }
    };

    _this.onRowsSelected = function (rows) {
      _this.setState({
        selectedIndexes: _this.state.selectedIndexes.concat(rows.map(function (r) {
          return r.rowIdx;
        }))
      });

      if (_this.props.selectBulkData) {
        _this.props.selectBulkData(rows);
      }
    };

    _this.onRowsDeselected = function (rows) {
      var rowIndexes = rows.map(function (r) {
        return r.rowIdx;
      });

      _this.setState({
        selectedIndexes: _this.state.selectedIndexes.filter(function (i) {
          return rowIndexes.indexOf(i) === -1;
        })
      });
    };

    _this.handleFilterChange = function (value) {
      console.log(value);
      var junk = _this.state.junk;

      if (!(value.filterTerm == null) && !(value.filterTerm.length <= 0)) {
        junk[value.column.key] = value;
      } else {
        delete junk[value.column.key];
      }

      _this.setState({
        junk: junk
      });

      var data = _this.getrows(_this.state.filteringRows, _this.state.junk);

      _this.setState({
        rows: data,
        tempRows: data,
        count: data.length
      });

      if (_this.state.count === 0) {
        _this.handleWarningStatus();
      } else {
        _this.closeWarningStatus();
      }
    };

    _this.getrows = function (rows, filters) {
      console.log(filters);

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

    _this.sortRows = function (data, sortColumn, sortDirection) {
      var comparer = function comparer(a, b) {
        if (sortDirection === "ASC") {
          return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else if (sortDirection === "DESC") {
          return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
      };

      _this.setState({
        rows: [].concat(data).sort(comparer)
      });

      return sortDirection === "NONE" ? data : _this.state.rows;
    };

    _this.onHeaderDrop = function (source, target) {
      var stateCopy = Object.assign({}, _this.state);

      var columnSourceIndex = _this.state.columns.findIndex(function (i) {
        return i.key === source;
      });

      var columnTargetIndex = _this.state.columns.findIndex(function (i) {
        return i.key === target;
      });

      stateCopy.columns.splice(columnTargetIndex, 0, stateCopy.columns.splice(columnSourceIndex, 1)[0]);
      var emptyColumns = Object.assign({}, _this.state, {
        columns: []
      });

      _this.setState(emptyColumns);

      var reorderedColumns = Object.assign({}, _this.state, {
        columns: stateCopy.columns
      });

      _this.setState(reorderedColumns);
    };

    _this.updateTableAsPerRowChooser = function (inComingColumnsHeaderList, pinnedColumnsList) {
      var existingColumnsHeaderList = _this.props.columns;
      existingColumnsHeaderList = existingColumnsHeaderList.filter(function (item) {
        return inComingColumnsHeaderList.includes(item.name);
      });
      var rePositionedArray = existingColumnsHeaderList;
      var singleHeaderOneList;

      if (pinnedColumnsList.length > 0) {
        pinnedColumnsList.slice(0).reverse().map(function (item, index) {
          singleHeaderOneList = existingColumnsHeaderList.filter(function (subItem) {
            return item === subItem.name;
          });
          rePositionedArray = _this.array_move(existingColumnsHeaderList, existingColumnsHeaderList.indexOf(singleHeaderOneList[0]), index);
        });
      }

      existingColumnsHeaderList = rePositionedArray;
      existingColumnsHeaderList.map(function (headerItem, index) {
        if (headerItem.frozen !== undefined && headerItem.frozen === true) {
          existingColumnsHeaderList[index]["frozen"] = false;
        }

        if (pinnedColumnsList.includes(headerItem.name)) {
          existingColumnsHeaderList[index]["frozen"] = true;
        }
      });
      console.log("existingColumnsHeaderList ", existingColumnsHeaderList);

      _this.setState({
        columns: existingColumnsHeaderList
      });

      _this.closeColumnReOrdering();
    };

    _this.array_move = function (arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;

        while (k--) {
          arr.push(undefined);
        }
      }

      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    };

    _this.columnReorderingPannel = function () {
      var headerNameList = [];
      var existingPinnedHeadersList = [];

      _this.state.columns.filter(function (item) {
        return item.frozen !== undefined && item.frozen === true;
      }).map(function (item) {
        return existingPinnedHeadersList.push(item.name);
      });

      _this.state.columns.map(function (item) {
        return headerNameList.push(item.name);
      });

      _this.setState({
        columnReorderingComponent: /*#__PURE__*/React__default.createElement(ColumnReordering, _extends({
          maxLeftPinnedColumn: _this.props.maxLeftPinnedColumn,
          updateTableAsPerRowChooser: _this.updateTableAsPerRowChooser,
          headerKeys: headerNameList,
          closeColumnReOrdering: _this.closeColumnReOrdering,
          existingPinnedHeadersList: existingPinnedHeadersList
        }, _this.props))
      });
    };

    _this.closeColumnReOrdering = function () {
      _this.setState({
        columnReorderingComponent: null
      });
    };

    _this.handleSearchValue = function (value) {
      _this.setState({
        searchValue: value
      });
    };

    _this.clearSearchValue = function () {
      _this.setState({
        searchValue: ""
      });
    };

    _this.sortingPanel = function () {
      var columnField = [];

      _this.state.columns.map(function (item) {
        return columnField.push(item.name);
      });

      _this.setState({
        sortingPanelComponent: /*#__PURE__*/React__default.createElement(App, {
          columnFieldValue: columnField,
          closeSorting: _this.closeSorting
        })
      });
    };

    _this.closeSorting = function () {
      _this.setState({
        sortingPanelComponent: null
      });
    };

    _this.exportColumnData = function () {
      _this.setState({
        exportComponent: /*#__PURE__*/React__default.createElement(ExportData, {
          rows: _this.state.rows,
          columnsList: _this.state.columns,
          closeExport: _this.closeExport
        })
      });
    };

    _this.closeExport = function () {
      _this.setState({
        exportComponent: null
      });
    };

    var airportCodes = [];

    _this.props.airportCodes.forEach(function (item) {
      airportCodes.push({
        id: item,
        value: item
      });
    });

    _this.state = {
      warningStatus: "",
      height: 680,
      displayNoRows: "none",
      searchIconDisplay: "",
      searchValue: "",
      filter: {},
      rows: _this.props.rows,
      selectedIndexes: [],
      junk: {},
      topLeft: {},
      columnReorderingComponent: null,
      exportComponent: null,
      filteringRows: _this.props.rows,
      tempRows: _this.props.rows,
      sortingPanelComponent: null,
      count: _this.props.count,
      columns: _this.props.columns.map(function (item) {
        if (item.editor === "DatePicker") {
          item.editor = DatePicker;
        } else if (item.editor === "DropDown") {
          item.editor = /*#__PURE__*/React__default.createElement(DropDownEditor, {
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
    document.addEventListener("copy", _this.handleCopy);
    document.addEventListener("paste", _this.handlePaste);
    _this.handleSearchValue = _this.handleSearchValue.bind(_assertThisInitialized(_this));
    _this.clearSearchValue = _this.clearSearchValue.bind(_assertThisInitialized(_this));
    _this.handleFilterChange = _this.handleFilterChange.bind(_assertThisInitialized(_this));
    _this.formulaAppliedCols = _this.props.columns.filter(function (item) {
      return item.formulaApplicable;
    });
    return _this;
  }

  var _proto = spreadsheet.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(props) {
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
  };

  _proto.getValidFilterValues = function getValidFilterValues(rows, columnId) {
    return rows.map(function (r) {
      return r[columnId];
    }).filter(function (item, i, a) {
      return i === a.indexOf(item);
    });
  };

  _proto.render = function render() {
    var _this2 = this;

    return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("div", {
      className: "parentDiv"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "totalCount"
    }, "Showing ", /*#__PURE__*/React__default.createElement("strong", null, " ", this.state.count, " "), " records"), /*#__PURE__*/React__default.createElement("div", {
      className: "globalSearch"
    }, /*#__PURE__*/React__default.createElement("i", {
      className: "fa fa-search"
    }), /*#__PURE__*/React__default.createElement(reactBootstrap.FormControl, {
      className: "globalSeachInput",
      type: "text",
      placeholder: "Search",
      onChange: function onChange(e) {
        _this2.handleSearchValue(e.target.value);

        _this2.props.globalSearchLogic(e, _this2.state.tempRows);
      },
      value: this.state.searchValue
    })), /*#__PURE__*/React__default.createElement("div", {
      className: "filterIcons",
      onClick: this.sortingPanel
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      title: "Group Sort",
      icon: freeSolidSvgIcons.faSortAmountDown
    }), /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faSortDown,
      className: "filterArrow"
    })), this.state.sortingPanelComponent, /*#__PURE__*/React__default.createElement("div", {
      className: "filterIcons",
      onClick: this.columnReorderingPannel
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      title: "Column Chooser",
      icon: freeSolidSvgIcons.faColumns
    }), /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      icon: freeSolidSvgIcons.faSortDown,
      className: "filterArrow"
    })), this.state.columnReorderingComponent, /*#__PURE__*/React__default.createElement("div", {
      className: "filterIcons"
    }, /*#__PURE__*/React__default.createElement(reactFontawesome.FontAwesomeIcon, {
      title: "Export",
      icon: freeSolidSvgIcons.faShareAlt,
      onClick: this.exportColumnData
    })), this.state.exportComponent), /*#__PURE__*/React__default.createElement(ErrorMessage, {
      className: "errorDiv",
      status: this.state.warningStatus,
      closeWarningStatus: this.props.closeWarningStatus,
      clearSearchValue: this.clearSearchValue
    }), /*#__PURE__*/React__default.createElement(DraggableContainer, {
      className: "gridDiv",
      onHeaderDrop: this.onHeaderDrop
    }, /*#__PURE__*/React__default.createElement(ExtDataGrid, {
      toolbar: /*#__PURE__*/React__default.createElement(reactDataGridAddons.Toolbar, {
        enableFilter: true
      }),
      getValidFilterValues: function getValidFilterValues(columnKey) {
        return _this2.getValidFilterValues(_this2.state.filteringRows, columnKey);
      },
      minHeight: this.state.height,
      columns: this.state.columns,
      rowGetter: function rowGetter(i) {
        return _this2.state.rows[i];
      },
      rowsCount: this.state.rows.length,
      onGridRowsUpdated: this.onGridRowsUpdated,
      enableCellSelect: true,
      onClearFilters: function onClearFilters() {
        _this2.setState({
          junk: {}
        });
      },
      onColumnResize: function onColumnResize(idx, width) {
        return console.log("Column " + idx + " has been resized to " + width);
      },
      onAddFilter: function onAddFilter(filter) {
        return _this2.handleFilterChange(filter);
      },
      rowSelection: {
        showCheckbox: true,
        enableShiftSelect: true,
        onRowsSelected: this.onRowsSelected,
        onRowsDeselected: this.onRowsDeselected,
        selectBy: {
          indexes: this.state.selectedIndexes
        }
      },
      onGridSort: function onGridSort(sortColumn, sortDirection) {
        return _this2.sortRows(_this2.state.rows, sortColumn, sortDirection);
      }
    })));
  };

  return spreadsheet;
}(React.Component);

module.exports = spreadsheet;
//# sourceMappingURL=index.js.map
