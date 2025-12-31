import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.getAllMedicines();
      setMedicines(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch medicines. Please try again later.');
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        setMedicines(medicines.filter(medicine => medicine.id !== id));
      } catch (err) {
        setError('Failed to delete medicine. Please try again.');
        console.error('Error deleting medicine:', err);
      }
    }
  };

  if (loading) return <div className="text-center my-5">Loading medicines...</div>;

  return (
    <Container className="my-4">
      <Row className="mb-3">
        <Col>
          <h2>Medicine Management</h2>
        </Col>
        <Col className="text-end">
          <Link to="/medicines/add">
            <Button variant="success">Add New Medicine</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {medicines.length === 0 ? (
        <Alert variant="info">No medicines found. Add a new medicine to get started.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(medicine => (
              <tr key={medicine.id}>
                <td>{medicine.id}</td>
                <td>{medicine.name}</td>
                <td>{medicine.manufacturer}</td>
                <td>{medicine.category}</td>
                <td>
                  <Badge bg={medicine.isActive ? "success" : "danger"}>
                    {medicine.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  <Link to={`/medicines/view/${medicine.id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/medicines/edit/${medicine.id}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(medicine.id)}
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

export default MedicineList;