import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PrescriptionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prescriptionRes = await api.getPrescriptionById(id);
        if (!prescriptionRes.data) {
          throw new Error('No prescription data returned');
        }
        setPrescription(prescriptionRes.data);
        if (prescriptionRes.data && prescriptionRes.data.patientId) {
          const patientRes = await api.getPatientById(prescriptionRes.data.patientId);
          setPatient(patientRes.data);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load prescription data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center my-5">Loading prescription...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!prescription) return <div className="alert alert-warning">Prescription not found</div>;

  const items = (prescription.prescriptionItems || prescription.medicineItems) || [];

  return (
    <Container className="my-4">
      <div className="d-print-none mb-4">
        <Button variant="primary" className="me-2" onClick={() => navigate(`/prescriptions/print/${id}`)}>
          Print Prescription
        </Button>
        <Button variant="secondary" onClick={() => navigate('/prescriptions')}>
          Back to List
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-info text-white">
          <h2 className="mb-0">Prescription Details</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>General</h4>
              <p><strong>Prescription ID:</strong> {prescription.prescriptionId}</p>
              <p><strong>Date:</strong> {formatDate(prescription.visitDate || prescription.prescriptionDate)}</p>
            </Col>
            <Col md={6}>
              <h4>Patient</h4>
              {patient ? (
                <>
                  <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                  <p><strong>Patient ID:</strong> {patient.patientId}</p>
                  <p><strong>Age:</strong> {patient.age} years</p>
                  <p><strong>Gender:</strong> {patient.gender}</p>
                </>
              ) : (
                <p>Patient information not available</p>
              )}
            </Col>
          </Row>

          <hr />

          <h4>Prescribed Medicines</h4>
          {items.length > 0 ? (
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.medicineName || item.medicineId}</td>
                    <td>{item.dosage}</td>
                    <td>{item.frequency}</td>
                    <td>{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No medicines prescribed</p>
          )}

          <hr />

          <h4>Notes</h4>
          <p>{prescription.notes || 'No additional notes'}</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrescriptionView;