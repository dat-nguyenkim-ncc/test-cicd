import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import OktaAuthRouter from './OktaAuthRouter'

const App = () => (
  <Router>
    <OktaAuthRouter />
  </Router>
)

export default App
