import { Card, Row, Col } from "react-bootstrap";

const BranchSummary = () => {
  return (
    <Row className="mb-4">
      <Col>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Branch Wise Summary</Card.Title>
            <p className="text-muted mt-3">
              Branch-wise student and fee details will appear here
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default BranchSummary;
