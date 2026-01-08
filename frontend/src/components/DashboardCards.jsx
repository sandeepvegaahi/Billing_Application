import { Row, Col, Card } from "react-bootstrap";

const DashboardCards = ({ totalStudents }) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Total Students</Card.Title>
            <h3>{totalStudents}</h3>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Fees Collected</Card.Title>
            <span className="text-muted">—</span>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Pending Dues</Card.Title>
            <span className="text-muted">—</span>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Collection Rate</Card.Title>
            <span className="text-muted">—</span>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCards;
