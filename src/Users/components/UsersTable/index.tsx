import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { State } from '../../../Store/types';
import { User as UserType, FieldID, Filter, OrderBy } from '../../types';
import { FIELDS } from '../../consts';
import Filters from './components/Filters';
import User from './components/User';

interface UsersTableProps {
  users: Array<UserType>,
  changeFilter: (value: string, filterId: FieldID) => void,
  changeOrder: (filterId: FieldID) => void,
  orderBy: OrderBy,
  filters: {
  	[path: string]: Filter,
  },
}

class UsersTable extends Component<UsersTableProps> {

  static defaultProps = {
    users: [],
  }

  render () {
  	const { users, changeFilter } = this.props;
  	return (
      <table cellPadding='0' cellSpacing='0'>
        {this.renderTableHead()}
        <tbody>
          <Filters onChange={changeFilter}/>
          {users.map(user => <User key={user.id} user={user}/>)}
        </tbody>
      </table>
    )
  }

  renderTableHead (): React.ReactNode {
    return (
      <thead>
        <tr>
          <th>User ID</th>
          {this.renderSortCell(FIELDS.firstName, 'First Name')}
          {this.renderSortCell(FIELDS.surname, 'Second Name')}
          {this.renderSortCell(FIELDS.email, 'Email')}
          {this.renderSortCell(FIELDS.phoneNumber, 'Phone Number')}
          {this.renderSortCell(FIELDS.residenceCountry, 'Residence Country')}
          {this.renderSortCell(FIELDS.residenceCity, 'Residence City')}
          {this.renderSortCell(FIELDS.lastActive, 'Data Last Active')}
        </tr>
      </thead>
    )
  }

  renderSortCell (sortId: FieldID, title: string): React.ReactNode {
  	const { orderBy, filters, changeOrder} = this.props;
    const [appliedSortId, order] = orderBy;
    const filtered = sortId in filters;
    const filteredByLastActive = (FIELDS.lastActiveStart in filters || FIELDS.lastActiveEnd in filters) && sortId !== FIELDS.lastActive;
    if (filtered || filteredByLastActive) return <th className='sort-disabled'>{title}</th>

    const className = classNames('have-sort', { [order as string]: appliedSortId === sortId });
    return (
      <th className={className} onClick={() => changeOrder(sortId)}>{title}</th>
    )
  }
}

function mapStateToProps (state: State) {
  return {
    users: state.firestore.ordered.users,
  }
}

export default connect(mapStateToProps)(UsersTable);
