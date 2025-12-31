import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PrescriptionPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prescriptionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching prescription with ID:', id);
        const prescriptionRes = await api.getPrescriptionById(id);
        
        if (!prescriptionRes.data) {
          throw new Error('No prescription data returned');
        }
        
        console.log('Prescription data:', prescriptionRes.data);
        setPrescription(prescriptionRes.data);
        
        if (prescriptionRes.data && prescriptionRes.data.patientId) {
          console.log('Fetching patient with ID:', prescriptionRes.data.patientId);
          const patientRes = await api.getPatientById(prescriptionRes.data.patientId);
          console.log('Patient data:', patientRes.data);
          setPatient(patientRes.data);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load prescription data: ' + (err.message || 'Unknown error'));
        console.error('Error fetching prescription:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);


  
  const handleDownloadPDF = () => {
    if (!prescriptionRef.current) return;
    
    // Add a loading indicator
    setLoading(true);
    
    const printContent = prescriptionRef.current;
    const options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true
    };
    
    html2canvas(printContent, options)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9;
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Prescription-${prescription.prescriptionId || 'download'}.pdf`);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
        setLoading(false);
      });
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the prescription');
      return;
    }
    
    const printContent = prescriptionRef.current ? prescriptionRef.current.innerHTML : '';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription ${prescription && prescription.prescriptionId ? prescription.prescriptionId : ''}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { padding: 20px; }
            .prescription-document { max-width: 800px; margin: 0 auto; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin-left: auto; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="prescription-document">
            ${printContent}
          </div>
          <div class="no-print text-center mt-4">
            <button onclick="window.print();" class="btn btn-primary">Print</button>
            <button onclick="window.close();" class="btn btn-secondary ms-2">Close</button>
          </div>
          <script>
            window.onload = function() {
              try { window.print(); } catch (e) {}
              var btn = document.querySelector('.btn-primary');
              if (btn) { btn.focus(); }
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center my-5">Loading prescription data...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!prescription) return <div className="alert alert-warning">Prescription not found</div>;

  return (
    <Container className="my-4 prescription-print">
      <div className="d-print-none mb-4">
        <Button variant="primary" onClick={handlePrint} className="me-2">
          Print Prescription
        </Button>
        <Button variant="success" onClick={handleDownloadPDF} className="me-2">
          Download PDF
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/prescriptions/view/${id}`)}>
          Back to View
        </Button>
      </div>
      
      <div className="prescription-document" ref={prescriptionRef}>
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h2 className="mb-0">Medical Prescription</h2>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h4>Prescription Details</h4>
                <p><strong>Prescription ID:</strong> {prescription.prescriptionId}</p>
                <p><strong>Date:</strong> {formatDate(prescription.visitDate || prescription.prescriptionDate)}</p>
              </Col>
              <Col md={6}>
                <h4>Patient Information</h4>
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
            {(prescription.prescriptionItems || prescription.medicineItems) && 
             (prescription.prescriptionItems || prescription.medicineItems).length > 0 ? (
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
                  {(prescription.prescriptionItems || prescription.medicineItems).map((item, index) => (
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
            
            <div className="mt-5 text-end">
              <p>Doctor's Signature</p>
              <div className="signature-line"></div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PrescriptionPrint;