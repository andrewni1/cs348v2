import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css'

function Home() {
  const [states, setStates] = useState([]);
  const [citiesByState, setCitiesByState] = useState({});
  const [selectedCityData, setSelectedCityData] = useState(null);
  const [editingState, setEditingState] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);
  const [operator, setOperator] = useState('=');
  const [originalOperator, setOriginalOperator] = useState('=');
  const [originalReportValue, setOriginalReportValue] = useState('');
  const [originalFilter, setOriginalFilter] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('population');
  const [reportValue, setReportValue] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedOriginalState, setSelectedOriginalState] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    const fetchStatesAndCities = async () => {
      try {
        const statesResponse = await axios.get('https://cs348v2-server.vercel.app/states');
        setStates(statesResponse.data);

        const citiesByStateData = {};
        for (const state of statesResponse.data) {
          const citiesResponse = await axios.get(`https://cs348v2-server.vercel.app/cities/${state._id}`);
          citiesByStateData[state._id] = citiesResponse.data;
        }
        setCitiesByState(citiesByStateData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchStatesAndCities();
  }, []);

  const handleDeleteState = async (stateId) => {
    try {
      await axios.delete(`https://cs348v2-server.vercel.app/states/${stateId}`);
      const updatedStates = states.filter(state => state._id !== stateId);
      setStates(updatedStates);
    } catch (error) {
      console.error('Failed to delete state:', error);
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      await axios.delete(`https://cs348v2-server.vercel.app/cities/${cityId}`);
      const updatedCities = citiesByState[selectedCityData.state].filter(city => city._id !== cityId);
      setCitiesByState(prevState => ({
        ...prevState,
        [selectedCityData.state]: updatedCities
      }));
      setSelectedCityData('');
    } catch (error) {
      console.error('Failed to delete city:', error);
    }
  };

  const handleCityChange = async (event, stateId) => {
    const selectedCityId = event.target.value;
    // Find the selected city data
    const selectedCity = citiesByState[stateId].find(city => city._id === selectedCityId);
    setSelectedCityData(selectedCity);
  };

  const handleUpdateState = async (stateId, newName, newPopulation, newCapital) => {
    try {
      // Call update API
      await axios.put(`https://cs348v2-server.vercel.app/states/${stateId}`, {
        name: newName,
        population: newPopulation,
        capital: newCapital
      });
      // Reload states data after update
      const updatedStatesResponse = await axios.get('https://cs348v2-server.vercel.app/states');
      setStates(updatedStatesResponse.data);
      setEditingState(false);
    } catch (error) {
      console.error('Failed to update state:', error);
    }
  };

  const handleUpdateCity = async (cityId, newName, newPopulation, newZipCode) => {
    try {
      // Call update API
      await axios.put(`https://cs348v2-server.vercel.app/cities/${cityId}`, {
        name: newName,
        population: newPopulation,
        zipCode: newZipCode
      });
      // Reload cities data after update
      const updatedCitiesResponse = await axios.get(`https://cs348v2-server.vercel.app/cities/${selectedCityData.state}`);
      setCitiesByState(prevState => ({
        ...prevState,
        [selectedCityData.state]: updatedCitiesResponse.data
      }));
      setEditingCity(false);
    } catch (error) {
      console.error('Failed to update city:', error);
    }
  };
  
  const handleReportSubmit = async () => {
    try {
      const endpoint = selectedFilter === 'population' ? '/population-report' : '/city-report';
      const response = await axios.get(`https://cs348v2-server.vercel.app${endpoint}?${selectedFilter}=${reportValue}&operator=${operator}`);
      setFilteredStates(response.data);
      setOriginalFilter(selectedFilter)
      setOriginalReportValue(reportValue);
      setOriginalOperator(operator);
      console.log(response.data)
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };
  
  const handleCityReportSubmit = async () => {
    try {
      if (!selectedState) {
        console.error('Please select a state.');
        return;
      }
      const selectedStateId = states.find(state => state.name === selectedState)?._id;
      if (!selectedStateId) {
        console.error('Selected state not found.');
        return;
      }
      const response = await axios.get(`https://cs348v2-server.vercel.app/cities/${selectedStateId}`);
      setFilteredCities(response.data);
      setSelectedOriginalState(selectedState);
    } catch (error) {
      console.error('Failed to fetch city report:', error);
    }
  };
  
  return (
    <div className='outer-container'>
      <h1>States and Cities</h1>
      {states.map((state) => (
        <div key={state._id} className="state-container">
          <p className="state-name">
            {editingState === state._id ? (
              <>
                <label>State Name: </label>
                <input
                  type="text"
                  value={state.name}
                  onChange={(e) =>
                    setStates((prevState) =>
                      prevState.map((s) =>
                        s._id === state._id ? { ...s, name: e.target.value } : s
                      )
                    )
                  }
                />
              </>
            ) : (
              state.name
            )}
          </p>
          {editingState === state._id ? (
            <>
              <div>
                <label>Population: </label>
                <input
                  type="number"
                  value={state.population}
                  onChange={(e) =>
                    setStates((prevState) =>
                      prevState.map((s) =>
                        s._id === state._id ? { ...s, population: e.target.value } : s
                      )
                    )
                  }
                />
              </div>
              <div>
                <label>Capital: </label>
                <input
                  type="text"
                  value={state.capital}
                  onChange={(e) =>
                    setStates((prevState) =>
                      prevState.map((s) =>
                        s._id === state._id ? { ...s, capital: e.target.value } : s
                      )
                    )
                  }
                />
              </div>
            </>
          ) : (
            <>
              <p className="state-pop">Population: {state.population}</p>
              <p className="state-cap">Capital: {state.capital}</p>
            </>
          )}
          <div className="last-row">
            <div>
              <label htmlFor={`cities-${state._id}`}>Select a City: </label>
              <select
                id={`cities-${state._id}`}
                onChange={(event) => handleCityChange(event, state._id)}
              >
                <option value="">-- Select City --</option>
                {citiesByState[state._id] &&
                  citiesByState[state._id].map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  if (editingState === state._id) {
                    handleUpdateState(state._id, state.name, state.population, state.capital);
                  }
                  setEditingState(editingState === state._id ? null : state._id);
                }}
              >
                {editingState === state._id ? "Save" : "Edit"}
              </button>
              <button onClick={() => handleDeleteState(state._id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
      {selectedCityData && (
        <div className='city-container'>
          <p className='city-name'>
            {editingCity ? (
              <div>
                <label>Name: </label>
                <input type="text" value={selectedCityData.name} onChange={(e) => setSelectedCityData(prevState => ({ ...prevState, name: e.target.value }))} />
              </div>
            ) : (
              selectedCityData.name
            )}
          </p>
          {editingCity ? (
            <>
              <div>
                <label>Population: </label>
                <input type="number" value={selectedCityData.population} onChange={(e) => setSelectedCityData(prevState => ({ ...prevState, population: e.target.value }))} />
                <br/>
                <label>Zip Code: </label>
                <input type="text" value={selectedCityData.zipCode} onChange={(e) => setSelectedCityData(prevState => ({ ...prevState, zipCode: e.target.value }))} />
              </div>
            </>
          ) : (
            <>
              <p>Population: {selectedCityData.population}</p>
              <p>Zip Code: {selectedCityData.zipCode}</p>
            </>
          )}
          <div className='city-buttons'>
            <button onClick={() => {
              if (editingCity) {
                handleUpdateCity(selectedCityData._id, selectedCityData.name, selectedCityData.population, selectedCityData.zipCode);
              }
              setEditingCity(prevState => !prevState);
            }}>
              {editingCity ? 'Save' : 'Edit'}
            </button>
            <button onClick={() => handleDeleteCity(selectedCityData._id)}>Delete</button>
          </div>
        </div>
      )}
      <div className='add-buttons'>
        <Link to="/add-state" className='add-state'>
          <button>Add State</button>
        </Link>
        <Link to="/add-city" className='add-city'>
          <button>Add City</button>
        </Link>
      </div>
      <div className="population-filter">
        <label>Create State Report:</label>
        <input type="number" placeholder='Enter value...' value={reportValue} onChange={(e) => setReportValue(e.target.value)} />
        <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
          <option value="population">Population</option>
          <option value="cityCount">City Count</option>
        </select>
        <select value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="=">=</option>
          <option value="<">&lt;</option>
          <option value="<=">&le;</option>
          <option value=">=">&ge;</option>
          <option value=">">&gt;</option>
        </select>
        <button onClick={handleReportSubmit}>Create</button>
      </div>
      {filteredStates.length > 0 && (
        <div className="table-container">
          <h2>States with {originalFilter === 'population' ? 'population' : 'city count'} {originalOperator} {originalReportValue}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Population</th>
                <th>Capital</th>
                <th>Cities</th>
              </tr>
            </thead>
            <tbody>
              {filteredStates.map(state => (
                <tr key={state._id}>
                  <td>{state.name}</td>
                  <td>{state.population.toLocaleString()}</td>
                  <td>{state.capital}</td>
                  <td>{state.numCities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="population-filter">
        <label>Create Cities Report:</label>
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
          <option value="">-- Select State --</option>
          {states.map(state => (
            <option key={state._id} value={state.name}>{state.name}</option>
          ))}
        </select>
        <button onClick={handleCityReportSubmit}>Create</button>
      </div>
      {filteredCities.length > 0 && (
        <div className="table-container">
          <h2>Cities in {selectedOriginalState}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Population</th>
                <th>Zip Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.map(city => (
                <tr key={city._id}>
                  <td>{city.name}</td>
                  <td>{city.population.toLocaleString()}</td>
                  <td>{city.zipCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Home;
