import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StrictMode } from 'react'
import "./tailwind.css";
//import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
