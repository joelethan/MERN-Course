import React from 'react';
import { Button } from 'react-bootstrap';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My react App</h1>
        <Button variant="success">Success</Button>
        <i className="fas fa-camera"></i>
      </header>
    </div>
  );
}

export default App;
