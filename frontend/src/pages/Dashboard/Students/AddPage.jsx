import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

const AddPage = () => {
  const token = localStorage.getItem("adminToken");

  const [form, setForm] = useState({
    htNumber: "",
    studentName: "",
    branch: "",
    fatherName: "",
    parentMobile: "",
    studentMobile: "",
    address: "",
    aadharNumber: "",
    email: "",
    admissionType: "CONVENER",
    casteCategory: "",
    gender: "MALE",
    admissionNumber: "",
    admissionDate: "",
    dateOfBirth: "",
    TutionFee: "",
    admissionFee: "",
    busFee: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await api.post("/students/register", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success", "Student added successfully", "success");

      setForm({
        htNumber: "",
        studentName: "",
        branch: "",
        fatherName: "",
        parentMobile: "",
        studentMobile: "",
        address: "",
        aadharNumber: "",
        email: "",
        admissionType: "CONVENER",
        casteCategory: "",
        gender: "MALE",
        admissionNumber: "",
        admissionDate: "",
        dateOfBirth: "",
        TutionFee: "",
        admissionFee: "",
        busFee: "",
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Add failed",
        "error"
      );
    }
  };

  return (
    <Card className="shadow-sm p-4 rounded-4 border-0 mx-auto" style={{ maxWidth: "1000px" }}>
      <h4 className="mb-4 text-center fw-bold text-primary">Add Student</h4>

      <Row className="mb-3 g-3">
        <Col md={4}><Form.Control name="htNumber" placeholder="HT Number" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="studentName" placeholder="Student Name" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="branch" placeholder="Branch" onChange={handleChange} className="shadow-sm" /></Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={4}><Form.Control name="fatherName" placeholder="Father Name" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="parentMobile" placeholder="Parent Mobile" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="studentMobile" placeholder="Student Mobile" onChange={handleChange} className="shadow-sm" /></Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={4}><Form.Control name="address" placeholder="Address" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="aadharNumber" placeholder="Aadhar Number" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="email" placeholder="Email" onChange={handleChange} className="shadow-sm" /></Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Select name="admissionType" onChange={handleChange} className="shadow-sm">
            <option value="CONVENER">Convener</option>
            <option value="MANAGEMENT">Management</option>
          </Form.Select>
        </Col>
        <Col md={4}><Form.Control name="casteCategory" placeholder="Caste Category" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}>
          <Form.Select name="gender" onChange={handleChange} className="shadow-sm">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={4}><Form.Control name="admissionNumber" placeholder="Admission Number" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control type="date" name="admissionDate" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control type="date" name="dateOfBirth" onChange={handleChange} className="shadow-sm" /></Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={4}><Form.Control name="TutionFee" placeholder="Tuition Fee" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="admissionFee" placeholder="Admission Fee" onChange={handleChange} className="shadow-sm" /></Col>
        <Col md={4}><Form.Control name="busFee" placeholder="Bus Fee" onChange={handleChange} className="shadow-sm" /></Col>
      </Row>

      <div className="text-center">
        <Button onClick={handleSubmit} className="px-4 py-2 fw-semibold" variant="primary">
          Add Student
        </Button>
      </div>
    </Card>
  );
};

export default AddPage;
