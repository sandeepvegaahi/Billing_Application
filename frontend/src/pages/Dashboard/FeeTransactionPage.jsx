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

  // Fetch student + fees
  const fetchStudentFees = async () => {
    if (!htNumber) return;
    try {
      const res = await api.get(`/fee-transaction/student/${htNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStudent(res.data.student);

        // Always include Tuition & BusFee
        let feesData = res.data.fees || [];

        // TuitionFee always first
        const tuition = feesData.find(f => f.category === "TuitionFee");
        if (!tuition) feesData.unshift({ category: "TuitionFee", amount: 0 });

        // BusFee always second
        const bus = feesData.find(f => f.category === "BusFee");
        if (!bus) {
          const index = feesData.findIndex(f => f.category !== "TuitionFee");
          feesData.splice(index, 0, { category: "BusFee", amount: 0 });
        }

        setFees(feesData);

        // Total all fees
        const total = feesData.reduce((acc, f) => acc + (f.amount || 0), 0);
        setTotalAllFees(total);
        setAmountPaidAll(0);
        setDueAll(total);

        // reset selected fee
        setSelectedFee(null);
        setTotalFeeAmount(0);
        setAmountPaidFee(0);
        setDueFee(0);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch student fees", "error");
      setStudent(null);
      setFees([]);
    }
  };

  // Fee category click
  const handleSelectFee = (fee) => {
    setSelectedFee(fee);
    setTotalFeeAmount(fee.amount || 0);
    setAmountPaidFee(0);
    setDueFee(fee.amount || 0);
  };

  return (
    <Card className="p-4 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "1200px" }}>
      <h4 className="mb-4 text-center text-primary">Fee Payment</h4>

      {/* HT Number input */}
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

      {/* Student info */}
      {student && (
        <Card className="mb-4 p-3 bg-light">
          <Row>
            <Col><strong>Name:</strong> {student.studentName}</Col>
            <Col><strong>HT Number:</strong> {student.htNumber}</Col>
            <Col><strong>Branch:</strong> {student.branch}</Col>
            <Col><strong>Year:</strong> {student.year}</Col>
          </Row>
        </Card>
      )}

      {/* Total all fees cards */}
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

      {/* Horizontal fee bar (categories only) */}
      {fees.length > 0 && (
        <div className="d-flex gap-2 overflow-auto mb-3">
          {fees.map((f) => (
            <Button
              key={f.category}
              variant={selectedFee?.category === f.category ? "primary" : "outline-primary"}
              onClick={() => handleSelectFee(f)}
            >
              {f.category}
            </Button>
          ))}
        </div>
      )}

      {/* Selected fee cards */}
      {selectedFee && (
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
      )}
    </Card>
  );
};

export default FeeTransactionPage;
