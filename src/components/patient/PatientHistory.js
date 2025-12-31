import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const PatientHistory = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details
        const patientRes = await api.getPatientById(id);
        setPatient(patientRes.data);
        
        // Fetch patient's prescriptions
        const prescriptionsRes = await api.getPrescriptionsByPatientId(id);
        setPrescriptions(prescriptionsRes.data);
        
        setError(null);
      } catch (err) {
        setError('Failed to load patient history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const applyDateRangeFilter = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    try {
      setLoading(true);
      const res = await api.searchPrescriptionsByPatientAndDateRange(id, startDate, endDate);
      setPrescriptions(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to filter by date range');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOlderThanTwoYears = async () => {
    try {
      setLoading(true);
      const res = await api.getPrescriptionsOlderThanYears(id, 2);
      setPrescriptions(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load prescriptions older than 2 years');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    try {
      setLoading(true);
      setStartDate('');
      setEndDate('');
      const prescriptionsRes = await api.getPrescriptionsByPatientId(id);
      setPrescriptions(prescriptionsRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to clear filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return isNaN(d) ? '' : d.toLocaleDateString();
  };

  if (loading) return <div className="text-center my-5">Loading patient history...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!patient) return <div className="alert alert-warning">Patient not found</div>;

  return (
    <Container className="my-4">
      <h2>Patient Medical History</h2>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Patient Information</h3>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
              <p><strong>Patient ID:</strong> {patient.patientId}</p>
              <p><strong>Date of Birth:</strong> {formatDate(patient.dateOfBirth)}</p>
              <p><strong>Age:</strong> {patient.age} years</p>
            </div>
            <div className="col-md-6">
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Contact:</strong> {patient.contactNumber}</p>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Address:</strong> {patient.address}</p>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      <h3>Prescription History</h3>
      
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mt-2 mt-md-0">
              <Button variant="primary" className="me-2" onClick={applyDateRangeFilter}>Apply Date Range</Button>
              <Button variant="secondary" className="me-2" onClick={clearFilters}>Clear</Button>
              <Button variant="warning" onClick={loadOlderThanTwoYears}>Older than 2 years</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {prescriptions.length === 0 ? (
        <Alert variant="info">No prescription history found for this patient.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Prescription ID</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(prescription => (
              <tr key={prescription.id}>
                <td>{prescription.prescriptionId}</td>
                <td>{formatDate(prescription.visitDate || prescription.prescriptionDate)}</td>
                <td>{prescription.notes ? (prescription.notes.length > 50 ? `${prescription.notes.substring(0, 50)}...` : prescription.notes) : 'No notes'}</td>
                <td>
                  <Link to={`/prescriptions/view/${prescription.id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/prescriptions/print/${prescription.id}`}>
                    <Button variant="primary" size="sm">Print</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      <div className="mt-3">
        <Link to={`/patients/view/${id}`}>
          <Button variant="secondary">Back to Patient</Button>
        </Link>
        <Link to={`/prescriptions/add`} className="ms-2">
          <Button variant="success">Create New Prescription</Button>
        </Link>
      </div>
    </Container>
  );
};

export default PatientHistory;