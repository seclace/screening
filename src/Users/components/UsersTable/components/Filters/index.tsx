import React, { Component } from 'react';
import { DateRangePicker } from 'react-dates';
import { Moment } from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { FIELDS } from '../../../../consts';
import { FieldID } from '../../../../types';

interface FiltersProps {
  onChange: (value: any, filterId: FieldID, condition?: firebase.firestore.WhereFilterOp) => void,
}
interface FiltersState {
  startDate: Moment | null,
  endDate: Moment | null,
  focusedInput: any,
}

class Filters extends Component<FiltersProps, FiltersState> {

  constructor (props: FiltersProps) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      focusedInput: null,
    }
  }

  handleDatesChange = ({ startDate, endDate }: { startDate: Moment | null, endDate: Moment | null }): void => {
    this.setState({ startDate, endDate });
    if (startDate && !endDate) this.props.onChange(startDate.valueOf(), FIELDS.lastActiveStart, '>=');
    else if (endDate) this.props.onChange(endDate.valueOf(), FIELDS.lastActiveEnd, '<');
  }

  render () {
    return (
      <tr>
        <td></td>
        {this.renderFilterCell(FIELDS.firstName)}
        {this.renderFilterCell(FIELDS.surname)}
        {this.renderFilterCell(FIELDS.email)}
        {this.renderFilterCell(FIELDS.residenceCountry)}
        {this.renderFilterCell(FIELDS.residenceCity)}
        <td>
          <DateRangePicker
            isOutsideRange={() => false}
            startDate={this.state.startDate}
            startDateId='start-date'
            endDate={this.state.endDate}
            endDateId='end-date'
            focusedInput={this.state.focusedInput}
            onFocusChange={focusedInput => this.setState({ focusedInput })}
            onDatesChange={this.handleDatesChange}/>
        </td>
      </tr>
    )
  }

  renderFilterCell (filterId: FieldID): React.ReactNode {
    return (
      <td>
        <input onChange={(e: { target: { value: string } }) => this.props.onChange(e.target.value, filterId)}/>
      </td>
    )
  }
}

export default Filters;
