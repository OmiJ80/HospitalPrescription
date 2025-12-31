import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const PatientView = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await api.getPatientById(id);
                setPatient(response.data);
            } catch (error) {
                console.error('Error fetching patient:', error);
            }
        };

        fetchPatient();
    }, [id]);

    if (!patient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Patient Details</h2>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{patient.firstName} {patient.lastName}</h5>
                    <p className="card-text"><strong>Patient ID:</strong> {patient.patientId}</p>
                    <p className="card-text"><strong>Gender:</strong> {patient.gender}</p>
                    <p className="card-text"><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                    <p className="card-text"><strong>Age:</strong> {patient.age}</p>
                    <p className="card-text"><strong>Contact Number:</strong> {patient.contactNumber}</p>
                    <p className="card-text"><strong>Email:</strong> {patient.email}</p>
                    <p className="card-text"><strong>Address:</strong> {patient.address}</p>
                    <Link to={`/patients/edit/${id}`} className="btn btn-primary">Edit</Link>
                    <Link to="/patients" className="btn btn-secondary ms-2">Back to List</Link>
                </div>
            </div>
        </div>
    );
};

export default PatientView;