import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bgImage from "../assets/bg-login.jpg";
import { notifyAuthChange } from "../utils/authEvents";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Email and password are required",
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/admin/login", {
        email,
        password,
      });

      // ✅ Save token
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem(
        "adminInfo",
        JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
        })
      );

      // 🔥 Update navbar immediately
      notifyAuthChange();

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome ${data.name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "Invalid credentials or server error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "360px",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        <h4 className="text-center fw-bold mb-4">Admin Login</h4>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <div className="input-group mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-muted mt-3 mb-0">
          Authorized Admins Only
        </p>
      </div>
    </div>
  );
};

export default Login;
