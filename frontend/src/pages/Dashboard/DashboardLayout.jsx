import { Outlet } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import Footer from "../../components/Footer";

const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
    
      <div className="flex-grow-1 d-flex flex-column">
        <div className="container mt-4 flex-grow-1 d-flex flex-column">
          
          <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-primary text-white rounded shadow-sm">
            <h3 className="mb-0">Admin Dashboard</h3>
          </div>

          <DashboardNavbar />

          
          <div className="p-4 bg-light rounded shadow-sm flex-grow-1">
            <Outlet />
          </div>
        </div>
      </div>

      
      
    </div>
  );
};

export default DashboardLayout;
