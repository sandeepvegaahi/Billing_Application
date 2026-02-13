import { useState, useRef, useEffect } from "react";
import { Button, Form, Card, ProgressBar } from "react-bootstrap";
import api from "../../api/api";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../utils/dashboardEvents";
import { downloadErrorExcel } from "../../utils/errorExcel";

const DashboardUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [uploadType, setUploadType] = useState("");

  const [feeCategory, setFeeCategory] = useState("");
  const [feeCategories, setFeeCategories] = useState([]);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [academicYears, setAcademicYears] = useState([]);

  const token = localStorage.getItem("adminToken");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (uploadType === "FEE" || uploadType === "PAID") {
      api
        .get("/fee-structure/categories/all", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFeeCategories(res.data.data || []))
        .catch(() =>
          Swal.fire("Error", "Failed to fetch fee categories", "error"),
        );
    }
  }, [uploadType, token]);

  useEffect(() => {
    if (!uploadType) return;
    api
      .get("/courses")
      .then((res) => setCourses(res.data.data || []))
      .catch(() => Swal.fire("Error", "Failed to fetch courses", "error"));
  }, [uploadType]);

  useEffect(() => {
    if (!courseId) {
      setBatches([]);
      setBatchId("");
      setAcademicYears([]);
      setAcademicYear("");
      return;
    }

    api
      .get(`/courses/${courseId}/batches`)
      .then((res) => setBatches(res.data.data || []))
      .catch(() => Swal.fire("Error", "Failed to fetch batches", "error"));
  }, [courseId]);

  useEffect(() => {
    if (!batchId || uploadType === "STUDENT") {
      setAcademicYears([]);
      setAcademicYear("");
      return;
    }

    const batch = batches.find((b) => b._id === batchId);
    if (!batch?.label) return;

    const [start, end] = batch.label.split("-").map(Number);
    const years = [];

    for (let y = start; y < end; y++) {
      years.push(`${y}-${y + 1}`);
    }

    setAcademicYears(years);
    setAcademicYear("");
  }, [batchId, batches, uploadType]);

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
            "warning",
          );
        }
        //url = `/templates/fees/${feeCategory}`;
        url = `/templates/fees/${encodeURIComponent(feeCategory.trim())}`;
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
    if (!uploadType) return Swal.fire("Error", "Select upload type", "error");
    if (!file) return Swal.fire("Error", "Select Excel file", "error");

    if (uploadType === "STUDENT" && (!courseId || !batchId))
      return Swal.fire("Error", "Course & Batch required", "error");

    if (
      (uploadType === "FEE" || uploadType === "PAID") &&
      (!courseId || !batchId || !academicYear || !feeCategory)
    )
      return Swal.fire(
        "Error",
        "Course, Batch, Academic Year & Fee Category required",
        "error",
      );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    formData.append("academicBatchId", batchId);

    if (uploadType !== "STUDENT") {
      formData.append("academicYear", academicYear);
      formData.append("feeCategory", feeCategory);
    }

    let apiUrl = "";
    if (uploadType === "STUDENT") apiUrl = "/students/bulk-upload/students";
    if (uploadType === "FEE") apiUrl = "/fee-payments/bulk-upload";
    if (uploadType === "PAID")
      apiUrl = "/fee-transactions-bulk/bulk-upload-paid";

    try {
      setUploading(true);

      const res = await api.post(apiUrl, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { inserted = 0, failed = 0, failedRows = [] } = res.data || {};

      Swal.fire({
        icon: "success",
        title: "Upload Completed",
        showCloseButton: true,
        html: `
    <p><b>${inserted}</b> record(s) processed</p>
    <p><b>${failed}</b> row(s) failed</p>
    ${
      failed > 0
        ? `<button id="download-errors" class="swal2-confirm swal2-styled" style="background:#dc3545;">
             Download Error Report (Excel)
           </button>`
        : ""
    }
  `,
        showConfirmButton: false,
        didOpen: () => {
          if (failed > 0) {
            document
              .getElementById("download-errors")
              .addEventListener("click", () => {
                downloadErrorExcel(failedRows);
              });
          }
        },
      });

      setFile(null);
      setUploadType("");
      setFeeCategory("");
      setCourseId("");
      setBatchId("");
      setAcademicYear("");
      fileInputRef.current.value = "";
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      const isBatchError = msg.toLowerCase().includes("academic batch");

      Swal.fire({
        icon: isBatchError ? "warning" : "error",
        title: isBatchError ? "Academic Batch Mismatch" : "Upload Failed",
        text: msg,
        confirmButtonText: "Fix & Retry",
        confirmButtonColor: "#4f46e5",
        background: "#0f172a",
        color: "#e5e7eb",
        backdrop: "rgba(0,0,0,0.6)",
      });

      if (isBatchError) {
        document.getElementById("academicBatch")?.focus();
      }
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
          <option value="FEE">Fee Upload</option>
          <option value="PAID">Paid Upload</option>
        </Form.Select>
      </Form.Group>

      {(uploadType === "FEE" || uploadType === "PAID") && (
        <Form.Group className="mb-3">
          <Form.Label>Fee Category</Form.Label>
          <Form.Select
            value={feeCategory}
            onChange={(e) => setFeeCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {feeCategories.map((f) => (
              <option key={f.value || f} value={f.value || f}>
                {f.label || f}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      {uploadType && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Course</Form.Label>
            <Form.Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Academic Batch</Form.Label>
            <Form.Select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </>
      )}

      {(uploadType === "FEE" || uploadType === "PAID") && (
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
        </Form.Group>
      )}

      <Form.Control
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />

      {uploadType && (
        <div
          className="mb-3 text-primary"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={handleDownloadTemplate}
        >
          📄 Download Excel Template
        </div>
      )}

      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      {uploading && <ProgressBar animated now={100} className="mt-3" />}
    </Card>
  );
};

export default DashboardUpload;
