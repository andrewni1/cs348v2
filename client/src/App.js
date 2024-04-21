import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import AddCity from './AddCity';
import AddState from './AddState';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-city" element={<AddCity />} />
        <Route path="/add-state" element={<AddState />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
