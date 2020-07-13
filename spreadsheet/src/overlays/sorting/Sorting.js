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
  add = () => {
    let rowList = [...this.state.rowList];
    rowList.push(true);
    this.setState({ rowList });
    };

  copy = (i) => {
    let rowList = [...this.state.rowList];
    // rowList.push(true);
    // this.setState({ rowList });
  };

  clearAll = () => {
    this.setState({ rowList: [] });
  };

  remove = (i) => {
    let rowList = [...this.state.rowList];
    rowList.splice(i, 1);
    this.setState({ rowList });
  };

  createColumnsArrayFromProps = (rowList) => {
    return rowList.map((i, index) => {
      return {
        id: index,
        text: (
          <div className="sort__bodyContent" key={i}  >
            <div className="sort__reorder">
              <div className="">
                <div>&nbsp;</div >
              </div >
              <div className="sort__icon">
                <FontAwesomeIcon icon={faAlignJustify}></FontAwesomeIcon>
              </div>
            </div >
            <div className="sort__reorder">
              <div className="">
                <div>Sort by</div>
              </div>
              <div className="sort__file">
                <select className="custom__ctrl">
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
                <select className="custom__ctrl">
                  <option>Value</option>
                </select>
              </div>
            </div>
            <div className="sort__reorder">
              <div className="">
                <div>Order</div>
              </div>
              <div className="sort__file">
                <select className="custom__ctrl">
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
                  onClick={() => this.copy(i)}
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
          </div >)
      }
    });
  };

  render() {
    console.log(this.state.rowList)
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
                  sortsArray={this.createColumnsArrayFromProps(this.state.rowList)}
                />
              </DndProvider>
              {/* {rowList.map((x, i) => {
                return (
                  <div className="sort__bodyContent" key={i}>
                    <div className="sort__reorder">
                      <div className="">
                        <div>&nbsp;</div>
                      </div>
                      <div className="sort__icon">
                        <FontAwesomeIcon
                          icon={faAlignJustify}
                        ></FontAwesomeIcon>
                      </div>
                    </div>
                    <div className="sort__reorder">
                      <div className="">
                        <div>Sort by</div>
                      </div>
                      <div className="sort__file">
                        <select className="custom__ctrl">
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
                        <select className="custom__ctrl">
                          <option>Value</option>
                        </select>
                      </div>
                    </div>
                    <div className="sort__reorder">
                      <div className="">
                        <div>Order</div>
                      </div>
                      <div className="sort__file">
                        <select className="custom__ctrl">
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
                          onClick={() => this.copy(i)}
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
                          onClick={() => this.remove(i)}
                        ></FontAwesomeIcon>
                      </div>
                    </div>
                  </div>
                );
              })} */}
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
            </div>
            <div className="sort__footer">
              <div className="sort__btns">
                <button className="btns" onClick={this.clearAll}>
                  Clear All
                </button>
                <button className="btns btns__save">Ok</button>
              </div>
            </div>
          </div>
        </div>
        {/* <button onClick={() => this.add()}>Add New</button> */}
      </div>
    );
  }
}

export default App;
