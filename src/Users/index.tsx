import React, { Component } from 'react';
import throttle from 'lodash.throttle';
import omit from 'lodash.omit';
import { withFirestore } from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { mapFilters, mapOrderBys, findMaxOrdersPriority } from './utils';
import Loader from './components/Loader';
import Pagination from './components/Pagination';
import UsersTable from './components/UsersTable';
import { PER_PAGE, WAIT_BEFORE_APPLY, ORDER, FIELDS } from './consts';
import { Filter, FieldID, MappedOrderBy, StartAfter, MappedFilter, OrderBy, User } from './types';
import { State } from '../Store/types';
import './index.css';

interface UsersListProps {
  users: Array<User>,
  firestore: firebase.firestore.Firestore & {
    get: ({}) => Promise<firebase.firestore.QuerySnapshot>,
  },
}
interface UsersListState {
  startAfter: StartAfter,
  loading: boolean,
  filters: {
    [path: string]: Filter,
  },
  orderBy: {
    [path: string]: OrderBy,
  },
  page: number,
  usersEndReached: boolean,
}

const initialFilters = {};
const initialOrderBy = {};

class UsersList extends Component<UsersListProps, UsersListState> {

  constructor (props: UsersListProps) {
    super(props);
    this.state = {
      startAfter: [],
      loading: false,
      filters: initialFilters,
      orderBy: initialOrderBy,
      page: 0,
      usersEndReached: false,
    };
    this.loadUsers = this.loadUsers.bind(this);
    this.preparePagingData = this.preparePagingData.bind(this);
    this.applyFilters = throttle(this.applyFilters, WAIT_BEFORE_APPLY, { leading: false, trailing: true });
    this.applyOrder = throttle(this.applyOrder, WAIT_BEFORE_APPLY, { leading: false, trailing: true });
  }

  componentDidMount () {
    this.loadUsers()
  }

  async loadUsers (): Promise<void> {
    this.setState({ loading: true });
    const { firestore } = this.props;
    const { startAfter, page } = this.state;
    try {
      const getUsersParams = {
        collection: 'users',
        startAfter: startAfter[page],
        orderBy: this.getOrderBy(),
        limit: PER_PAGE,
        where: this.getFilters(),
      };
      const users = await firestore.get(getUsersParams);
      this.setState({ loading: false }, () => this.preparePagingData(users));
    } catch (err) {
      console.log(err)
      this.setState({ loading: false });
    }
  }

  async preparePagingData (users: firebase.firestore.QuerySnapshot): Promise<void> {
    const { startAfter, page } = this.state;
    if (page < startAfter.length - 1) return;
    const nextStartAfter: StartAfter = users.docs.filter((doc, index) => (index + 1) % PER_PAGE === 0);
    if (users.size && !startAfter.length) nextStartAfter.unshift(undefined);
    this.setState({ startAfter: [...startAfter, ...nextStartAfter] });
  }

  getFilters = (): Array<MappedFilter> => {
    return mapFilters(this.state.filters);
  }

  getOrderBy = (): Array<MappedOrderBy> => {
    return mapOrderBys(this.state.orderBy);
  }

  applyFilters = (filters: { [path: string]: Filter }): void => {
    this.setState({ filters, startAfter: [], page: 0 }, this.loadUsers);
  }

  changeFilter = (value: any, filterId: FieldID, condition: firebase.firestore.WhereFilterOp = '=='): void => {
    const { filters, orderBy } = this.state;
    const filter: Filter = { value, condition };
    let nextFilters = { ...filters, [filterId]: filter };
    const filterByLastActive = filterId === FIELDS.lastActiveEnd || filterId === FIELDS.lastActiveStart;
    const sorted = filterByLastActive ? FIELDS.lastActive in orderBy : filterId in orderBy;
    if (!value)
      nextFilters = omit(nextFilters, [filterId]);
    else if (sorted && !filterByLastActive)
      this.applyOrder(initialOrderBy);
    else if (filterByLastActive) {
      const order = sorted ? orderBy[FIELDS.lastActive].order : ORDER.ascending;
      this.applyOrder({ [FIELDS.lastActive]: { order, priority: 0 } });
    }

    this.applyFilters(nextFilters);
  }

  applyOrder = (orderBy: { [path: string]: OrderBy }): void => {
    this.setState({ orderBy, startAfter: [], page: 0 }, this.loadUsers);
  }

  changeOrder = (sortId: FieldID): void => {
    if (sortId in this.state.orderBy) {
      return this.changeOrderIfSorted(sortId);
    }
    this.changeOrderIfUnsorted(sortId);
  }

  changeOrderIfUnsorted = (sortId: FieldID): void => {
    const { orderBy, filters } = this.state;
    const nextOrderBy: { [path: string]: OrderBy } = {};
    const isLastActive = sortId === FIELDS.lastActive;
    const filtered = isLastActive ? this.lastActiveFiltered() : sortId in filters;
    nextOrderBy[sortId] = {
      order: ORDER.ascending,
      priority: filtered && isLastActive ? 0 : findMaxOrdersPriority(orderBy) + 1,
    };
    this.applyOrder(nextOrderBy);
  }

  changeOrderIfSorted = (sortId: FieldID): void => {
    const { orderBy, filters } = this.state;
    const { order, priority } = orderBy[sortId];
    const nextOrderBy: { [path: string]: OrderBy } = {};
    const isLastActive = sortId === FIELDS.lastActive;
    const filtered = isLastActive ? this.lastActiveFiltered() : sortId in filters;
    const ascending = order === ORDER.ascending;
    if (filtered && isLastActive) {
      nextOrderBy[sortId] = {
        order: ascending ? ORDER.descending : ORDER.ascending,
        priority: 0,
      };
    } else if (ascending) {
      nextOrderBy[sortId] = {
        order: ORDER.descending,
        priority: filtered && isLastActive ? 0 : priority,
      };
    }
    this.applyOrder(nextOrderBy);
  }

  lastActiveFiltered = (): boolean => FIELDS.lastActiveStart in this.state.filters || FIELDS.lastActiveEnd in this.state.filters;

  loadPage = (page: number): void => this.setState({ page }, this.loadUsers);

  render (): React.ReactNode {
    const { loading, page, startAfter, filters, orderBy } = this.state;
    return (
      <div className='users-container'>
        <div className='users'>
          { loading && <Loader/> }
          <UsersTable
            changeFilter={this.changeFilter}
            changeOrder={this.changeOrder}
            filters={filters}
            orderBy={orderBy}/>
          <Pagination
            loadPage={this.loadPage}
            page={page}
            pagesCount={startAfter.length}/>
        </div>
      </div>
    )
  }
}

const withFirestoreAndUsers = compose(
  withFirestore,
  connect((state: State) => ({
    users: state.firestore.ordered.users,
  })),
);

export default withFirestoreAndUsers(UsersList);
