import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPatients();
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients. Please try again later.');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.deletePatient(id);
        setPatients(patients.filter(patient => patient.id !== id));
      } catch (err) {
        setError('Failed to delete patient. Please try again.');
        console.error('Error deleting patient:', err);
      }
    }
  };

  const normalized = (s) => (s || '').toString().toLowerCase();
  const filteredPatients = patients.filter(p => {
    const q = normalized(query);
    if (!q) return true;
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    return (
      normalized(name).includes(q) ||
      normalized(p.patientId).includes(q) ||
      normalized(p.contactNumber).includes(q)
    );
  });

  if (loading) return <div className="text-center my-5">Loading patients...</div>;

  return (
    <Container className="my-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2>Patient Management</h2>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by Name, Patient ID, or Mobile"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          <Link to="/patients/add">
            <Button variant="success">Add New Patient</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {filteredPatients.length === 0 ? (
        <Alert variant="info">No patients match your search.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.patientId}</td>
                <td>{patient.firstName} {patient.lastName}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.contactNumber}</td>
                <td>
                  <Link to={`/patients/view/${patient.id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/patients/history/${patient.id}`}>
                    <Button variant="secondary" size="sm" className="me-2">History</Button>
                  </Link>
                  <Link to={`/patients/edit/${patient.id}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(patient.id)}
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

export default PatientList;