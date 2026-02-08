// src/components/Layout.jsx
import { NavLink, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Optional: clear other stored data if you have
    // localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        {/* Clickable brand name → Dashboard */}
        <NavLink
          to="/dashboard"
          className="navbar-brand"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Task Manager
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Projects
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Profile
          </NavLink>

          <button className="nav-link logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
