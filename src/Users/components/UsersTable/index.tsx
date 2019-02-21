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
  orderBy: {
    [path: string]: OrderBy,
  },
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
          {this.renderSortCell(FIELDS.residenceCountry, 'Residence Country')}
          {this.renderSortCell(FIELDS.residenceCity, 'Residence City')}
          {this.renderSortCell(FIELDS.lastActive, 'Data Last Active')}
        </tr>
      </thead>
    )
  }

  renderSortCell (sortId: FieldID, title: string): React.ReactNode {
  	const { orderBy, filters, changeOrder } = this.props;
    const { order = '' } = orderBy[sortId] || {};
    const filtered = sortId in filters;
    if (filtered) return <th className='sort-disabled'>{title}</th>

    const className = classNames('have-sort', { [order as string]: sortId in orderBy });
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
