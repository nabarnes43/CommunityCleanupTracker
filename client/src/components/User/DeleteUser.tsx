import React, { useState, useEffect } from 'react';
import { User } from '../../types';

/**
 * Component for deleting an existing user
 * 
 * @returns {JSX.Element} The rendered DeleteUser component
 */
const DeleteUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

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

  /**
   * Handle user selection change
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
  };

  /**
   * Handle user deletion
   */
  const handleDelete = async () => {
    if (!selectedUserId) {
      alert('Please select a user to delete');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`/delete/${selectedUserId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('User deleted successfully');
        alert('User deleted successfully!');
        
        // Remove the deleted user from the state
        setUsers(users.filter(user => user.id !== selectedUserId));
        setSelectedUserId('');
      } else {
        const errorData = await response.json();
        console.error('Error deleting user:', errorData);
        alert('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  return (
    <div>
      <h1>Delete User</h1>
      
      <div>
        <label htmlFor="userSelect">Select User:</label>
        <select 
          id="userSelect"
          value={selectedUserId} 
          onChange={handleUserSelect}
        >
          <option value="">-- Select a user --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.college} - {user.age}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleDelete} 
        disabled={!selectedUserId}
        style={{ marginTop: '20px', backgroundColor: '#ff4d4d' }}
      >
        Delete User
      </button>
    </div>
  );
};

export default DeleteUser; 