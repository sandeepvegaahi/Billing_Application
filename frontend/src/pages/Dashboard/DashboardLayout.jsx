import { Outlet } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import Footer from "../../components/Footer";

const DashboardLayout = () => {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <div className="flex-grow-1 d-flex">
        {/* Sidebar */}
        <DashboardNavbar />

        {/* Main Content */}
        <div className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
