import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Row, Col, Card } from "react-bootstrap";

const DashboardHome = () => {
  const token = localStorage.getItem("adminToken");
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchTotalStudents = async () => {
    try {
      const res = await api.get("/students/bulk/count", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setTotalStudents(res.data.count);
      }
    } catch (err) {
      console.error("Dashboard count error:", err);
      setTotalStudents(0);
    }
  };

  useEffect(() => {
    fetchTotalStudents();

    window.addEventListener("studentsUpdated", fetchTotalStudents);
    return () =>
      window.removeEventListener("studentsUpdated", fetchTotalStudents);
  }, []);

  const cards = [
    { title: "Total Students", value: totalStudents },
    { title: "Fee Payment", value: "-" },
    { title: "Fee Structure", value: "-" },
    { title: "Fee Reports", value: "-" },
  ];

  return (
    <Container fluid>
      <Row className="g-3">
        {cards.map((card, i) => (
          <Col md={3} key={i}>
            <Card className="shadow-sm text-center p-3 rounded-3">
              <h6>{card.title}</h6>
              <h2 className="text-primary fw-bold">{card.value}</h2>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DashboardHome;
