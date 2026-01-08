import { Card, Row, Col } from "react-bootstrap";

const RecentTransactions = () => {
  return (
    <Row>
      <Col>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Recent Transactions</Card.Title>
            <p className="text-muted mt-3">
              Recent fee payment transactions will be shown here
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RecentTransactions;
