import React, { useState, useEffect } from 'react';
import { User } from '../../types';

/**
 * Component for displaying a list of users
 * 
 * @returns {JSX.Element} The rendered UserList component
 */
const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  /**
   * Fetch users from the backend when the component mounts
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Error fetching users');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user, index) => (
          <li key={user.id || index}>
            {user.name} - {user.college} - {user.age}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList; 