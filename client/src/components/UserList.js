import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/user/users');
      const data = await response.json();
      setUsers(data); // Assuming data is an array of user objects
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h1>UserList</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            Name: {user.name} - College: {user.college} - Age: {user.age} - ID: {user.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;