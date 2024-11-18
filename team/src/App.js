import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Projects from './components/Projects';

function App() {
  

  return (
    <>
      <Navbar/>
      <Projects/>
    <Footer/>
      
    </>
  );
}

export default App;
