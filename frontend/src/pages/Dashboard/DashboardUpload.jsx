import { useState, useRef } from "react";
import { Button, Form, Card, ProgressBar } from "react-bootstrap";
import api from "../../api/api";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../utils/dashboardEvents";

const DashboardUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [uploadType, setUploadType] = useState(""); // STUDENT | FEE
  const [feeCategory, setFeeCategory] = useState("");

  const token = localStorage.getItem("adminToken");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!uploadType)
      return Swal.fire("Error", "Please select upload type", "error");

    if (!file)
      return Swal.fire("Error", "Please select an Excel file", "error");

    if (uploadType === "FEE" && !feeCategory)
      return Swal.fire("Error", "Please select Fee Category", "error");

    const formData = new FormData();
    formData.append("file", file);

    let apiUrl = "";

    if (uploadType === "STUDENT") {
      apiUrl = "/students/bulk-upload/students";
    } else if (uploadType === "FEE") {
      apiUrl = "/fee-payments/bulk-upload";
      formData.append("feeCategory", feeCategory);
    }

    setUploading(true);
    try {
      const res = await api.post(apiUrl, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const {
          inserted = 0,
          updated = 0,
          failed = 0,
          failedRows = [],
        } = res.data;

        let message = "";

        if (uploadType === "STUDENT" && inserted > 0) {
          message += `${inserted} student(s) added successfully.<br/>`;
        }

        if (uploadType === "FEE" && updated > 0) {
          message += `${updated} student fee record(s) updated successfully.<br/>`;
        }

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
          html: message || "No records were updated",
          width: 600,
        });

        // reset form
        setFile(null);
        setFeeCategory("");
        setUploadType("");
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
      <h5 className="mb-3 text-center">Bulk Upload Center</h5>

      {/* Upload Type */}
      <Form.Group className="mb-3">
        <Form.Label>Upload Type</Form.Label>
        <Form.Select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
        >
          <option value="">Select Upload Type</option>
          <option value="STUDENT">Student Bulk Upload</option>
          <option value="FEE">Fee Payment Upload</option>
        </Form.Select>
      </Form.Group>

      {/* Fee Category */}
      {uploadType === "FEE" && (
        <Form.Group className="mb-3">
          <Form.Label>Fee Category</Form.Label>
          <Form.Select
            value={feeCategory}
            onChange={(e) => setFeeCategory(e.target.value)}
          >
            <option value="">Select Fee Category</option>
            <option value="TuitionFee">Tuition Fee</option>
            <option value="BusFee">Bus Fee</option>
            <option value="ExamFee">Exam Fee</option>
            <option value="UniversityFee">University Fee</option>
            <option value="CondonationFee">Condonation Fee</option>
          </Form.Select>
        </Form.Group>
      )}

      {/* File */}
      <Form.Group className="mb-3">
        <Form.Label>Select Excel File</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx,.xls"
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
