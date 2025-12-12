import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import CatchForm from '../components/catches/CatchForm';
import CatchGallery from '../components/catches/CatchGallery';
import { loadCatches, addCatch, updateCatch, deleteCatch } from '../utils/localStorage';

const CatchLog = () => {
  const [catches, setCatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCatch, setEditingCatch] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'log'

  // Load catches on mount
  useEffect(() => {
    setCatches(loadCatches());
  }, []);

  const handleAddCatch = (catchData) => {
    const newCatch = addCatch(catchData);
    setCatches(prev => [newCatch, ...prev]);
    setShowForm(false);
    setActiveTab('gallery');
  };

  const handleUpdateCatch = (catchData) => {
    const updated = updateCatch(editingCatch.id, catchData);
    if (updated) {
      setCatches(prev => prev.map(c => c.id === editingCatch.id ? updated : c));
    }
    setEditingCatch(null);
    setShowForm(false);
  };

  const handleDeleteCatch = (catchId) => {
    deleteCatch(catchId);
    setCatches(prev => prev.filter(c => c.id !== catchId));
  };

  const handleEdit = (catchData) => {
    setEditingCatch(catchData);
    setShowForm(true);
    setActiveTab('log');
  };

  const handleCancelEdit = () => {
    setEditingCatch(null);
    setShowForm(false);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '32px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎣 Catch Log
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px' }}>
          Track your catches and build your personal fishing gallery
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => {
            setActiveTab('gallery');
            setShowForm(false);
            setEditingCatch(null);
          }}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'gallery' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'gallery' ? '3px solid #3b82f6' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          📸 Gallery ({catches.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('log');
            setShowForm(true);
          }}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'log' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'log' ? '3px solid #3b82f6' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          ➕ Log New Catch
        </button>
      </div>

      {/* Content */}
      {activeTab === 'log' && (
        <Card 
          title={editingCatch ? '✏️ Edit Catch' : '🎣 Log a New Catch'}
          subtitle={editingCatch ? 'Update the details of your catch' : 'Record the details of your fishing success'}
        >
          <CatchForm
            onSubmit={editingCatch ? handleUpdateCatch : handleAddCatch}
            initialData={editingCatch}
            onCancel={editingCatch ? handleCancelEdit : null}
          />
        </Card>
      )}

      {activeTab === 'gallery' && (
        <div>
          {/* Quick Add Button (floating) */}
          <button
            onClick={() => {
              setActiveTab('log');
              setShowForm(true);
              setEditingCatch(null);
            }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
            }}
            title="Log a new catch"
          >
            +
          </button>

          <CatchGallery
            catches={catches}
            onEdit={handleEdit}
            onDelete={handleDeleteCatch}
          />
        </div>
      )}

      {/* Empty State CTA */}
      {catches.length === 0 && activeTab === 'gallery' && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px'
        }}>
          <button
            onClick={() => {
              setActiveTab('log');
              setShowForm(true);
            }}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}
          >
            🎣 Log Your First Catch
          </button>
        </div>
      )}
    </div>
  );
};

export default CatchLog;






