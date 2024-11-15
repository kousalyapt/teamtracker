import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  

  return (
    <>
      <Navbar/>
      <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <Footer/>
      
    </>
  );
}

export default App;
