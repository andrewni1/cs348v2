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
    <div className='outer-container'>
      <h2>Add New City</h2>
      <form onSubmit={handleSubmit}>
        <label>
          City Name:
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            required='true'
          />
        </label>
        <br/>
        <label>
          Population:
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === '-') {
                e.preventDefault();
              }
            }}
            required='true'
          />
        </label>
        <br/>
        <label>
          Zip Code:
          <input
            type="number"
            value={zipCode}
            onChange={(e) => {
              const value = e.target.value.slice(0, 5);
              setZipCode(value);
            }}
            onKeyDown={(e) => {
              if (e.key === '-') {
                e.preventDefault();
              }
            }}
            required='true'
          />
        </label>
        <br/>
        <label>
          State:
          <select value={stateId} onChange={(e) => setStateId(e.target.value)} required='true'>
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state._id} value={state._id}>{state.name}</option>
            ))}
          </select>
        </label>
        <br/>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default AddCity;
