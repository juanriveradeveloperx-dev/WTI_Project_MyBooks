import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import "./styles/App.css"
import SearchPage from './pages/SearchPage'
import MyBooksPage from './pages/MyBooksPage'
import Navbar from './components/Navbar'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SavedBooksProvider } from "./context/SavedBooksContext";


function App() {
  return (
    <SavedBooksProvider>
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        
        <div className="page-content">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/my-books" element={<MyBooksPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </SavedBooksProvider>
  );
}

export default App
