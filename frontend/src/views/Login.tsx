import React, {useState} from 'react';
import type { loginCredentials } from '../almAPI/almAuth';
import { useAuth } from '../hooks/AuthProvider';
import { Navigate } from 'react-router';

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
    <div className='fixed left-0 top-0 h-full w-full place-content-center p-[0.5rem] @container-[size]'>
      <div className="text-center place-self-center min-w-[300px]" style={{ backgroundColor: 'lightcoral', padding: '10px', marginBottom: '10px' }}>
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
              className='border-black border-1 rounded-sm'
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
              className='border-black border-1 rounded-sm'
              onChange={(e) => setCredentials(prev=>({username:prev.username, password:e.target.value}))}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button
            className='flex justify-center place-self-center min-w-[100px] px-[10px] my-[15px] py-[5px] hover:border-black hover:border-1 hover:rounded-lg' 
            type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  ) : <Navigate to="/" />);
};

export default Login;