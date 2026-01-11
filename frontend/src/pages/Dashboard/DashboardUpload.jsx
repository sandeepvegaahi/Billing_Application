import { useState, useRef } from "react";
import { Button, Form, Card, ProgressBar } from "react-bootstrap";
import api from "../../api/api";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../utils/dashboardEvents";

const DashboardUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("adminToken");

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return Swal.fire("Error", "Please select a file", "error");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/students/bulk-upload/students", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const { inserted, failed, failedRows } = res.data;

        // Build message
        let message = "";
        if (inserted > 0) message += `${inserted} student(s) added successfully.<br/>`;
        if (failed > 0) {
          message += `${failed} row(s) failed:<br/><ul>`;
          failedRows.forEach((row) => {
            message += `<li>Row ${row.row}: ${row.error}</li>`;
          });
          message += "</ul>";
        }

        Swal.fire({
          icon: "success",
          title: "Upload Completed",
          html: message || "No new students were added.",
          width: 600,
        });

        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        notifyDashboardUpdate();
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Upload Failed",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 w-50 mx-auto shadow-sm rounded-4 mt-4">
      <h5 className="mb-3 text-center">Bulk Upload Students</h5>
      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Label>Select Excel File</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
      {uploading && <ProgressBar animated now={100} className="mt-3" />}
    </Card>
  );
};

export default DashboardUpload;
