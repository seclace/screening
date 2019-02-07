import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import './index.css';
import { configureStore } from '../Store';
import UsersList from '../Users';

const { store, rrfProps } = configureStore();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          <UsersList/>
        </ReactReduxFirebaseProvider>
      </Provider>
    );
  }
}

export default App;
