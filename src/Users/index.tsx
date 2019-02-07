import React, { Component } from 'react';
import throttle from 'lodash.throttle';
import omit from 'lodash.omit';
import uniqWith from 'lodash.uniqwith';
import { withFirestore } from 'react-redux-firebase';
import { mapFilters } from './utils';
import Loader from './components/Loader';
import Pagination from './components/Pagination';
import UsersTable from './components/UsersTable';
import { Filter, FieldID, OrderBy, StartAfter } from './types';
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
  orderBy: OrderBy,
  page: number,
}

class UsersList extends Component<UsersListProps, UsersListState> {

  constructor (props: UsersListProps) {
    super(props);
    this.state = {
      startAfter: [],
      loading: false,
      filters: {},
      orderBy: [],
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
    const { startAfter, filters, orderBy, page } = this.state;
    try {
      if (page === 0) await this.preparePagingData();
      const where = mapFilters(filters);
      console.log('where', {
        collection: 'users',
        startAfter: startAfter[page],
        orderBy,
        limit: PER_PAGE,
        where,
      })
      await firestore.get({
        collection: 'users',
        startAfter: startAfter[page],
        orderBy,
        limit: PER_PAGE,
        where,
      })
      this.setState({ loading: false });
    } catch (err) {
      console.log(err)
      this.setState({ loading: false });
    }
  }

  async preparePagingData (): Promise<void> {
    const { firestore } = this.props;
    const { orderBy, filters } = this.state;
    let getUsers = firestore.collection('users');
    if (orderBy.length)
      getUsers = getUsers.orderBy(orderBy[0], orderBy[1]) as firebase.firestore.CollectionReference;
    mapFilters(filters).forEach(f => {
      getUsers = getUsers.where(f[0], f[1], f[2]) as firebase.firestore.CollectionReference;
    });
    const users: Array<firebase.firestore.QueryDocumentSnapshot> = await getUsers.get().then(v => v.docs);
    const startAfter: StartAfter = users.filter((doc, index) => (index + 1) % 10 === 0);
    if (users.length) startAfter.unshift(undefined);
    this.setState({ startAfter });
  }

  applyFilters = (filters: { [path: string]: Filter }): void => {
    this.setState({ filters, startAfter: [], page: 0 }, this.loadUsers);
  }

  changeFilter = (value: any, filterId: FieldID, condition: firebase.firestore.WhereFilterOp = '=='): void => {
    const filter: Filter = { value, condition }
    let nextFilters = { ...this.state.filters, [filterId]: filter };
    const sorted = filterId === this.state.orderBy[0];
    if (!value) nextFilters = omit(nextFilters, [filterId]);
    else if (sorted) this.applyOrder([]);
    this.applyFilters(nextFilters);
  }

  applyOrder = (orderBy: OrderBy): void => {
    this.setState({ orderBy, startAfter: [], page: 0 }, this.loadUsers);
  }

  changeOrder = (sortId: FieldID): void => {
    const [currentSortId, order] = this.state.orderBy;
    const descending = currentSortId === sortId && order === ORDER.descending
    const ascending = currentSortId === sortId && order === ORDER.ascending
    const nextOrderBy: OrderBy = descending
      ? []
      : ascending
        ? [sortId, ORDER.descending]
        : [sortId, ORDER.ascending];
    this.applyOrder(nextOrderBy);
  }

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
