import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg-college.jpg";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
     
      <div
        className="d-flex align-items-center justify-content-center flex-column text-center text-white hero-content"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem",
          filter: "brightness(1.1)",
        }}
      >
        <h1 className="display-4 fw-bold mb-3 hero-animate">College Fee Management System</h1>
        <p className="mb-4 fs-5 hero-animate">
          Secure and easy way to manage your college fee payments
        </p>
        <button
          className="btn btn-lg btn-primary px-5 shadow fw-bold hero-animate"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Home;
