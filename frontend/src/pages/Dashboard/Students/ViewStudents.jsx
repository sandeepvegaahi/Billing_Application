import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../../utils/dashboardEvents";
import "../../../Styles/viewStudentsResponsive.css";

const ViewStudents = () => {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newStudent, setNewStudent] = useState({});
  const [feeColumns, setFeeColumns] = useState([]);
  const [feeAmounts, setFeeAmounts] = useState({});

  const staticColumns = [
    "htNumber",
    "studentName",
    "branch",
    "fatherName",
    "parentMobile",
    "studentMobile",
    "address",
    "aadharNumber",
    "email",
    "admissionType",
    "casteCategory",
    "gender",
    "admissionNumber",
    "admissionDate",
    "graduationYear",
    "dateOfBirth",
    "TutionFee",
    "busFee",
  ];

  const columns = [...staticColumns, ...feeColumns];

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Student fetch failed:", err);
      setStudents([]);
    }
  };

  const fetchFeeColumns = async () => {
    try {
      const res = await api.get("/fee-structure", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const dynamicFees = [];
        const amounts = {};

        res.data.data.forEach((f) => {
          const key =
            f.category === "CUSTOM"
              ? f.customCategoryName.replace(/\s+/g, "")
              : f.category;

          if (!["TuitionFee", "TutionFee", "BusFee", "busFee"].includes(key)) {
            dynamicFees.push(key);
            amounts[key] = f.amount ?? 0;
          }
        });

        setFeeColumns(dynamicFees);
        setFeeAmounts(amounts);
      }
    } catch (err) {
      console.error("Fee fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchFeeColumns();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.htNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase());

    const matchesBranch = branchFilter ? s.branch === branchFilter : true;
    const matchesYear = yearFilter
      ? s.currentYear === parseInt(yearFilter)
      : true;

    return matchesSearch && matchesBranch && matchesYear;
  });

  const handleEdit = (student) => {
    setEditId(student._id);
    setEditData({ ...student });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleSave = async (id) => {
    try {
      const payload = { ...editData };
      delete payload.graduationYear;

      const res = await api.put(`/students/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        Swal.fire("Success", "Student updated successfully!", "success");
        fetchStudents();
        setEditId(null);
        setEditData({});
        notifyDashboardUpdate();
      }
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire("Error", "Failed to update student.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          setStudents(students.filter((s) => s._id !== id));
          Swal.fire("Deleted!", "Student has been deleted.", "success");
          notifyDashboardUpdate();
        }
      } catch {
        Swal.fire("Error", "Failed to delete student.", "error");
      }
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewStudent({});
  };

  const handleSaveNew = async () => {
    try {
      const payload = { ...newStudent };
      delete payload.graduationYear;

      const res = await api.post("/students/register", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        Swal.fire("Success", "Student added successfully!", "success");
        fetchStudents();
        setAddingNew(false);
        setNewStudent({});
        notifyDashboardUpdate();
      }
    } catch (err) {
      console.error("Add student failed:", err);
      Swal.fire("Error", "Failed to add student.", "error");
    }
  };

  return (
    <Card className="p-3 shadow-sm rounded-4 w-100 view-students-wrapper">
      <h5>View Students</h5>

      <Row className="mb-3 view-filters">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search by Hall Ticket, Name, Branch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={3}>
          <Form.Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            {[...new Set(students.map((s) => s.branch))].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <div className="mb-3 d-flex gap-2 view-actions">
        <Button variant="success" onClick={handleAddNew}>
          Add Student
        </Button>
        <Button onClick={() => navigate("/dashboard/bulk-upload")}>
          Bulk Upload
        </Button>
      </div>

      <div className="table-scroll-container">
        <Table striped bordered hover responsive>
          <thead className="table-primary">
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s._id}>
                {columns.map((col) =>
                  editId === s._id ? (
                    <td key={col}>
                      <Form.Control
                        size="sm"
                        type={col.includes("Date") ? "date" : "text"}
                        value={editData[col] || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, [col]: e.target.value })
                        }
                      />
                    </td>
                  ) : (
                    <td key={col}>{s[col] ?? "-"}</td>
                  ),
                )}
                <td>
                  {editId === s._id ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(s._id)}>
                        Save
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(s)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(s._id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {addingNew && (
              <tr>
                {columns.map((col) => (
                  <td key={col}>
                    <Form.Control
                      size="sm"
                      value={newStudent[col] || ""}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, [col]: e.target.value })
                      }
                    />
                  </td>
                ))}
                <td>
                  <Button size="sm" onClick={handleSaveNew}>
                    Save
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default ViewStudents;
