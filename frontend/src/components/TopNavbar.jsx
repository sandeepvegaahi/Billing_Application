

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notifyAuthChange } from "../utils/authEvents";
import Swal from "sweetalert2";

const TopNavbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const SESSION_LIMIT = 30 * 60 * 1000; 

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    const loginTime = localStorage.getItem("loginTime");

    if (token && loginTime) {
      const now = new Date().getTime();
      if (now - loginTime > SESSION_LIMIT) {
       
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("loginTime");
        setIsLoggedIn(false);
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again",
        });
      } else {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
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
    localStorage.removeItem("loginTime");

    notifyAuthChange(); 
    setIsLoggedIn(false);
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

