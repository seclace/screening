import { User } from '../../Users/types';

export interface State {
  firestore: firebase.firestore.Firestore & {
    ordered: {
      users: Array<User>,
    },
  }
}
