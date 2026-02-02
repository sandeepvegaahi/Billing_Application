

import { useState, useRef, useEffect } from "react";
import { Button, Form, Card, ProgressBar } from "react-bootstrap";
import api from "../../api/api";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../utils/dashboardEvents";

const DashboardUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [uploadType, setUploadType] = useState("");
  const [feeCategory, setFeeCategory] = useState("");
  const [feeCategories, setFeeCategories] = useState([]);

  // Academic Year
  const [academicYear, setAcademicYear] = useState("");
  const [academicYears, setAcademicYears] = useState([]);

  const token = localStorage.getItem("adminToken");
  const fileInputRef = useRef(null);

  // Fetch fee categories whenever FEE or PAID upload type is selected
  useEffect(() => {
    if (uploadType === "FEE" || uploadType === "PAID") {
      const fetchFeeCategories = async () => {
        try {
          const res = await api.get("/fee-structure/categories/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFeeCategories(res.data.data || []);
        } catch (err) {
          Swal.fire("Error", "Failed to fetch fee categories", "error");
        }
      };
      fetchFeeCategories();
    }
  }, [uploadType, token]);

  // Fetch academic years from backend
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get("/students/academic-years", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const years = res.data.data || [];
        setAcademicYears(years);

        // Pre-select latest year if available
        if (years.length > 0) setAcademicYear(years[years.length - 1]);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch academic years", "error");
      }
    };
    fetchAcademicYears();
  }, [token]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDownloadTemplate = async () => {
    try {
      let url = "";
      let filename = "";

      if (uploadType === "STUDENT") {
        url = "/templates/students";
        filename = "Student_Bulk_Upload_Template.xlsx";
      } else if (uploadType === "FEE" || uploadType === "PAID") {
        if (!feeCategory) {
          return Swal.fire(
            "Select Fee Category",
            "Please select a fee category",
            "warning"
          );
        }
        url = `/templates/fees/${feeCategory}`;
        filename = `${feeCategory}_Fee_Upload_Template.xlsx`;
      } else {
        return;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      Swal.fire("Error", "Template download failed", "error");
    }
  };

  const handleUpload = async () => {
    if (!uploadType)
      return Swal.fire("Error", "Please select upload type", "error");

    if (!file)
      return Swal.fire("Error", "Please select an Excel file", "error");

    if ((uploadType === "FEE" || uploadType === "PAID") && !feeCategory)
      return Swal.fire("Error", "Please select Fee Category", "error");

    // Academic Year mandatory for FEE / PAID
    if ((uploadType === "FEE" || uploadType === "PAID") && !academicYear)
      return Swal.fire("Error", "Please select Academic Year", "error");

    const formData = new FormData();
    formData.append("file", file);

    // Send academic year as starting year number
    if (academicYear) {
      const startYear = parseInt(academicYear.split("-")[0], 10); // "2026-2027" → 2026
      formData.append("academicYear", startYear);
    }

    let apiUrl = "";
    if (uploadType === "STUDENT") {
      apiUrl = "/students/bulk-upload/students";
    } else if (uploadType === "FEE") {
      apiUrl = "/fee-payments/bulk-upload";
      formData.append("feeCategory", feeCategory);
    } else if (uploadType === "PAID") {
      apiUrl = "/fee-transactions-bulk/bulk-upload-paid";
      formData.append("feeCategory", feeCategory);
    }

    setUploading(true);

    try {
      const res = await api.post(apiUrl, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { inserted = 0, updated = 0, failed = 0, failedRows = [] } =
        res.data || {};

      let message = "";
      if (uploadType === "STUDENT" && inserted > 0) {
        message += `${inserted} student(s) added successfully.<br/>`;
      }
      if (uploadType === "FEE" && updated > 0) {
        message += `${updated} fee record(s) updated successfully.<br/>`;
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

      setFile(null);
      setFeeCategory("");
      setUploadType("");
      setAcademicYear("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      notifyDashboardUpdate();
    } catch (err) {
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

      <Form.Group className="mb-3">
        <Form.Label>Upload Type</Form.Label>
        <Form.Select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
        >
          <option value="">Select Upload Type</option>
          <option value="STUDENT">Student Bulk Upload</option>
          <option value="FEE">Fee Payment Upload</option>
          <option value="PAID">Paid Amount Upload (Offline)</option>
        </Form.Select>
      </Form.Group>

      {(uploadType === "FEE" || uploadType === "PAID") && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Fee Category</Form.Label>
            <Form.Select
              value={feeCategory}
              onChange={(e) => setFeeCategory(e.target.value)}
            >
              <option value="">Select Fee Category</option>
              {feeCategories.map((f) => (
                <option key={f.value || f} value={f.value || f}>
                  {f.label || f}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Academic Year dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Academic Year</Form.Label>
            <Form.Select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Form.Select>
            <small className="text-muted">
              Must match Excel column <b>AcademicYear (YYYY-YYYY)</b>
            </small>
          </Form.Group>
        </>
      )}

      <Form.Group className="mb-2">
        <Form.Label>Select Excel File</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </Form.Group>

      {uploadType && (
        <div
          className="mb-3 text-primary"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={handleDownloadTemplate}
        >
          📄 Download Excel Template
        </div>
      )}

      <Button variant="primary" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      {uploading && <ProgressBar animated now={100} className="mt-3" />}
    </Card>
  );
};

export default DashboardUpload;
