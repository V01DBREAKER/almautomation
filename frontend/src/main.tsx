import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import Routes from './routes/Routes';
import AuthProvider from './hooks/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes/>
      </AuthProvider>
    </BrowserRouter>  
  </StrictMode>,
)
