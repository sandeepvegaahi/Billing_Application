import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";

const DashboardUpload = () => {
  const token = localStorage.getItem("adminToken");
  const [type, setType] = useState("students");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("Error", "Select Excel file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    let url = "";
    if (type === "students") url = "/students/bulk-upload/students";
    if (type === "tuition") url = "/students/bulk-upload/tuition";
    if (type === "bus") url = "/students/bulk-upload/bus";

    try {
      await api.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "File uploaded successfully", "success");
      setFile(null);
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    }
  };

  return (
    <Card className="p-4 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "900px" }}>
      {/* Header */}
      <h5 className="mb-4 fw-bold text-primary text-center">Upload Excel File</h5>

      <Row className="align-items-center g-3">
        <Col md={4}>
          <Form.Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="shadow-sm"
          >
            <option value="students">Students</option>
            <option value="tuition">Tuition Fee</option>
            <option value="bus">Bus Fee</option>
          </Form.Select>
        </Col>

        <Col md={5}>
          <Form.Control
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="shadow-sm"
          />
        </Col>

        <Col md={3}>
          <Button
            className="w-100 fw-semibold py-2"
            variant="primary"
            onClick={handleUpload}
          >
            Upload
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardUpload;
