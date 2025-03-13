import React, { useState, useEffect } from 'react';
import { User } from '../../types';

/**
 * Component for updating an existing user
 * 
 * @returns {JSX.Element} The rendered UpdateUser component
 */
const UpdateUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  const [age, setAge] = useState<string>('');

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
    const userId = e.target.value;
    setSelectedUserId(userId);
    
    if (userId) {
      const selectedUser = users.find(user => user.id === userId);
      if (selectedUser) {
        setName(selectedUser.name);
        setCollege(selectedUser.college);
        setAge(selectedUser.age.toString());
      }
    } else {
      // Reset form if no user is selected
      setName('');
      setCollege('');
      setAge('');
    }
  };

  /**
   * Handle form submission to update a user
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - The form event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      alert('Please select a user to update');
      return;
    }
    
    try {
      const response = await fetch(`/update/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, college, age: parseInt(age) }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User updated:', data);
        alert('User updated successfully!');
        
        // Refresh the user list
        const usersResponse = await fetch('/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
      } else {
        const errorData = await response.json();
        console.error('Error updating user:', errorData);
        alert('Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  return (
    <div>
      <h1>Update User</h1>
      
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
      
      {selectedUserId && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="college">College:</label>
            <input 
              type="text" 
              id="college"
              value={college} 
              onChange={(e) => setCollege(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="age">Age:</label>
            <input 
              type="number" 
              id="age"
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              required 
              min="1"
              max="120"
            />
          </div>
          
          <button type="submit">Update User</button>
        </form>
      )}
    </div>
  );
};

export default UpdateUser; 