import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../../api/api";
import { Table, Button, Form, InputGroup, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { notifyDashboardUpdate } from "../../../utils/dashboardEvents";

const ViewStudents = () => {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate(); 

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newStudent, setNewStudent] = useState({});

  const columns = [
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
    "dateOfBirth",
    "TutionFee",
    "admissionFee",
    "busFee",
  ];

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
      console.error(err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.htNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())
  );

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
      const res = await api.put(`/students/${id}`, editData, {
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
      Swal.fire("Error", "Failed to update student.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
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
      } catch (err) {
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
      const res = await api.post("/students/register", newStudent, {
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
      Swal.fire("Error", "Failed to add student.", "error");
    }
  };

  const handleCancelNew = () => {
    setAddingNew(false);
    setNewStudent({});
  };

  return (
    <Card className="p-4 shadow-sm rounded-4 mx-auto w-100">
      <div className="d-flex justify-content-between mb-3">
        <h5>View Students</h5>
      </div>

      <InputGroup className="mb-2">
        <Form.Control
          placeholder="Search by Hall Ticket, Name, Branch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <div className="mb-3 d-flex gap-2">
        <Button variant="success" onClick={handleAddNew}>
          Add Student
        </Button>
        <Button 
          variant="primary" 
          onClick={() => navigate("/dashboard/bulk-upload")}
        >
          Bulk Upload
        </Button>
      </div>

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
              {columns.map((col) => (
                <td key={col}>
                  {editId === s._id ? (
                    <Form.Control
                      size="sm"
                      value={editData[col] || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, [col]: e.target.value })
                      }
                    />
                  ) : (
                    s[col] || "-"
                  )}
                </td>
              ))}
              <td className="d-flex gap-2">
                {editId === s._id ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSave(s._id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
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
              <td className="d-flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSaveNew}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelNew}
                >
                  Cancel
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default ViewStudents;
