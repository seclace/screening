import React, { Component } from 'react';
import throttle from 'lodash.throttle';
import omit from 'lodash.omit';
import { withFirestore } from 'react-redux-firebase';
import { mapFilters, mapOrderBys, findMaxOrdersPriority } from './utils';
import Loader from './components/Loader';
import Pagination from './components/Pagination';
import UsersTable from './components/UsersTable';
import { Filter, FieldID, MappedOrderBy, StartAfter, MappedFilter, OrderBy } from './types';
import { PER_PAGE, WAIT_BEFORE_APPLY, ORDER, FIELDS } from './consts';
import './index.css';

interface UsersListProps {
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
      if (page === 0) await this.preparePagingData();
      const getUsersParams = {
        collection: 'users',
        startAfter: startAfter[page],
        orderBy: this.getOrderBy(),
        limit: PER_PAGE,
        where: this.getFilters(),
      };
      await firestore.get(getUsersParams);
      this.setState({ loading: false });
    } catch (err) {
      console.log(err)
      this.setState({ loading: false });
    }
  }

  async preparePagingData (): Promise<void> {
    const { firestore } = this.props;
    const orderBy = this.getOrderBy();
    let getUsers = firestore.collection('users');
    if (orderBy.length) orderBy.forEach(o => {
      if (!o.length) return;
      getUsers = getUsers.orderBy(o[0], o[1]) as firebase.firestore.CollectionReference;
    })
    this.getFilters().forEach(([path, opStr, value]) => {
      getUsers = getUsers.where(path, opStr, value) as firebase.firestore.CollectionReference;
    });
    const users: Array<firebase.firestore.QueryDocumentSnapshot> = await getUsers.get().then(v => v.docs);
    const startAfter: StartAfter = users.filter((doc, index) => (index + 1) % 10 === 0);
    if (users.length) startAfter.unshift(undefined);
    this.setState({ startAfter });
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
    const filter: Filter = { value, condition }
    let nextFilters = { ...this.state.filters, [filterId]: filter };
    const filterByLastActive = filterId === FIELDS.lastActiveEnd || filterId === FIELDS.lastActiveStart;
    const sorted = filterByLastActive ? FIELDS.lastActive in this.state.orderBy : filterId in this.state.orderBy;
    if (!value)
      nextFilters = omit(nextFilters, [filterId]);
    else if (sorted && !filterByLastActive)
      this.applyOrder(initialOrderBy);
    else if (filterByLastActive)
      this.applyOrder({ ...this.state.orderBy, [FIELDS.lastActive]: { order: ORDER.ascending, priority: 0 } });

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
    const nextOrderBy = omit(orderBy, [sortId]);
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
    const nextOrderBy = omit(orderBy, [sortId]);
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

export default withFirestore(UsersList);
