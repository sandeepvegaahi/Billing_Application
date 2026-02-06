import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";

const AddCourseModal = ({ show, onHide }) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [leastYear, setLeastYear] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("/courses", {
        name,
        durationYears: Number(duration),
        leastYear: Number(leastYear),
      });

      Swal.fire("Success", "Course & batches created", "success");
      onHide();
      setName("");
      setDuration("");
      setLeastYear("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Course</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Course Name</Form.Label>
          <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Duration (years)</Form.Label>
          <Form.Control
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Least Year</Form.Label>
          <Form.Control
            type="number"
            value={leastYear}
            onChange={(e) => setLeastYear(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCourseModal;
