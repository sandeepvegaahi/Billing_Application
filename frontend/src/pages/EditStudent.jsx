import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({});

  useEffect(() => {
    api.get(`/students/${id}`).then(res => setStudent(res.data));
  }, [id]);

  const update = async () => {
    await api.put(`/students/${id}`, student);
    Swal.fire("Updated", "Student updated", "success");
    navigate("/students");
  };

  return (
    <div className="container mt-4">
      <h3>Edit Student</h3>

      <input
        className="form-control my-2"
        value={student.name || ""}
        onChange={(e) => setStudent({ ...student, name: e.target.value })}
      />

      <button className="btn btn-success" onClick={update}>
        Update
      </button>
    </div>
  );
};

export default EditStudent;
