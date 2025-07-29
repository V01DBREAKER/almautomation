import React, {useState} from 'react';
import type { loginCredentials } from '../almAPI/almAuth';
import { useAuth } from '../hooks/AuthProvider';
import { Navigate } from 'react-router';
import './App.css'

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<loginCredentials>({
    username:'', password:''
  });

  const auth = useAuth();

  const login = (e:React.FormEvent) => {
    e.preventDefault();
    auth?.login(credentials)
  }
  return (
    auth?.token === "" ? (
    <>
      <div style={{ backgroundColor: 'lightcoral', padding: '10px', marginBottom: '10px' }}>
        Please log in to continue.
      </div>
      <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px' }}>
        <form onSubmit={login}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev=>({username:e.target.value, password:prev.password}))}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev=>({username:prev.username, password:e.target.value}))}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 15px' }}>
            Login
          </button>
        </form>
      </div>
    </>
  ) : <Navigate to="/" />);
};

export default Login;