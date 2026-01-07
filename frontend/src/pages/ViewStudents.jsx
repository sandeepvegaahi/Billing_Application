import { useState, useEffect } from "react";
import api from "../api/api"; // Your axios instance
import Swal from "sweetalert2";
import { Table, Button, Form, InputGroup, Card } from "react-bootstrap";

const ViewStudents = () => {
  const token = localStorage.getItem("adminToken");

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState(null);

  
  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch students", "error");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e, rowId, isNew = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewRow({ ...newRow, [name]: value });
    } else {
      setStudents((prev) =>
        prev.map((s) => (s._id === rowId ? { ...s, [name]: value } : s))
      );
    }
  };

  const handleAddRow = () => {
    setNewRow({
      htNumber: "",
      studentName: "",
      branch: "",
      fatherName: "",
      parentMobile: "",
      studentMobile: "",
      address: "",
      aadharNumber: "",
      email: "",
      admissionType: "",
      casteCategory: "",
      gender: "",
      admissionNumber: "",
      admissionDate: "",
      dateOfBirth: "",
      TutionFee: "",
      admissionFee: "",
      busFee: "",
    });
  };

  const handleSaveRow = async (row, isNew = false) => {
    try {
      if (isNew) {
        await api.post("/students/register", row, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Success", "Student added", "success");
      } else {
        await api.put(`/students/${row._id}`, row, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Success", "Student updated", "success");
      }
      setEditingRow(null);
      setNewRow(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDeleteRow = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This student will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/students/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Student deleted", "success");
          fetchStudents();
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Delete failed", "error");
        }
      }
    });
  };

  const filteredStudents = students.filter((s) =>
    s.htNumber.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <Card
      className="p-4  w-100 shadow-sm rounded-4 mx-auto"
     
    >
      

     
      <InputGroup className="mb-3 shadow-sm">
        <Form.Control
          placeholder="Search by Roll Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <div className="mb-3 text-end">
        <Button onClick={handleAddRow} variant="success">
          Add New Row
        </Button>
      </div>

     
      <div className="table-responsive">
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
                    {editingRow === s._id ? (
                      <Form.Control
                        name={col}
                        value={s[col] || ""}
                        onChange={(e) => handleChange(e, s._id)}
                        className="shadow-sm"
                        size="sm"
                      />
                    ) : (
                      s[col]
                    )}
                  </td>
                ))}
                <td>
                  {editingRow === s._id ? (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleSaveRow(s)}
                        className="me-2 mb-1"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingRow(null)}
                        className="mb-1"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => setEditingRow(s._id)}
                        className="me-2 mb-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteRow(s._id)}
                        className="mb-1"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}

           
            {newRow && (
              <tr>
                {columns.map((col) => (
                  <td key={col}>
                    <Form.Control
                      name={col}
                      value={newRow[col]}
                      onChange={(e) => handleChange(e, null, true)}
                      className="shadow-sm"
                      size="sm"
                    />
                  </td>
                ))}
                <td>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleSaveRow(newRow, true)}
                    className="me-2 mb-1"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setNewRow(null)}
                    className="mb-1"
                  >
                    Cancel
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
