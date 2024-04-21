const express = require('express');
const router = express.Router();
const State = require('./models/State');
const City = require('./models/City');

// Fetching all states
router.get('/states', async (req, res) => {
  try {
    const states = await State.find({});
    const serializedStates = states.map(state => ({
      ...state.toObject(),
      _id: state._id.toString()
    }));
    res.status(200).json(serializedStates);
  } catch (error) {
    console.error('Failed to fetch states:', error);
    res.status(500).json({ error: 'Failed to fetch states', message: error.message });
  }
});

// Creating state
router.post('/create-state', async (req, res) => {
  try {
    const { name, population, capital } = req.body;
    
    const newState = new State({ name, population, capital });
    await newState.save();
    
    res.status(201).json({ message: 'State created successfully', state: newState });
  } catch (error) {
    console.error('Failed to create state:', error);
    res.status(500).json({ error: 'Failed to create state', message: error.message });
  }
});

// Delete a state and its associated cities
router.delete('/states/:stateId', async (req, res) => {
  try {
    const stateId = req.params.stateId;

    // Delete the state
    await State.findByIdAndDelete(stateId);

    // Delete the cities associated with the state
    await City.deleteMany({ state: stateId });

    res.status(200).json({ message: 'State and associated cities deleted successfully' });
  } catch (error) {
    console.error('Failed to delete state and cities:', error);
    res.status(500).json({ error: 'Failed to delete state and cities', message: error.message });
  }
});

// Update a state by ID
router.put('/states/:stateId', async (req, res) => {
  try {
    const stateId = req.params.stateId;
    const { name, population, capital } = req.body;

    const updatedState = await State.findByIdAndUpdate(stateId, { name, population, capital }, { new: true });

    res.status(200).json(updatedState);
  } catch (error) {
    console.error('Failed to update state:', error);
    res.status(500).json({ error: 'Failed to update state', message: error.message });
  }
});

// Create report based on population
router.get('/population-report', async (req, res) => {
  try {
    const { population, operator } = req.query;

    const populationNumber = parseInt(population);

    let pipeline = [];

    switch (operator) {
      case '<':
        pipeline = [
          { $match: { population: { $lt: populationNumber } } }
        ];
        break;
      case '<=':
        pipeline = [
          { $match: { population: { $lte: populationNumber } } }
        ];
        break;
      case '=':
        pipeline = [
          { $match: { population: populationNumber } }
        ];
        break;
      case '>=':
        pipeline = [
          { $match: { population: { $gte: populationNumber } } }
        ];
        break;
      case '>':
        pipeline = [
          { $match: { population: { $gt: populationNumber } } }
        ];
        break;
      default:
        throw new Error('Invalid operator');
    }

    pipeline.push({
      $lookup: {
        from: 'cities',
        localField: '_id',
        foreignField: 'state',
        as: 'cities'
      }
    });

    pipeline.push({
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        population: { $first: '$population' },
        capital: { $first: '$capital' },
        numCities: { $sum: { $size: '$cities' } }
      }
    });

    const filteredStates = await State.aggregate(pipeline);

    res.json(filteredStates);
  } catch (error) {
    console.error('Failed to fetch population report:', error);
    res.status(500).json({ error: 'Failed to fetch population report', message: error.message });
  }
});

// Creating a city
router.post('/create-city', async (req, res) => {
  try {
    const { name, population, zipCode, state } = req.body;

    const newCity = new City({ name, population, zipCode, state });
    await newCity.save();

    res.status(201).json({ message: 'City created successfully', city: newCity });
  } catch (error) {
    console.error('Failed to create city:', error);
    res.status(500).json({ error: 'Failed to create city', message: error.message });
  }
});

// Fetch cities by state ID
router.get('/cities/:stateId', async (req, res) => {
  try {
    const stateId = req.params.stateId;
    const cities = await City.find({ state: stateId });
    res.status(200).json(cities);
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities', message: error.message });
  }
});

// Delete a city by ID
router.delete('/cities/:cityId', async (req, res) => {
  try {
    const cityId = req.params.cityId;

    await City.findByIdAndDelete(cityId);

    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Failed to delete city:', error);
    res.status(500).json({ error: 'Failed to delete city', message: error.message });
  }
});

// Update a city by ID
router.put('/cities/:cityId', async (req, res) => {
  try {
    const cityId = req.params.cityId;
    const { name, population, zipCode } = req.body;

    const updatedCity = await City.findByIdAndUpdate(cityId, { name, population, zipCode }, { new: true });

    res.status(200).json(updatedCity);
  } catch (error) {
    console.error('Failed to update city:', error);
    res.status(500).json({ error: 'Failed to update city', message: error.message });
  }
});

// Create report based on number of cities
router.get('/city-report', async (req, res) => {
  try {
    const { cityCount, operator } = req.query;

    const cityCountNumber = parseInt(cityCount);

    let pipeline = [];

    switch (operator) {
      case '<':
        pipeline = [
          { $lookup: { from: 'cities', localField: '_id', foreignField: 'state', as: 'cities' } },
          { $addFields: { numCities: { $size: '$cities' } } },
          { $match: { numCities: { $lt: cityCountNumber } } }
        ];
        break;
      case '<=':
        pipeline = [
          { $lookup: { from: 'cities', localField: '_id', foreignField: 'state', as: 'cities' } },
          { $addFields: { numCities: { $size: '$cities' } } },
          { $match: { numCities: { $lte: cityCountNumber } } }
        ];
        break;
      case '=':
        pipeline = [
          { $lookup: { from: 'cities', localField: '_id', foreignField: 'state', as: 'cities' } },
          { $addFields: { numCities: { $size: '$cities' } } },
          { $match: { numCities: cityCountNumber } }
        ];
        break;
      case '>=':
        pipeline = [
          { $lookup: { from: 'cities', localField: '_id', foreignField: 'state', as: 'cities' } },
          { $addFields: { numCities: { $size: '$cities' } } },
          { $match: { numCities: { $gte: cityCountNumber } } }
        ];
        break;
      case '>':
        pipeline = [
          { $lookup: { from: 'cities', localField: '_id', foreignField: 'state', as: 'cities' } },
          { $addFields: { numCities: { $size: '$cities' } } },
          { $match: { numCities: { $gt: cityCountNumber } } }
        ];
        break;
      default:
        throw new Error('Invalid operator');
    }

    const filteredStates = await State.aggregate(pipeline);

    res.json(filteredStates);
  } catch (error) {
    console.error('Failed to fetch city report:', error);
    res.status(500).json({ error: 'Failed to fetch city report', message: error.message });
  }
});

module.exports = router;