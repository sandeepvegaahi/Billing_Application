import { useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/api";
import "../../Styles/feeTransaction.css";

const FeeTransactionPage = () => {
  const [htNumber, setHtNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [feeCategories, setFeeCategories] = useState([]);
  const [customFees, setCustomFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomTotal, setNewCustomTotal] = useState("");
  const [loading, setLoading] = useState(false);

  const allFees = [...feeCategories, ...customFees];
  const totalFee = allFees.reduce((s, f) => s + (f.totalAmount || 0), 0);
  const totalPaid = allFees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalDue = totalFee - totalPaid;
  const selectedDue = selectedFee
    ? selectedFee.totalAmount - selectedFee.paidAmount
    : 0;

  /* ================= SEARCH STUDENT ================= */
  const handleSearch = async () => {
    if (!htNumber)
      return Swal.fire("Error", "Enter Hall Ticket Number", "error");

    setLoading(true);
    try {
      const res = await api.get(
        `/fee-transaction/search/${htNumber}`
      );

      const data = res.data;

      setStudent(data.studentInfo);
      setFeeCategories(
        data.categoryWise.filter((f) => f.category !== "CUSTOM")
      );
      setCustomFees(
        data.categoryWise.filter((f) => f.category === "CUSTOM")
      );
      setSelectedFee(data.categoryWise[0] || null);
      setReceipts([]);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message,
        "error"
      );
      setStudent(null);
      setFeeCategories([]);
      setCustomFees([]);
      setSelectedFee(null);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAY ================= */
  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0)
      return Swal.fire("Error", "Enter valid amount", "error");

    if (!selectedFee) return;

    try {
      await api.post("/fee-transaction/pay", {
        studentId: selectedFee.student,
        category: selectedFee.category,
        academicYear: selectedFee.academicYear,
        amount: Number(payAmount),
      });

      Swal.fire("Success", "Payment successful", "success");

      const updateFee = (f) =>
        f._id === selectedFee._id
          ? {
              ...f,
              paidAmount: f.paidAmount + Number(payAmount),
            }
          : f;

      setFeeCategories(feeCategories.map(updateFee));
      setCustomFees(customFees.map(updateFee));
      setPayAmount("");

      handleGetHistory();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message,
        "error"
      );
    }
  };

  /* ================= PAYMENT HISTORY ================= */
  const handleGetHistory = async () => {
    if (!selectedFee) return;
    try {
      const res = await api.get(
        `/fee-transaction/history/${selectedFee.student}`
      );
      setReceipts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CUSTOM FEE UI ONLY ================= */
  const handleAddCustomFee = () => {
    if (!newCustomName || !newCustomTotal)
      return Swal.fire("Error", "Enter name and amount", "error");

    const customFee = {
      category: "CUSTOM",
      customCategoryName: newCustomName,
      totalAmount: Number(newCustomTotal),
      paidAmount: 0,
    };

    setCustomFees([...customFees, customFee]);
    setSelectedFee(customFee);
    setShowCustomModal(false);
    setNewCustomName("");
    setNewCustomTotal("");
  };

  const handleDeleteCustomFee = (name) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    }).then((r) => {
      if (!r.isConfirmed) return;
      setCustomFees(customFees.filter((f) => f.customCategoryName !== name));
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="container mt-4">
      {/* SEARCH */}
      <Card className="p-3 mb-3">
        <h5>Fee Payment</h5>
        <Row className="mt-3">
          <Col md={4}>
            <Form.Control
              placeholder="Enter Hall Ticket Number"
              value={htNumber}
              onChange={(e) => setHtNumber(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button onClick={handleSearch}>Search</Button>
          </Col>
        </Row>

        {student && (
          <>
            <hr />
            <Row>
              <Col md={3}>
                <b>Hall Ticket</b>
                <p>{student.htNumber}</p>
              </Col>
              <Col md={3}>
                <b>Name</b>
                <p>{student.name}</p>
              </Col>
              <Col md={3}>
                <b>Branch</b>
                <p>{student.branch}</p>
              </Col>
              <Col md={3}>
                <b>Year</b>
                <p>{student.year}</p>
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* SUMMARY */}
      {student && (
        <Row className="mb-3">
          <Col md={4}>
            <Card className="text-center p-3">
              <b>Total Fees</b>
              <h5>₹ {totalFee}</h5>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center p-3 text-success">
              <b>Paid</b>
              <h5>₹ {totalPaid}</h5>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center p-3 text-danger">
              <b>Due</b>
              <h5>₹ {totalDue}</h5>
            </Card>
          </Col>
        </Row>
      )}

      {/* CATEGORY SLIDER */}
      {student && (
        <div className="fee-slider mb-3">
          {allFees.map((fee, i) => (
            <div
              key={i}
              className={`fee-tab ${
                selectedFee?._id === fee._id ? "active" : ""
              }`}
              onClick={() => setSelectedFee(fee)}
            >
              {fee.category === "CUSTOM"
                ? fee.customCategoryName
                : fee.category}
              {fee.category === "CUSTOM" && (
                <span
                  className="ms-2 text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomFee(fee.customCategoryName);
                  }}
                >
                  ✕
                </span>
              )}
            </div>
          ))}
          <div
            className="fee-tab text-primary"
            onClick={() => setShowCustomModal(true)}
          >
            + Add Optional Fee
          </div>
        </div>
      )}

      {/* SELECTED FEE */}
      {student && selectedFee && (
        <Card className="p-4 mb-4">
          <h6>
            {selectedFee.category === "CUSTOM"
              ? selectedFee.customCategoryName
              : selectedFee.category}
          </h6>
          <Row className="mt-3">
            <Col md={4}>
              <b>Total</b>
              <p>₹ {selectedFee.totalAmount}</p>
            </Col>
            <Col md={4} className="text-success">
              <b>Paid</b>
              <p>₹ {selectedFee.paidAmount}</p>
            </Col>
            <Col md={4} className="text-danger">
              <b>Due</b>
              <p>₹ {selectedDue}</p>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </Col>
            <Col>
              <Button disabled={selectedDue === 0} onClick={handlePay}>
                Pay
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* HISTORY */}
      {student && (
        <Card className="p-3">
          <h6>Payment History</h6>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, i) => (
                <tr key={i}>
                  <td>{r.billNumber}</td>
                  <td>
                    {r.paymentDate
                      ? new Date(r.paymentDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{r.category}</td>
                  <td>₹ {r.paidAmount}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* CUSTOM MODAL */}
      <Modal show={showCustomModal} onHide={() => setShowCustomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Optional Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Fee Name</Form.Label>
            <Form.Control
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Total Amount</Form.Label>
            <Form.Control
              type="number"
              value={newCustomTotal}
              onChange={(e) => setNewCustomTotal(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCustomFee}>Add</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeeTransactionPage;
