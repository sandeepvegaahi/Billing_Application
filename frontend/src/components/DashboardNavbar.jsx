// src/components/DashboardNavbar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";

const DashboardNavbar = () => {
  const location = useLocation(); 

  return (
    <Nav variant="tabs" className="mb-4">
      <Nav.Item>
        <Nav.Link
          as={NavLink}
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Upload
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link
          as={NavLink}
          to="/dashboard/view"
          className={location.pathname === "/dashboard/view" ? "active" : ""}
        >
          View
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link
          as={NavLink}
          to="/dashboard/add"
          className={location.pathname === "/dashboard/add" ? "active" : ""}
        >
          Add
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link
          as={NavLink}
          to="/dashboard/edit"
          className={location.pathname === "/dashboard/edit" ? "active" : ""}
        >
          Edit
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link
          as={NavLink}
          to="/dashboard/delete"
          className={location.pathname === "/dashboard/delete" ? "active" : ""}
        >
          Delete
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default DashboardNavbar;
