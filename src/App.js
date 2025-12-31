import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PrescriptionView from './components/prescription/PrescriptionView';

// Layout Components
import Header from './components/layout/Header';

// Patient Components
import PatientList from './components/patient/PatientList';
import PatientForm from './components/patient/PatientForm';
import PatientView from './components/patient/PatientView';
import PatientHistory from './components/patient/PatientHistory';

// Medicine Components
import MedicineList from './components/medicine/MedicineList';
import MedicineForm from './components/medicine/MedicineForm';

// Prescription Components
import PrescriptionList from './components/prescription/PrescriptionList';
import PrescriptionForm from './components/prescription/PrescriptionForm';
import PrescriptionPrint from './components/prescription/PrescriptionPrint';

const Home = () => (
  <div className="container mt-4">
    <h1 className="text-center mb-4">Welcome to Hospital Prescription System</h1>
    <div className="row">
      <div className="col-md-3">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Patient Management</h5>
            <p className="card-text">Register new patients and manage existing patient records.</p>
            <a href="/patients" className="btn btn-primary">Manage Patients</a>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Medicine Database</h5>
            <p className="card-text">Add, update, and manage medicines in the hospital database.</p>
            <a href="/medicines" className="btn btn-primary">Manage Medicines</a>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Prescription Management</h5>
            <p className="card-text">Create and view patient prescriptions.</p>
            <a href="/prescriptions" className="btn btn-primary">Manage Prescriptions</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/add" element={<PatientForm />} />
            <Route path="/patients/edit/:id" element={<PatientForm />} />
            <Route path="/patients/view/:id" element={<PatientView />} />
            <Route path="/patients/history/:id" element={<PatientHistory />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/medicines/add" element={<MedicineForm />} />
            <Route path="/medicines/edit/:id" element={<MedicineForm />} />
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/prescriptions/add" element={<PrescriptionForm />} />
            <Route path="/prescriptions/edit/:id" element={<PrescriptionForm />} />
            <Route path="/prescriptions/view/:id" element={<PrescriptionView />} />
            <Route path="/prescriptions/print/:id" element={<PrescriptionPrint />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
