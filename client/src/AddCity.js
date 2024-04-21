import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddCity = () => {
  const [cityName, setCityName] = useState('');
  const [population, setPopulation] = useState('');
  const [stateId, setStateId] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/states');
        setStates(response.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/create-city', {
        name: cityName,
        population: population,
        state: stateId,
        zipCode: zipCode
      });

      if (response.status === 201) {
        console.log('City created successfully');
        document.location.href="/";
      } else {
        console.error('Failed to create city');
      }
    } catch (error) {
      console.error('Error creating city:', error);
    }
  };

  return (
    <div>
      <h2>Add New City</h2>
      <form onSubmit={handleSubmit}>
        <label>
          City Name:
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
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
          Zip Code:
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </label>
        <label>
          State:
          <select value={stateId} onChange={(e) => setStateId(e.target.value)}>
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state._id} value={state._id}>{state.name}</option>
            ))}
          </select>
        </label>
        <button type="submit">Create City</button>
      </form>
    </div>
  );
};

export default AddCity;
