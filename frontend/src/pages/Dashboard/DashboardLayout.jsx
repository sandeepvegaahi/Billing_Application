import { Outlet } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import "../../Styles/dashboard.css";

const DashboardLayout = () => {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <div className="flex-grow-1 d-flex">
        <DashboardNavbar />
        <div className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
