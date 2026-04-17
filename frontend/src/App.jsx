import "./styles/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { SavedBooksProvider } from "./context/SavedBooksContext";
import { UserProvider } from "./context/UserContext";
import MyBooksPage from "./pages/MyBooksPage";
import SearchPage from "./pages/SearchPage";

function App() {
  // Root frontend component.
  // Receives: no props.
  // Renders: providers, router, navbar, and the active page.
  // Purpose: define the global application shell.
  return (
    <UserProvider>
      <SavedBooksProvider>
        <BrowserRouter>
          <div className="app-container">
            {/* Navbar stays visible across the whole application. */}
            <Navbar />

            {/* This container renders the page selected by React Router. */}
            <div className="page-content">
              <Routes>
                {/* Main search / discover page. */}
                <Route path="/" element={<SearchPage />} />

                {/* User saved-library page. */}
                <Route path="/my-books" element={<MyBooksPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </SavedBooksProvider>
    </UserProvider>
  );
}

export default App;
