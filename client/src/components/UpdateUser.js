import React, { useState } from 'react';

function UpdateUser() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [age, setAge] = useState('');

  const handleUpdateUser = async () => {
    try {
      const response = await fetch('/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, college, age: parseInt(age), name}),
      });
      const data = await response.json();
      console.log(data); // Log success message
      // Optionally: Trigger a refetch of the user list after update
      // fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <h1>Update User</h1>
      <form onSubmit={handleUpdateUser}>
        <label>
          User ID:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <br />
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
        <button type="submit">Update User</button>
      </form>
    </div>
  );
}

export default UpdateUser;