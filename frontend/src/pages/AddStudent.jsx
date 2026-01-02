import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AddStudent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      await api.post("/students/register", {
        rollNumber: form.rollNumber,
        name: form.name,
        branch: form.branch,
        batchYear: form.batchYear,
        currentYear: form.currentYear,
        currentSemester: form.currentSemester,
        contact: {
          mobile: form.mobile,
          email: form.email,
        },
      });

      Swal.fire("Success", "Student registered", "success");
      navigate("/students");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add Student</h3>

      <input name="rollNumber" className="form-control my-2" placeholder="Roll Number" onChange={handleChange}/>
      <input name="name" className="form-control my-2" placeholder="Name" onChange={handleChange}/>
      <select name="branch" className="form-control my-2" onChange={handleChange}>
        <option value="">Select Branch</option>
        <option>CSE</option>
        <option>ECE</option>
        <option>EEE</option>
        <option>MECH</option>
        <option>CIVIL</option>
      </select>
      <input name="batchYear" className="form-control my-2" placeholder="Batch Year" onChange={handleChange}/>
      <input name="currentYear" className="form-control my-2" placeholder="Current Year" onChange={handleChange}/>
      <input name="currentSemester" className="form-control my-2" placeholder="Semester" onChange={handleChange}/>
      <input name="mobile" className="form-control my-2" placeholder="Mobile" onChange={handleChange}/>
      <input name="email" className="form-control my-2" placeholder="Email" onChange={handleChange}/>

      <button className="btn btn-primary mt-3" onClick={submit}>
        Save Student
      </button>
    </div>
  );
};

export default AddStudent;
