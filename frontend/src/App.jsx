import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";


import DashboardUpload from "./pages/Dashboard/DashboardUpload";
import ViewPage from "./pages/Dashboard/ViewPage";
import AddPage from "./pages/Dashboard/AddPage";
import EditPage from "./pages/Dashboard/EditPage";
import DeletePage from "./pages/Dashboard/DeletePage";


import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";

const App = () => {
  return (
    <BrowserRouter>
     
      <TopNavbar />

      <Routes>
        
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
          
          <Route index element={<DashboardUpload />} />

          
          <Route path="view" element={<ViewPage />} />
          <Route path="add" element={<AddPage />} />
          <Route path="edit" element={<EditPage />} />
          <Route path="delete" element={<DeletePage />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
