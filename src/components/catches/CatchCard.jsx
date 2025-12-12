import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import ShareCatchModal from './ShareCatchModal';

const CatchCard = ({ catchData, onEdit, onDelete, compact = false }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getWeatherEmoji = (weather) => {
    const emojis = {
      'sunny': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'windy': '💨',
      'foggy': '🌫️'
    };
    return emojis[weather] || '🌤️';
  };

  const getWaterEmoji = (water) => {
    const emojis = {
      'clear': '💎',
      'slightly-murky': '🟢',
      'murky': '🟤',
      'muddy': '⬛',
      'choppy': '🌊',
      'calm': '😌'
    };
    return emojis[water] || '🌊';
  };

  const handleDelete = () => {
    onDelete(catchData.id);
    setShowDeleteConfirm(false);
  };

  const getSpeciesIcon = (species) => {
    const icons = {
      'redfish': '🔴',
      'speckledTrout': '⚫',
      'flounder': '🫓',
      'blackDrum': '⬛',
      'sheepshead': '🦓',
      'snook': '🐟',
      'tarpon': '🐠'
    };
    return icons[species] || '🐟';
  };

  if (compact) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onClick={() => navigate(`/catches/${catchData.id}`)}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {catchData.photo && !imageError ? (
          <img 
            src={catchData.photo} 
            alt={catchData.speciesName}
            onError={() => setImageError(true)}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {getSpeciesIcon(catchData.species)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {catchData.speciesName || catchData.species}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {formatDate(catchData.date)} • {catchData.locationName}
          </div>
        </div>
        {catchData.weight && (
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#059669'
          }}>
            {catchData.weight} lbs
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      {/* Photo Section */}
      {catchData.photo && !imageError ? (
        <div style={{ 
          position: 'relative',
          paddingTop: '66.67%', // 3:2 aspect ratio
          backgroundColor: '#f3f4f6'
        }}>
          <img 
            src={catchData.photo} 
            alt={catchData.speciesName}
            onError={() => setImageError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Rating Badge */}
          {catchData.rating && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>⭐</span>
              <span>{catchData.rating}/5</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          height: '120px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <span style={{ fontSize: '48px' }}>{getSpeciesIcon(catchData.species)}</span>
          {catchData.rating && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>⭐</span>
              <span>{catchData.rating}/5</span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827'
          }}>
            {getSpeciesIcon(catchData.species)} {catchData.speciesName || catchData.species}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📍 {catchData.locationName}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '12px'
        }}>
          {/* Date */}
          <div style={{
            padding: '10px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
              DATE
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              {formatDate(catchData.date)}
            </div>
          </div>

          {/* Time */}
          {catchData.time && (
            <div style={{
              padding: '10px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                TIME
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                {catchData.time}
              </div>
            </div>
          )}

          {/* Weight */}
          {catchData.weight && (
            <div style={{
              padding: '10px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#059669', marginBottom: '2px' }}>
                WEIGHT
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                {catchData.weight} lbs
              </div>
            </div>
          )}

          {/* Length */}
          {catchData.length && (
            <div style={{
              padding: '10px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#3b82f6', marginBottom: '2px' }}>
                LENGTH
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                {catchData.length}"
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          marginBottom: catchData.notes ? '12px' : '0'
        }}>
          {catchData.baitUsed && (
            <span style={{
              fontSize: '12px',
              padding: '4px 10px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '20px'
            }}>
              🎣 {catchData.baitUsed}
            </span>
          )}
          {catchData.weather && (
            <span style={{
              fontSize: '12px',
              padding: '4px 10px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '20px'
            }}>
              {getWeatherEmoji(catchData.weather)} {catchData.weather.replace('-', ' ')}
            </span>
          )}
          {catchData.waterConditions && (
            <span style={{
              fontSize: '12px',
              padding: '4px 10px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '20px'
            }}>
              {getWaterEmoji(catchData.waterConditions)} {catchData.waterConditions.replace('-', ' ')}
            </span>
          )}
        </div>

        {/* Notes */}
        {catchData.notes && (
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#4b5563',
            borderLeft: '3px solid #3b82f6',
            marginBottom: '12px'
          }}>
            "{catchData.notes}"
          </div>
        )}

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '12px',
          marginTop: '8px',
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowShareModal(true)}
            style={{ 
              flex: '1 1 45%', 
              fontSize: '13px', 
              padding: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              borderColor: 'transparent'
            }}
          >
            📤 Share
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/location/${catchData.locationId}`)}
            style={{ flex: '1 1 45%', fontSize: '13px', padding: '8px' }}
          >
            📍 View Spot
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onEdit(catchData)}
            style={{ flex: '1 1 45%', fontSize: '13px', padding: '8px' }}
          >
            ✏️ Edit
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteConfirm(true)}
            style={{ 
              flex: '1 1 45%', 
              fontSize: '13px', 
              padding: '8px',
              color: '#dc2626',
              borderColor: '#fecaca'
            }}
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Delete this catch?</h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
              This action cannot be undone. The catch record and photo will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626'
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareCatchModal 
          catchData={catchData}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default CatchCard;

