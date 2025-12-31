import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const PrescriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    patientId: '',
    visitDate: new Date().toISOString().split('T')[0],
    notes: '',
    prescriptionItems: []
  });
  
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsRes, medicinesRes] = await Promise.all([
          api.getAllPatients(),
          api.getAllMedicines()
        ]);
        
        setPatients(patientsRes.data);
        setMedicines(medicinesRes.data);
        
        if (isEditMode) {
          const prescriptionRes = await api.getPrescriptionById(id);
          const prescription = prescriptionRes.data;
          
          setFormData({
            patientId: prescription.patientId,
            visitDate: prescription.visitDate ? prescription.visitDate.split('T')[0] : '',
            notes: prescription.notes || '',
            prescriptionItems: prescription.prescriptionItems || []
          });
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.prescriptionItems) payload.prescriptionItems = [];
      if (isEditMode) {
        await api.updatePrescription(id, payload);
      } else {
        await api.createPrescription(payload);
      }
      navigate('/prescriptions');
    } catch (err) {
      setError('Failed to save prescription');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    if (name === 'medicineId') {
      const med = medicines.find(m => String(m.id) === String(value));
      setNewItem(prev => ({ ...prev, medicineId: value, medicineName: med ? med.name : '' }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = () => {
    if (!newItem.medicineId || !newItem.dosage || !newItem.frequency || !newItem.duration) {
      setError('Please select a medicine and fill dosage, frequency, and duration');
      return;
    }
    setFormData(prev => ({
      ...prev,
      prescriptionItems: [
        ...prev.prescriptionItems,
        { 
          ...newItem, 
          medicineId: parseInt(newItem.medicineId, 10),
          duration: parseInt(newItem.duration, 10)
        }
      ]
    }));
    setNewItem({ medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '' });
    setError(null);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.filter((_, i) => i !== index)
    }));
  };

  return (
    <Container className="my-4">
      <h2>{isEditMode ? 'Edit Prescription' : 'New Prescription'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Patient</Form.Label>
          <Form.Select
            name="patientId"
            value={formData.patientId || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="visitDate"
            value={formData.visitDate || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Add Medicines</Form.Label>
          <div className="border p-3 rounded">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <Form.Label className="mb-1">Medicine</Form.Label>
                <Form.Select
                  name="medicineId"
                  value={newItem.medicineId}
                  onChange={handleNewItemChange}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-2">
                <Form.Label className="mb-1">Dosage</Form.Label>
                <Form.Control
                  name="dosage"
                  value={newItem.dosage}
                  onChange={handleNewItemChange}
                  placeholder="e.g., 500mg"
                />
              </div>
              <div className="col-md-2">
                <Form.Label className="mb-1">Frequency</Form.Label>
                <Form.Control
                  name="frequency"
                  value={newItem.frequency}
                  onChange={handleNewItemChange}
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div className="col-md-2">
                <Form.Label className="mb-1">Duration</Form.Label>
                <Form.Control
                  name="duration"
                  value={newItem.duration}
                  onChange={handleNewItemChange}
                  placeholder="e.g., 5 days"
                />
              </div>
              <div className="col-md-2">
                <Button variant="success" onClick={handleAddItem}>
                  Add
                </Button>
              </div>
            </div>

            {formData.prescriptionItems && formData.prescriptionItems.length > 0 && (
              <div className="mt-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prescriptionItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.medicineName || item.medicineId}</td>
                        <td>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Form.Group>
        
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Prescription'}
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => navigate('/prescriptions')}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default PrescriptionForm;