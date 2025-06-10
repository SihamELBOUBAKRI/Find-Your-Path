import React, { useEffect, useState } from 'react';
import api from '../api';
import { Offcanvas, Modal, Button, Form, Pagination, Spinner } from 'react-bootstrap';
import ConfirmForm from '../pages/alerts/ConfirmForm';
import SuccessAlert from '../pages/alerts/SuccessAlert';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import PageLoading from '../pages/loading/loading';
import { useNavigate } from 'react-router-dom';

const AdminInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [majors, setMajors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate=useNavigate();
  const handleView = (institution) => {
    navigate(`${institution.id}`);
  };

  useEffect(() => {
    fetchInstitutions();
  }, [page]);

  const fetchInstitutions = async () => {
    try {
      const res = await api.get(`/institutions?page=${page}`);
      setInstitutions(res.data.data);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleShowMajors = async (institution) => {
    setSelectedInstitution(institution);
    try {
      const res = await api.get(`/institutions/${institution.id}/majors`);
      setMajors(res.data.data);
      setShowOffcanvas(true);
    } catch (err) {
      console.error(err);
    }
  };

  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
        {i}
      </Pagination.Item>
    );
  }

  if (loading) return <PageLoading />;

  return (
    <div className="container mt-4">
      <h2>Institutions</h2>
      <Button onClick={() => setShowAddModal(true)} className="mb-3">Add Institution</Button>
      {institutions.map(inst => (
        <div key={inst.id} className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center">
          <span>{inst.name}</span>
          <div>
            <Button variant="info" size="sm" onClick={() => handleView(inst)}>View</Button>
            <Button variant="primary" size="sm" onClick={() => { setSelectedInstitution(inst); setShowEditModal(true); }}>Edit</Button>{' '}
            <Button variant="secondary" size="sm" onClick={() => handleShowMajors(inst)}>Majors</Button>
          </div>
        </div>
      ))}

      <Pagination>{paginationItems}</Pagination>


      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Institution</Modal.Title></Modal.Header>
        <Modal.Body>
          {/* You can create a separate AddInstitutionForm component here */}
          <p>Form to add new institution</p>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Institution</Modal.Title></Modal.Header>
        <Modal.Body>
          {/* You can create a separate EditInstitutionForm component here */}
          <p>Form to edit institution: {selectedInstitution?.name}</p>
        </Modal.Body>
      </Modal>

      {/* Offcanvas Majors */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedInstitution?.name} Majors</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {majors.length === 0 ? (
            <p>No majors associated.</p>
          ) : (
            majors.map(major => (
              <div key={major.id} className="mb-2">
                <strong>{major.name}</strong><br />
                <small>Duration: {major.pivot?.duration}</small><br />
                <small>Requirements: {major.pivot?.requirements}</small>
              </div>
            ))
          )}
          <Button variant="success" className="mt-3">Add Major</Button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default AdminInstitutions;
