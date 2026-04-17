import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  // Global top navigation bar.
  // Receives: no props.
  // Sends: no data directly; it only triggers route changes through React Router.
  // Renders: the app logo, page links, and a simple guest user block.
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <span className="logo">
            <span className="logo-icon">B</span>
            BookShelf
          </span>
        </div>

        <div className="navbar-center">
          {/* NavLink uses isActive to apply the active-route class automatically. */}
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Discover
          </NavLink>
          <NavLink
            to="/my-books"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            My Library
          </NavLink>
        </div>

        <div className="navbar-right">
          <div className="user-info">
            <span className="user-avatar">U</span>
            <span>Guest</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
