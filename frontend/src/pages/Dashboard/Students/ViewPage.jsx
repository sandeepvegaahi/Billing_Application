import ViewStudents from "./ViewStudents";
import StudentCountCard from "./StudentCountCard";
import { Card } from "react-bootstrap";

const ViewPage = () => {
  return (
    <Card
      className="p-4 shadow-sm rounded-4 mx-auto"
      style={{ maxWidth: "1200px" }}
    >
      <h5 className="mb-4 fw-bold text-center text-primary">View Students</h5>

      {/* Branch-wise + total counts */}
      <StudentCountCard />

      {/* Student table */}
      <ViewStudents />
    </Card>
  );
};

export default ViewPage;
