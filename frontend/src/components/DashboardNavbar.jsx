import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const DashboardNavbar = () => {
  return (
    <Nav className="flex-column bg-light p-3 shadow-sm" style={{ minWidth: "200px" }}>
      <Nav.Link as={NavLink} to="/dashboard" end>
        Dashboard
      </Nav.Link>
      <Nav.Link as={NavLink} to="/dashboard/students/view">
        Students
      </Nav.Link>
      <Nav.Link as={NavLink} to="/dashboard/bulk-upload">
        Bulk Upload
      </Nav.Link>
      <Nav.Link as={NavLink} to="/dashboard/fee-payment">
        Fee Payment
      </Nav.Link>
      <Nav.Link as={NavLink} to="/dashboard/fee-structure">
        Fee Structure
      </Nav.Link>
      <Nav.Link as={NavLink} to="/dashboard/fee-reports">
        Fee Reports
      </Nav.Link>
    </Nav>
  );
};

export default DashboardNavbar;
