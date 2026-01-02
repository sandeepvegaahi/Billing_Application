import { useState } from "react";
import api from "../api/api"; // axios instance
import Swal from "sweetalert2";
import { Button, Form, Table, Card } from "react-bootstrap";

const Dashboard = () => {
  const [searchRoll, setSearchRoll] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("students");
  const [loading, setLoading] = useState(false);

  // Search by Roll Number
  const handleSearch = async () => {
    if (!searchRoll) {
      Swal.fire("Error", "Enter Roll Number", "error");
      return;
    }
    try {
      const token = localStorage.getItem("adminToken"); // <-- make sure you have this
      const res = await api.get(`/students/roll/${searchRoll}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentData(res.data);
    } catch (err) {
      setStudentData(null);
      Swal.fire("Not Found", "Student not registered", "warning");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload Excel
  const handleUpload = async () => {
    if (!file) {
      Swal.fire("Error", "Select a file to upload", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file); // MUST match multer's .single("file")

    try {
      const token = localStorage.getItem("adminToken"); // adminProtect token
      const res = await api.post(`/bulk-upload/${uploadType}`, formData, {
        headers: { Authorization: `Bearer ${token}` }, // do NOT set Content-Type manually
      });

      Swal.fire("Success", `Excel uploaded successfully`, "success");
      setFile(null);
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Upload failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Search Roll Number */}
      <Card className="p-3 mb-4">
        <h5>Search Student by Roll Number</h5>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Enter Roll Number"
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
          />
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {studentData && (
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Tuition Fee</th>
                <th>Bus Fee</th>
                <th>Admission Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{studentData.htNumber}</td>
                <td>{studentData.studentName}</td>
                <td>{studentData.branch}</td>
                <td>{studentData.TutionFee}</td>
                <td>{studentData.busFee}</td>
                <td>{studentData.admissionType}</td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card>

      {/* Excel Upload Section */}
      <Card className="p-3">
        <h5>Upload Excel</h5>
        <Form.Group className="mb-3">
          <Form.Label>Choose Upload Type</Form.Label>
          <Form.Select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
          >
            <option value="students">Students Registration</option>
            <option value="tuition">Tuition Fee</option>
            <option value="bus">Bus Fee</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Excel File</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
          />
        </Form.Group>

        <Button variant="success" onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload Excel"}
        </Button>
      </Card>
    </div>
  );
};

export default Dashboard;
