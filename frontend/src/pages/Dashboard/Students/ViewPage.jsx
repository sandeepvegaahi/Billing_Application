import { useState } from "react";
import ViewStudents from "./ViewStudents";
import StudentCountCard from "./StudentCountCard";
import { Card, Button } from "react-bootstrap";
import AddCourseModal from "../AddCourseModal";

const ViewPage = () => {
 
  const [show, setShow] = useState(false);

  return (
    <Card
      className="p-4 shadow-sm rounded-4 mx-auto"
      style={{ maxWidth: "1200px" }}
    >
      <h5 className="mb-4 fw-bold text-center text-primary">View Students</h5>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShow(true)}>
          ➕ Add Course
        </Button>
      </div>

      <StudentCountCard />

      <ViewStudents />

      <AddCourseModal show={show} onHide={() => setShow(false)} />
    </Card>
  );
};

export default ViewPage;
