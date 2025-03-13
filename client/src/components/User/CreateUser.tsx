import React, { useState } from 'react';

/**
 * Component for creating a new user
 * 
 * @returns {JSX.Element} The rendered CreateUser component
 */
const CreateUser: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  const [age, setAge] = useState<string>('');

  /**
   * Handle form submission to create a new user
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - The form event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, college, age: parseInt(age) }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User created:', data);
        
        // Reset form
        setName('');
        setCollege('');
        setAge('');
        
        alert('User created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error creating user:', errorData);
        alert('Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  return (
    <div>
      <h1>Create User</h1>
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
        
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default CreateUser; 