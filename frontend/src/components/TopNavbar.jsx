import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notifyAuthChange } from "../utils/authEvents";

const TopNavbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();

    window.addEventListener("authChange", checkAuth);
    return () => {
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");

    // 🔥 Update navbar immediately
    notifyAuthChange();

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">MyApp</Link>

      <ul className="navbar-nav ms-auto align-items-center">
        <li className="nav-item">
          <Link className="nav-link" to="/">Home</Link>
        </li>

        {!isLoggedIn ? (
          <li className="nav-item">
            <Link className="nav-link" to="/login">Login</Link>
          </li>
        ) : (
          <li className="nav-item">
            <button
              className="btn btn-danger btn-sm ms-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default TopNavbar;
