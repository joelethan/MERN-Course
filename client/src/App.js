import React from 'react';

import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { Provider } from 'react-redux';
import store from './store';
import jwt_decode from 'jwt-decode';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import setAuthHeader from './utils/setAuthHeader';
import { setCurrentUser } from './actions/authActions';

if(localStorage.jwtToken){
  // set Auth header
  setAuthHeader(localStorage.jwtToken)
  // Decode token to get user data
  const decoded = jwt_decode(localStorage.jwtToken)
  // set current user
  store.dispatch(setCurrentUser(decoded))
} 
 
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar/>
          <Route exact path="/" component={ Landing } />
          <div className="container">
            <Route exact path="/register" component={ Register } />
            <Route exact path="/login" component={ Login } />
          </div>
          <Footer/>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
