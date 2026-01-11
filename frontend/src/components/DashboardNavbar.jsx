import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../Styles/dashboard.css";

const DashboardNavbar = () => {
  return (
    <Nav className="flex-column p-3 shadow-sm sidebar" style={{ minWidth: "200px", backgroundColor: "#f8f9fa" }}>

      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard/students/view"
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Students
      </NavLink>

      <NavLink
        to="/dashboard/bulk-upload"
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Bulk Upload
      </NavLink>

      <NavLink
        to="/dashboard/fee-payment"
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Fee Payment
      </NavLink>

      <NavLink
        to="/dashboard/fee-structure"
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Fee Structure
      </NavLink>

      <NavLink
        to="/dashboard/fee-reports"
        className={({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link")}
      >
        Fee Reports
      </NavLink>

    </Nav>
  );
};

export default DashboardNavbar;
