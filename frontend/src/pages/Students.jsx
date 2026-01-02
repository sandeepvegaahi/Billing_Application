import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const Students = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    const { data } = await api.get("/students");
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Student?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (confirm.isConfirmed) {
      await api.delete(`/students/${id}`);
      fetchStudents();
      Swal.fire("Deleted!", "Student removed", "success");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Students</h3>
        <Link to="/add-student" className="btn btn-success">
          + Add Student
        </Link>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.rollNumber}</td>
              <td>{s.name}</td>
              <td>{s.branch}</td>
              <td>{s.currentYear}</td>
              <td>{s.currentSemester}</td>
              <td>
                <Link
                  to={`/edit-student/${s._id}`}
                  className="btn btn-warning btn-sm me-2"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteStudent(s._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Students;
