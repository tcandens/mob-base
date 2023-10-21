import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { murmur } from 'mob-base'
import './index.css'

globalThis.murmur = murmur

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
