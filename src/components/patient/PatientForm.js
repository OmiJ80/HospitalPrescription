import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getPatientById(id);
      const patient = response.data;
      
      // Format date for form input
      const formattedDate = patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '';
      
      setFormData({
        ...patient,
        dateOfBirth: formattedDate
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch patient data');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    if (isEditMode) {
      fetchPatient();
    }
  }, [id, isEditMode, fetchPatient]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Calculate age if dateOfBirth is provided
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        formData.age = age;
      }
      
      // Generate patientId if not in edit mode
      if (!isEditMode && !formData.patientId) {
        formData.patientId = `P${Date.now().toString().slice(-6)}`;
      }
      
      if (isEditMode) {
        await api.updatePatient(id, formData);
      } else {
        await api.createPatient(formData);
      }
      
      navigate('/patients');
    } catch (err) {
      setError('Failed to save patient');
      console.error('Error saving patient:', err);
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) return <div className="text-center my-5">Loading patient data...</div>;
  
  return (
    <Container className="my-4">
      <h2>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control
            type="tel"
            name="contactNumber"
            value={formData.contactNumber || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Patient'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PatientForm;