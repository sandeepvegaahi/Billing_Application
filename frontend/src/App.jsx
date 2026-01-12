import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import FeeStructurePage from "./pages/Dashboard/FeeStructurePage"; // ✅ import Fee Structure page

import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import FeeTransactionPage from "./pages/Dashboard/FeeTransactionPage";

const App = () => {
  return (
    <BrowserRouter>
      <TopNavbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard with Sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Home */}
          <Route index element={<DashboardHome />} />

          {/* Students Tab */}
          <Route path="students/view" element={<ViewPage />} />
          <Route path="students/add" element={<AddPage />} />
          <Route path="students/edit" element={<EditPage />} />
          <Route path="students/delete" element={<DeletePage />} />

          {/* Bulk Upload */}
          <Route path="bulk-upload" element={<DashboardUpload />} />

          {/* Fee Pages */}
          <Route path="fee-payment" element={<FeeTransactionPage/>} />

          <Route path="fee-structure" element={<FeeStructurePage />} /> {/* ✅ updated */}
          <Route path="fee-reports" element={<div>Fee Reports Placeholder</div>} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
