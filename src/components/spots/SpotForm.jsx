import React, { useState, useEffect } from 'react';
import { useLocationData } from '../../contexts/LocationDataContext';
import Button from '../common/Button';

const DEPTH_OPTIONS = [
  { value: 'shallow', label: 'Shallow (0-4 ft)' },
  { value: 'medium', label: 'Medium (4-10 ft)' },
  { value: 'deep', label: 'Deep (10+ ft)' }
];

const STRUCTURE_OPTIONS = [
  { value: 'oyster-reefs', label: '🦪 Oyster Reefs' },
  { value: 'grass-flats', label: '🌿 Grass Flats' },
  { value: 'marsh-edge', label: '🌾 Marsh Edge' },
  { value: 'mud-bottom', label: '🟤 Mud Bottom' },
  { value: 'sandy-bottom', label: '🏖️ Sandy Bottom' },
  { value: 'bridge-pilings', label: '🌉 Bridge Pilings' },
  { value: 'rock-jetties', label: '🪨 Rock Jetties' },
  { value: 'pier-pilings', label: '🎣 Pier Pilings' },
  { value: 'channel-edge', label: '📐 Channel Edge' },
  { value: 'shell-reefs', label: '🐚 Shell Reefs' },
  { value: 'cypress-trees', label: '🌲 Cypress Trees' },
  { value: 'lily-pads', label: '🌸 Lily Pads' }
];

const ACCESS_OPTIONS = [
  { value: 'boat', label: '🚤 Boat' },
  { value: 'kayak', label: '🛶 Kayak' },
  { value: 'wade', label: '🚶 Wade Fishing' },
  { value: 'pier', label: '🎣 Pier' },
  { value: 'bank', label: '🏕️ Bank' },
  { value: 'surf', label: '🌊 Surf' }
];

const SpotForm = ({ onSubmit, initialData = null, onCancel, prefilledLocation = null }) => {
  const { locations } = useLocationData();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    parentLocationId: initialData?.parentLocationId || prefilledLocation || '',
    lat: initialData?.lat || '',
    lng: initialData?.lng || '',
    depth: initialData?.depth || '',
    depthFeet: initialData?.depthFeet || '',
    structure: initialData?.structure || [],
    access: initialData?.access || [],
    notes: initialData?.notes || '',
    isPrivate: initialData?.isPrivate ?? true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Update parent location if prefilled
  useEffect(() => {
    if (prefilledLocation && !formData.parentLocationId) {
      setFormData(prev => ({ ...prev, parentLocationId: prefilledLocation }));
    }
  }, [prefilledLocation]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStructureToggle = (structure) => {
    setFormData(prev => ({
      ...prev,
      structure: prev.structure.includes(structure)
        ? prev.structure.filter(s => s !== structure)
        : [...prev.structure, structure]
    }));
  };

  const handleAccessToggle = (access) => {
    setFormData(prev => ({
      ...prev,
      access: prev.access.includes(access)
        ? prev.access.filter(a => a !== access)
        : [...prev.access, access]
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        }));
        setGettingLocation(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enter coordinates manually.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a spot name');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get parent location name for reference
      const parentLocation = locations.find(l => l.id === formData.parentLocationId);
      
      const spotData = {
        ...formData,
        name: formData.name.trim(),
        parentLocationName: parentLocation?.name || 'Unknown Area',
        region: parentLocation?.region || 'Unknown Region',
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        depthFeet: formData.depthFeet ? parseFloat(formData.depthFeet) : null
      };

      await onSubmit(spotData);

      // Reset form if not editing
      if (!initialData) {
        setFormData({
          name: '',
          parentLocationId: prefilledLocation || '',
          lat: '',
          lng: '',
          depth: '',
          depthFeet: '',
          structure: [],
          access: [],
          notes: '',
          isPrivate: true
        });
      }
    } catch (error) {
      console.error('Error saving spot:', error);
      alert('Failed to save spot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  };

  const chipStyle = (isSelected) => ({
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '16px',
    border: isSelected ? '2px solid var(--primary-color)' : '1px solid #d1d5db',
    backgroundColor: isSelected ? '#e0f2fe' : 'white',
    color: isSelected ? 'var(--primary-color)' : '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: isSelected ? '600' : '400'
  });

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Spot Name */}
        <div>
          <label style={labelStyle}>📍 Spot Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., East Point Oyster Reef, My Secret Grass Flat"
            required
            style={inputStyle}
          />
        </div>

        {/* Parent Location */}
        <div>
          <label style={labelStyle}>🗺️ General Area</label>
          <select
            name="parentLocationId"
            value={formData.parentLocationId}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select an area (optional)...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} - {loc.region}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Link this spot to a general fishing area
          </p>
        </div>

        {/* GPS Coordinates */}
        <div>
          <label style={labelStyle}>🛰️ GPS Coordinates</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'start' }}>
            <div>
              <input
                type="text"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="Latitude (e.g., 29.6669)"
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="text"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                placeholder="Longitude (e.g., -90.1092)"
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--primary-color)',
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                cursor: gettingLocation ? 'wait' : 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {gettingLocation ? '📍...' : '📍 Use My Location'}
            </button>
          </div>
          {locationError && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{locationError}</p>
          )}
        </div>

        {/* Depth */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>🌊 Depth Category</label>
            <select
              name="depth"
              value={formData.depth}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select depth...</option>
              {DEPTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>📏 Typical Depth (ft)</label>
            <input
              type="number"
              name="depthFeet"
              value={formData.depthFeet}
              onChange={handleChange}
              placeholder="e.g., 4"
              min="0"
              step="0.5"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Structure */}
        <div>
          <label style={labelStyle}>🏗️ Structure Types</label>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Select all structure types found at this spot
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STRUCTURE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStructureToggle(opt.value)}
                style={chipStyle(formData.structure.includes(opt.value))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Access */}
        <div>
          <label style={labelStyle}>🚶 Access Types</label>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            How can you access this spot?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ACCESS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAccessToggle(opt.value)}
                style={chipStyle(formData.access.includes(opt.value))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>📝 Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Best times, what works here, landmarks, etc..."
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
        </div>

        {/* Privacy Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="isPrivate" style={{ fontSize: '14px', cursor: 'pointer' }}>
            🔒 Keep this spot private (only visible to you)
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '24px',
        justifyContent: 'flex-end'
      }}>
        {onCancel && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          style={{ minWidth: '140px' }}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Spot' : '📍 Save Spot')}
        </Button>
      </div>
    </form>
  );
};

export default SpotForm;






