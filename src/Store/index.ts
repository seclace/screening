import { createStore } from 'redux';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { createFirestoreInstance } from 'redux-firestore';
import rootReducer from './rootReducer';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);
firebase.firestore();

export function configureStore () {
  const initialState = {};
  const store = createStore(rootReducer, initialState);

  const rrfProps = {
    firebase,
    config: {},
    dispatch: store.dispatch,
    createFirestoreInstance
  };

  return {
    store,
    rrfProps,
  }
}
