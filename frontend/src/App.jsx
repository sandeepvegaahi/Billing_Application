import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import DashboardUpload from "./pages/Dashboard/DashboardUpload";

import ViewPage from "./pages/Dashboard/Students/ViewPage";
import AddPage from "./pages/Dashboard/Students/AddPage";
import EditPage from "./pages/Dashboard/Students/EditPage";
import DeletePage from "./pages/Dashboard/Students/DeletePage";

import FeeStructurePage from "./pages/Dashboard/FeeStructurePage";
import FeeTransactionPage from "./pages/Dashboard/FeeTransactionPage";
import ReportsPage from "./pages/Dashboard/ReportsPage";

import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/layout.css";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <TopNavbar />

      <div className="app-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="students/view" element={<ViewPage />} />
            <Route path="students/add" element={<AddPage />} />
            <Route path="students/edit" element={<EditPage />} />
            <Route path="students/delete" element={<DeletePage />} />

            <Route path="bulk-upload" element={<DashboardUpload />} />
            <Route path="fee-payment" element={<FeeTransactionPage />} />
            <Route path="fee-structure" element={<FeeStructurePage />} />
            <Route path="fee-reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
