import React from 'react';
import axios from 'axios';

interface LoginProps {
  entryStatus: boolean,
  setStatus: React.Dispatch<React.SetStateAction<boolean>>,
  username: string,
  setUsername: React.Dispatch<React.SetStateAction<string>>,
  password: string,
  setPassword: React.Dispatch<React.SetStateAction<string>>,
}

const Login: React.FC<LoginProps> = (props:LoginProps) => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://localhost:3001/login', 
        { username:props.username, password:props.password }, 
      );
      console.log('Login successful:', response.data);
      props.setStatus(true)
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      {!props.entryStatus ? (<>
        <div style={{ backgroundColor: 'lightcoral', padding: '10px', marginBottom: '10px' }}>
          Please log in to continue.
        </div>
        <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={props.username}
                onChange={(e) => props.setUsername(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={props.password}
                onChange={(e) => props.setPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 15px' }}>
              Login
            </button>
          </form>
        </div>
      </>) : <></>}
    </>
  );
};

export default Login;