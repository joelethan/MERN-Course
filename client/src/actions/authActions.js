import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthHeader from '../utils/setAuthHeader';

import { GET_ERRORS, SET_CURRENT_USER } from './types';

// Register User
export const registerUser = (userData, history) => dispatch => {
    axios.post('/api/user/register', userData)
        .then(res => history.push('/login'))
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

// Login user
export const loginUser = userData => dispatch => {
    axios.post('/api/user/login', userData)
        .then(res=> {
            // Get token
            const { token } = res.data;
            // Set token to local storage
            localStorage.setItem('jwtToken', token)
            // Set token in Auth header
            setAuthHeader(token)
            // decode token to get user data
            const decoded = jwt_decode(token);
            // set current user
            dispatch(setCurrentUser(decoded));
        })
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}
