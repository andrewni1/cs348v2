import React, { useState } from 'react';
import axios from 'axios';

const AddState = () => {
  const [stateName, setStateName] = useState('');
  const [population, setPopulation] = useState('');
  const [capital, setCapital] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/create-state', {
        name: stateName,
        population: population,
        capital: capital
      });

      if (response.status === 201) {
        console.log('State created successfully');
        document.location.href="/";
      } else {
        console.error('Failed to create state');
      }
    } catch (error) {
      console.error('Error creating state:', error);
    }
  };

  return (
    <div>
      <h2>Add New State</h2>
      <form onSubmit={handleSubmit}>
        <label>
        State Name:
          <input
            type="text"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
        </label>
        <label>
          Population:
          <input
            type="text"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />
        </label>
        <label>
          Capital:
          <input
            type="text"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
          />
        </label>
        <button type="submit">Create State</button>
      </form>
    </div>
  );
};

export default AddState;
