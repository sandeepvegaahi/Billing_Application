import { Card, Form, Button } from "react-bootstrap";
import { useState } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

const DeletePage = () => {
  const token = localStorage.getItem("adminToken");
  const [htNumber, setHtNumber] = useState("");

  const handleDelete = async () => {
    Swal.fire({
      title: "Confirm delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.get(`/students/roll/${htNumber}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          await api.delete(`/students/${res.data._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          Swal.fire("Deleted", "Student removed", "success");
          setHtNumber("");
        } catch {
          Swal.fire("Error", "Delete failed", "error");
        }
      }
    });
  };

  return (
    <Card
      className="p-4 shadow-sm rounded-4 mx-auto"
      style={{ maxWidth: "500px" }}
    >
      <h5 className="mb-4 text-center fw-bold text-danger">Delete Student</h5>

      <Form.Control
        placeholder="Enter HT Number"
        value={htNumber}
        onChange={(e) => setHtNumber(e.target.value)}
        className="mb-3 shadow-sm"
      />

      
      <Button
        variant="danger"
        onClick={handleDelete}
        className="w-100 fw-semibold py-2"
      >
        Delete
      </Button>
    </Card>
  );
};

export default DeletePage;
