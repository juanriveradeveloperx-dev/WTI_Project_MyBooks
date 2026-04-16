import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        
        <div className="navbar-left">
          <span className="logo">📚 MyBookShelf</span>
        </div>

        <div className="navbar-center">
          <Link to="/">Search</Link>
          <Link to="/my-books">My Books</Link>
        </div>

        <div className="navbar-right">
          User: Mock User
        </div>

      </div>
    </nav>
  );
}

export default Navbar;