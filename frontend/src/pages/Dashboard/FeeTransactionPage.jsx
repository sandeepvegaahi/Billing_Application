import { useState } from "react";
import { Card, Button, InputGroup, Form, Row, Col } from "react-bootstrap";
import api from "../../api/api";
import Swal from "sweetalert2";

const FeeTransactionPage = () => {
  const token = localStorage.getItem("adminToken");

  const [htNumber, setHtNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);

  const [totalAllFees, setTotalAllFees] = useState(0);
  const [amountPaidAll, setAmountPaidAll] = useState(0);
  const [dueAll, setDueAll] = useState(0);

  const [totalFeeAmount, setTotalFeeAmount] = useState(0);
  const [amountPaidFee, setAmountPaidFee] = useState(0);
  const [dueFee, setDueFee] = useState(0);

  const [payAmount, setPayAmount] = useState(0);

  const fetchStudentFees = async () => {
    if (!htNumber) {
      Swal.fire("Warning", "Please enter Hall Ticket number", "warning");
      return;
    }

    try {
      const res = await api.get(`/fee-transaction/student/${htNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStudent(res.data.student);

        let feesData = (res.data.fees || []).map((f) => ({
          ...f,
          amountPaid: f.amountPaid || 0,
          due: (f.amount || 0) - (f.amountPaid || 0),
        }));

        if (!feesData.find((f) => f.category === "TuitionFee")) {
          feesData.unshift({
            category: "TuitionFee",
            amount: 0,
            amountPaid: 0,
            due: 0,
          });
        }

        if (!feesData.find((f) => f.category === "BusFee")) {
          const index = feesData.findIndex((f) => f.category !== "TuitionFee");
          feesData.splice(index, 0, {
            category: "BusFee",
            amount: 0,
            amountPaid: 0,
            due: 0,
          });
        }

        setFees(feesData);

        const total = feesData.reduce((acc, f) => acc + (f.amount || 0), 0);
        const paid = feesData.reduce((acc, f) => acc + (f.amountPaid || 0), 0);
        const due = feesData.reduce((acc, f) => acc + (f.due || 0), 0);

        setTotalAllFees(total);
        setAmountPaidAll(paid);
        setDueAll(due);

        setSelectedFee(null);
        setTotalFeeAmount(0);
        setAmountPaidFee(0);
        setDueFee(0);
        setPayAmount(0);
      } else {
        Swal.fire("Error", res.data.message || "Student not found", "error");
        setStudent(null);
        setFees([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch student fees", "error");
      setStudent(null);
      setFees([]);
    }
  };

  const handleSelectFee = (fee) => {
    setSelectedFee(fee);
    setTotalFeeAmount(fee.amount || 0);
    setAmountPaidFee(fee.amountPaid || 0);
    setDueFee(fee.due || 0);
    setPayAmount(0);
  };

  const handlePayAmount = async () => {
  if (!selectedFee) {
    Swal.fire("Warning", "Please select a fee category", "warning");
    return;
  }

  if (payAmount <= 0) {
    Swal.fire("Warning", "Amount must be greater than zero", "warning");
    return;
  }

  if (payAmount > dueFee) {
    Swal.fire({
      icon: "error",
      title: "Amount exceeds due!",
      text: `Entered amount ₹${payAmount} exceeds due ₹${dueFee}`,
      confirmButtonColor: "#d33",
    });
    return;
  }

  try {
    const payload = {
      htNumber: student.htNumber,
      category: selectedFee.category,
      amount: Number(payAmount),
    };

    if (selectedFee.category === "CUSTOM") {
      payload.customFeeName = selectedFee.customFeeName; // use correct key
    }

    const res = await api.post("/fee-transaction/pay", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Payment Successful",
        text: res.data.message,
        confirmButtonColor: "#3085d6",
      });

      // Update fees array correctly
      const updatedFees = fees.map((f) => {
        if (
          f.category === selectedFee.category &&
          (f.category !== "CUSTOM" || f.customFeeName === selectedFee.customFeeName)
        ) {
          const newPaid = (f.amountPaid || 0) + Number(payAmount);
          return { ...f, amountPaid: newPaid, due: (f.amount || 0) - newPaid };
        }
        return f;
      });

      setFees(updatedFees);

      // Update totals
      const totalPaid = updatedFees.reduce((a, f) => a + (f.amountPaid || 0), 0);
      const totalDue = updatedFees.reduce((a, f) => a + (f.due || 0), 0);

      setAmountPaidAll(totalPaid);
      setDueAll(totalDue);
      setAmountPaidFee((amountPaidFee || 0) + Number(payAmount));
      setDueFee((dueFee || 0) - Number(payAmount));
      setPayAmount(0);
    } else {
      Swal.fire("Error", res.data.message || "Payment failed", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Payment failed", "error");
  }
};


  return (
    <Card
      className="p-4 shadow-sm rounded-4 mx-auto"
      style={{ maxWidth: "1200px" }}
    >
      <h4 className="mb-4 text-center text-primary">Fee Payment</h4>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter Hall Ticket Number"
          value={htNumber}
          onChange={(e) => setHtNumber(e.target.value)}
        />
        <Button variant="primary" onClick={fetchStudentFees}>
          Fetch Student
        </Button>
      </InputGroup>

      {student && (
        <Card className="mb-4 p-3 bg-light">
          <Row>
            <Col>
              <strong>Name:</strong> {student.studentName}
            </Col>
            <Col>
              <strong>HT Number:</strong> {student.htNumber}
            </Col>
            <Col>
              <strong>Branch:</strong> {student.branch}
            </Col>
            <Col>
              <strong>Year:</strong> {student.year}
            </Col>
          </Row>
        </Card>
      )}

      {fees.length > 0 && (
        <Row className="mb-3 g-2">
          <Col md={4}>
            <Card className="p-2 text-center bg-info text-white">
              <strong>Total All Fees</strong>
              <h5>{totalAllFees}</h5>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-2 text-center bg-success text-white">
              <strong>Amount Paid</strong>
              <h5>{amountPaidAll}</h5>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-2 text-center bg-danger text-white">
              <strong>Due</strong>
              <h5>{dueAll}</h5>
            </Card>
          </Col>
        </Row>
      )}

      {fees.length > 0 && (
        <div className="d-flex gap-2 overflow-auto mb-3">
          {fees.map((f) => (
            <Button
              key={f.category}
              variant={
                selectedFee?.category === f.category
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => handleSelectFee(f)}
            >
              {f.category}
            </Button>
          ))}
        </div>
      )}

      {selectedFee && (
        <>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Card className="p-2 text-center bg-info text-white">
                <strong>Total Amount</strong>
                <h5>{totalFeeAmount}</h5>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-2 text-center bg-success text-white">
                <strong>Amount Paid</strong>
                <h5>{amountPaidFee}</h5>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-2 text-center bg-danger text-white">
                <strong>Due</strong>
                <h5>{dueFee}</h5>
              </Card>
            </Col>
          </Row>

          <Row className="mb-3 g-2 align-items-center">
            <Col md={6}>
              <Form.Control
                type="number"
                placeholder="Enter amount to pay"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                min="0"
                max={dueFee}
              />
            </Col>
            <Col md={6}>
              <Button
                variant="primary"
                onClick={handlePayAmount}
                disabled={payAmount <= 0 || payAmount > dueFee}
              >
                Pay
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default FeeTransactionPage;
