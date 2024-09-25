import React, { useState } from 'react';

function DeleteUser() {
  const [id, setId] = useState('');

  const handleDeleteUser = async () => {
    try {
      const response = await fetch('/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      console.log(data); // Log success message
      // Optionally: Fetch updated list of users after deletion
      // fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h1>Delete User</h1>
      <form onSubmit={handleDeleteUser}>
        <label>
          User ID:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <br />
        <button type="submit">Delete User</button>
      </form>
    </div>
  );
}

export default DeleteUser;