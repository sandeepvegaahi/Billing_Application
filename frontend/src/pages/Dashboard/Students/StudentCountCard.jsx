import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import api from "../../../api/api";

const StudentCountCard = () => {
  const token = localStorage.getItem("adminToken");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [branchCounts, setBranchCounts] = useState([]);

  const fetchBranchCounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const students = res.data.data;

        const counts = { CSE: 0, ECE: 0, EEE: 0, OTHER: 0 };
        students.forEach((s) => {
          const branch = s.branch?.toUpperCase();
          if (branch === "CSE") counts.CSE++;
          else if (branch === "ECE") counts.ECE++;
          else if (branch === "EEE") counts.EEE++;
          else counts.OTHER++;
        });

        const branchArray = Object.keys(counts).map((b) => ({
          branch: b,
          count: counts[b],
        }));

        setBranchCounts(branchArray);
        setTotal(students.length);
      }
    } catch (err) {
      console.error("Failed to fetch students for counts:", err);
      setBranchCounts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchCounts();

    
    const handleUpdate = () => fetchBranchCounts();
    window.addEventListener("studentsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("studentsUpdated", handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-3 mb-3 text-center">
        <Spinner animation="border" size="sm" /> Loading counts...
      </Card>
    );
  }

  if (branchCounts.length === 0) {
    return (
      <Card className="p-3 mb-3 text-center text-danger">
        No student data found.
      </Card>
    );
  }


  const cardColors = {
    TOTAL: "bg-primary text-white",
    CSE: "bg-success text-white",
    ECE: "bg-warning text-dark",
    EEE: "bg-info text-white",
    OTHER: "bg-secondary text-white",
  };

  return (
    <Row className="mb-4 g-3">
   
      <Col md={3}>
        <Card
          className={`p-3 shadow-sm rounded-4 text-center ${cardColors.TOTAL}`}
        >
          <h6>Total Students</h6>
          <h3 className="fw-bold">{total}</h3>
        </Card>
      </Col>

     
      {branchCounts.map((b) => (
        <Col md={3} key={b.branch}>
          <Card
            className={`p-3 shadow-sm rounded-4 text-center ${
              cardColors[b.branch] || "bg-light"
            }`}
          >
            <h6 className="text-uppercase">{b.branch}</h6>
            <h4 className="fw-bold">{b.count}</h4>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StudentCountCard;
