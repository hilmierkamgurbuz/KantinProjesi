import React from 'react'
import ReactDOM from 'react-dom/client'
import Uygulama from './Uygulama.tsx'
import './index.css'
import { YetkilendirmeSaglayici } from './context/YetkilendirmeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <YetkilendirmeSaglayici>
      <Uygulama />
    </YetkilendirmeSaglayici>
  </React.StrictMode>,
)