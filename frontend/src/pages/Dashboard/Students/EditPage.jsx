import { Card, Form, Button } from "react-bootstrap";
import { useState } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

const EditPage = () => {
  const token = localStorage.getItem("adminToken");

  const [htNumber, setHtNumber] = useState("");
  const [student, setStudent] = useState(null);

  const fetchStudent = async () => {
    if (!htNumber) {
      Swal.fire("Error", "Enter HT Number", "error");
      return;
    }
    try {
      const res = await api.get(`/students/roll/${htNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(res.data);
    } catch {
      Swal.fire("Error", "Student not found", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/students/${student._id}`, student, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Updated", "Student updated successfully", "success");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <Card
      className="p-4 shadow-sm rounded-4 mx-auto"
      style={{ maxWidth: "600px" }}
    >
      <h5 className="mb-4 fw-bold text-center text-warning">Edit Student</h5>

      <Form.Control
        placeholder="Enter HT Number"
        value={htNumber}
        onChange={(e) => setHtNumber(e.target.value)}
        className="mb-3 shadow-sm"
      />

      <Button
        onClick={fetchStudent}
        className="mb-4 w-100 fw-semibold py-2"
        variant="info"
      >
        Search
      </Button>

      {student && (
        <div className="d-flex flex-column gap-3">
          <Form.Control
            value={student.studentName}
            onChange={(e) =>
              setStudent({ ...student, studentName: e.target.value })
            }
            className="shadow-sm"
            placeholder="Student Name"
          />

          <Form.Control
            value={student.branch}
            onChange={(e) => setStudent({ ...student, branch: e.target.value })}
            className="shadow-sm"
            placeholder="Branch"
          />

          <Form.Control
            value={student.studentMobile}
            onChange={(e) =>
              setStudent({ ...student, studentMobile: e.target.value })
            }
            className="shadow-sm"
            placeholder="Student Mobile"
          />

          <Button
            onClick={handleUpdate}
            className="w-100 fw-semibold py-2"
            variant="success"
          >
            Update
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EditPage;
