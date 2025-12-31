import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPrescriptions();
      setPrescriptions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch prescriptions. Please try again later.');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await api.deletePrescription(id);
        setPrescriptions(prescriptions.filter(prescription => prescription.id !== id));
      } catch (err) {
        setError('Failed to delete prescription. Please try again.');
        console.error('Error deleting prescription:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center my-5">Loading prescriptions...</div>;

  return (
    <Container className="my-4">
      <Row className="mb-3">
        <Col>
          <h2>Prescription Management</h2>
        </Col>
        <Col className="text-end">
          <Link to="/prescriptions/add">
            <Button variant="success">Create New Prescription</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {prescriptions.length === 0 ? (
        <Alert variant="info">No prescriptions found. Create a new prescription to get started.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Prescription ID</th>
              <th>Visit Date</th>
              <th>Patient Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(prescription => (
              <tr key={prescription.id}>
                <td>{prescription.prescriptionId}</td>
                <td>{formatDate(prescription.visitDate)}</td>
                <td>{prescription.patientName || `Patient #${prescription.patientId}`}</td>
                <td>
                  <Link to={`/prescriptions/view/${prescription.id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/prescriptions/edit/${prescription.id}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(prescription.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PrescriptionList;