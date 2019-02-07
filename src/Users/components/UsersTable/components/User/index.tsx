import React from 'react';
import { User as UserType } from '../../../../types';
import { formatLastActive } from '../../../../utils';

interface UserProps {
  user: UserType,
}

function User ({ user }: UserProps) {
  return (
    <tr className='users-record' key={user.id}>
      <td>{user.id}</td>
      <td>{user.firstName}</td>
      <td>{user.surname}</td>
      <td>{user.email}</td>
      <td>{}</td>
      <td>{user.account.residenceCountry}</td>
      <td>{user.account.residenceCity}</td>
      <td>{formatLastActive(user.lastActive)}</td>
    </tr>
  )
}

export default User;
