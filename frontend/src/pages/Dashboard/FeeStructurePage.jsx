import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Card, Button, Row, Col, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";

/* ================= DEFAULT FORM STATE ================= */
const initialFormState = {
  category: "",
  customCategoryName: "",
  amount: "",
  year: "",
  billPrefix: "",
  currentBillNumber: "",
};

const FeeStructurePage = () => {
  const [fees, setFees] = useState([]);
  const [nextBill, setNextBill] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  /* ================= FETCH FEES ================= */
  const fetchFees = async () => {
    try {
      const res = await api.get("/fee-structure");
      setFees(res.data.data);
    } catch {
      Swal.fire("Error", "Failed to fetch fees", "error");
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= ADD FEE ================= */
  const handleAddFee = async (e) => {
    e.preventDefault();

    const duplicate = fees.find((f) => {
      if (formData.category !== "CUSTOM") {
        return f.category === formData.category;
      }
      return (
        f.category === "CUSTOM" &&
        f.customCategoryName?.toLowerCase() ===
          formData.customCategoryName.toLowerCase()
      );
    });

    if (duplicate) {
      return Swal.fire(
        "Duplicate Category",
        "This fee category already exists",
        "warning"
      );
    }

    try {
      await api.post("/fee-structure", {
        ...formData,
        amount: Number(formData.amount),
        currentBillNumber: Number(formData.currentBillNumber),
      });

      Swal.fire("Success", "Fee added successfully", "success");
      setFormData(initialFormState);
      fetchFees();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to add fee",
        "error"
      );
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await api.delete(`/fee-structure/${id}`);
      Swal.fire("Deleted", "Fee deleted", "success");
      fetchFees();
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (fee) => {
    setEditId(fee._id);
    setEditData({ ...fee });
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/fee-structure/${id}`, {
        ...editData,
        amount: Number(editData.amount),
        currentBillNumber: Number(editData.currentBillNumber),
      });

      setEditId(null);
      Swal.fire("Saved", "Fee updated", "success");
      fetchFees();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  /* ================= BILL PREVIEW ================= */
  const handleGenerateBill = (fee) => {
    setNextBill(
      `Next bill for ${
        fee.category === "CUSTOM" ? fee.customCategoryName : fee.category
      }: ${fee.billPrefix}${fee.currentBillNumber + 1}`
    );
  };

  return (
    <div>
      <h3 className="mb-4">Fee Structure Management</h3>

      {/* ================= ADD FEE ================= */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>Add Fee</Card.Title>

          <Form onSubmit={handleAddFee}>
            <Row className="mb-2">
              <Col>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="TuitionFee">Tuition Fee</option>
                  <option value="BusFee">Bus Fee</option>
                  <option value="ExamFee">Exam Fee</option>
                  <option value="UniversityFee">University Fee</option>
                  <option value="CondonationFee">Condonation Fee</option>
                  <option value="CUSTOM">Custom Fee</option>
                </Form.Select>
              </Col>

              {formData.category === "CUSTOM" && (
                <Col>
                  <Form.Control
                    name="customCategoryName"
                    placeholder="Custom Category Name"
                    value={formData.customCategoryName}
                    onChange={handleChange}
                    required
                  />
                </Col>
              )}

              <Col>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Form.Control
                  name="year"
                  placeholder="Year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col>
                <Form.Control
                  name="billPrefix"
                  placeholder="Bill Prefix"
                  value={formData.billPrefix}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col>
                <Form.Control
                  type="number"
                  name="currentBillNumber"
                  placeholder="Current Bill No"
                  value={formData.currentBillNumber}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col>
                <Button type="submit">Add Fee</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ================= TABLE ================= */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Fee List</Card.Title>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Year</th>
                <th>Prefix</th>
                <th>Bill No</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td>
                    {editId === fee._id ? (
                      fee.category === "CUSTOM" ? (
                        <Form.Control
                          value={editData.customCategoryName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              customCategoryName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        fee.category
                      )
                    ) : fee.category === "CUSTOM" ? (
                      fee.customCategoryName
                    ) : (
                      fee.category
                    )}
                  </td>

                  <td>
                    {editId === fee._id ? (
                      <Form.Control
                        type="number"
                        value={editData.amount}
                        onChange={(e) =>
                          setEditData({ ...editData, amount: e.target.value })
                        }
                      />
                    ) : (
                      `₹${fee.amount}`
                    )}
                  </td>

                  <td>
                    {editId === fee._id ? (
                      <Form.Control
                        value={editData.year}
                        onChange={(e) =>
                          setEditData({ ...editData, year: e.target.value })
                        }
                      />
                    ) : (
                      fee.year
                    )}
                  </td>

                  <td>
                    {editId === fee._id ? (
                      <Form.Control
                        value={editData.billPrefix}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            billPrefix: e.target.value,
                          })
                        }
                      />
                    ) : (
                      fee.billPrefix
                    )}
                  </td>

                  <td>
                    {editId === fee._id ? (
                      <Form.Control
                        type="number"
                        value={editData.currentBillNumber}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            currentBillNumber: e.target.value,
                          })
                        }
                      />
                    ) : (
                      fee.currentBillNumber
                    )}
                  </td>

                  <td>
                    {editId === fee._id ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleSave(fee._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(fee)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleGenerateBill(fee)}
                        >
                          Bill
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(fee._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {nextBill && (
        <Card className="mt-3">
          <Card.Body>{nextBill}</Card.Body>
        </Card>
      )}
    </div>
  );
};

export default FeeStructurePage;
