import React, { useState } from 'react';

function CreateUser() {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [age, setAge] = useState('');

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, college, age: parseInt(age) }),
      });
      const data = await response.json();
      console.log(data); // Log success message
      // Optionally: Trigger a refetch of the user list after creation
      // fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div>
      <h1>Create User</h1>
      <form onSubmit={handleCreateUser}>
        <label>
          Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <br />
        <label>
          College:
          <input type="text" value={college} onChange={e => setCollege(e.target.value)} />
        </label>
        <br />
        <label>
          Age:
          <input type="number" value={age} onChange={e => setAge(e.target.value)} />
        </label>
        <br />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

export default CreateUser;