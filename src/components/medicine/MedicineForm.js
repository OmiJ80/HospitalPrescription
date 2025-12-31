import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    category: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedicine = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getMedicineById(id);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch medicine data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchMedicine();
    }
  }, [id, isEditMode, fetchMedicine]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEditMode) {
        await api.updateMedicine(id, formData);
      } else {
        await api.createMedicine(formData);
      }
      
      navigate('/medicines');
    } catch (err) {
      setError('Failed to save medicine');
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="text-center my-5">Loading medicine data...</div>;

  return (
    <Container className="my-4">
      <h2>{isEditMode ? 'Edit Medicine' : 'Add New Medicine'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Medicine Name</Form.Label>
          <Form.Control
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Manufacturer</Form.Label>
          <Form.Control
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Active"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Medicine'}
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => navigate('/medicines')}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default MedicineForm;