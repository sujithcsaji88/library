import React from 'react';

export default class DatePicker extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        value: new Date(),
      };
      //the variable to store component reference
      this.input = null;
  
      this.getInputNode = this.getInputNode.bind(this);
      this.getValue = this.getValue.bind(this);
      this.onValueChanged = this.onValueChanged.bind(this);
    }
  
    //returning the component with the reference, input
    getInputNode() {
      return this.input;
    }
    //returning updated object with the date value in the required format
    getValue() {
      var updated = {};
      let date;
      date = new Date(this.state.value);
      const dateTimeFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" });
      const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);
      updated[this.props.column.key] = `${day}-${month}-${year}`;
      return updated;
  
    }
  
    onValueChanged(ev) {
      this.setState({ value: ev.target.value });
    }
  
    render() {
      return (
        <div>
          <input
            type="date"
            ref={(ref) => {
              this.input = ref;
            }}
            value={this.state.value}
            onChange={this.onValueChanged}
          />
        </div>
      );
    }
  }