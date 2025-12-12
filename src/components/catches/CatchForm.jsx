import React, { useState, useRef } from 'react';
import { useLocationData } from '../../contexts/LocationDataContext';
import Button from '../common/Button';
import speciesData from '../../data/species.json';
import { loadUserSpots, addUserSpot } from '../../utils/localStorage';

const STRUCTURE_OPTIONS = [
  { value: 'oyster-reefs', label: '🦪 Oyster' },
  { value: 'grass-flats', label: '🌿 Grass' },
  { value: 'marsh-edge', label: '🌾 Marsh' },
  { value: 'mud-bottom', label: '🟤 Mud' },
  { value: 'sandy-bottom', label: '🏖️ Sand' },
  { value: 'bridge-pilings', label: '🌉 Bridge' },
  { value: 'rock-jetties', label: '🪨 Jetties' },
  { value: 'channel-edge', label: '📐 Channel' }
];

const DEPTH_OPTIONS = [
  { value: 'shallow', label: 'Shallow (0-4 ft)' },
  { value: 'medium', label: 'Medium (4-10 ft)' },
  { value: 'deep', label: 'Deep (10+ ft)' }
];

const CatchForm = ({ onSubmit, initialData = null, onCancel }) => {
  const { locations } = useLocationData();
  const fileInputRef = useRef(null);
  const userSpots = loadUserSpots();
  
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toTimeString().slice(0, 5),
    locationId: initialData?.locationId || '',
    userSpotId: initialData?.userSpotId || '',
    species: initialData?.species || '',
    weight: initialData?.weight || '',
    length: initialData?.length || '',
    baitUsed: initialData?.baitUsed || '',
    weather: initialData?.weather || '',
    waterConditions: initialData?.waterConditions || '',
    notes: initialData?.notes || '',
    photo: initialData?.photo || null,
    rating: initialData?.rating || 3,
    // Spot info for this catch
    spotDepth: initialData?.spotDepth || '',
    spotStructure: initialData?.spotStructure || [],
    gpsLat: initialData?.gpsLat || '',
    gpsLng: initialData?.gpsLng || ''
  });
  
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpotDetails, setShowSpotDetails] = useState(false);
  const [saveAsSpot, setSaveAsSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStructureToggle = (structure) => {
    setFormData(prev => ({
      ...prev,
      spotStructure: prev.spotStructure.includes(structure)
        ? prev.spotStructure.filter(s => s !== structure)
        : [...prev.spotStructure, structure]
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          gpsLat: position.coords.latitude.toFixed(6),
          gpsLng: position.coords.longitude.toFixed(6)
        }));
        setGettingLocation(false);
      },
      (error) => {
        alert('Unable to get your location');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image if needed
        compressImage(reader.result, 800, 0.8).then(compressed => {
          setPhotoPreview(compressed);
          setFormData(prev => ({ ...prev, photo: compressed }));
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Compress image to reduce localStorage size
  const compressImage = (base64, maxWidth, quality) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.locationId || !formData.species) {
      alert('Please select a location and species');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get location name for display
      const location = locations.find(l => l.id === formData.locationId);
      const userSpot = userSpots.find(s => s.id === formData.userSpotId);
      const speciesInfo = speciesData.find(s => s.id === formData.species);
      
      // Save as new spot if requested
      if (saveAsSpot && newSpotName.trim()) {
        const newSpot = addUserSpot({
          name: newSpotName.trim(),
          parentLocationId: formData.locationId,
          parentLocationName: location?.name,
          region: location?.region,
          lat: formData.gpsLat ? parseFloat(formData.gpsLat) : null,
          lng: formData.gpsLng ? parseFloat(formData.gpsLng) : null,
          depth: formData.spotDepth,
          structure: formData.spotStructure,
          notes: `Created from catch log on ${formData.date}`,
          isPrivate: true
        });
        // Use the new spot for this catch
        formData.userSpotId = newSpot.id;
      }
      
      const catchData = {
        ...formData,
        locationName: location?.name || 'Unknown Location',
        userSpotName: userSpot?.name || (saveAsSpot ? newSpotName : null),
        speciesName: speciesInfo?.name || formData.species,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        rating: parseInt(formData.rating),
        gpsLat: formData.gpsLat ? parseFloat(formData.gpsLat) : null,
        gpsLng: formData.gpsLng ? parseFloat(formData.gpsLng) : null
      };
      
      await onSubmit(catchData);
      
      // Reset form if not editing
      if (!initialData) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          locationId: '',
          userSpotId: '',
          species: '',
          weight: '',
          length: '',
          baitUsed: '',
          weather: '',
          waterConditions: '',
          notes: '',
          photo: null,
          rating: 3,
          spotDepth: '',
          spotStructure: [],
          gpsLat: '',
          gpsLng: ''
        });
        setPhotoPreview(null);
        setShowSpotDetails(false);
        setSaveAsSpot(false);
        setNewSpotName('');
      }
    } catch (error) {
      console.error('Error submitting catch:', error);
      alert('Failed to save catch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user spots for selected location
  const spotsForLocation = formData.locationId 
    ? userSpots.filter(s => s.parentLocationId === formData.locationId)
    : [];

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Date & Time */}
        <div>
          <label style={labelStyle}>Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        
        <div>
          <label style={labelStyle}>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        
        {/* Location */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Location *</label>
          <select
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select a location...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name} - {loc.region}</option>
            ))}
          </select>
        </div>

        {/* User Spot Selection (if location selected and has spots) */}
        {formData.locationId && spotsForLocation.length > 0 && (
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>📍 Your Spot (Optional)</label>
            <select
              name="userSpotId"
              value={formData.userSpotId}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select one of your spots...</option>
              {spotsForLocation.map(spot => (
                <option key={spot.id} value={spot.id}>
                  {spot.name} {spot.depth && `(${spot.depth})`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Species */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Species Caught *</label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select species...</option>
            {speciesData.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Weight & Length */}
        <div>
          <label style={labelStyle}>Weight (lbs)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="e.g., 5.5"
            style={inputStyle}
          />
        </div>
        
        <div>
          <label style={labelStyle}>Length (inches)</label>
          <input
            type="number"
            name="length"
            value={formData.length}
            onChange={handleChange}
            min="0"
            step="0.25"
            placeholder="e.g., 24"
            style={inputStyle}
          />
        </div>
        
        {/* Bait Used */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Bait/Lure Used</label>
          <input
            type="text"
            name="baitUsed"
            value={formData.baitUsed}
            onChange={handleChange}
            placeholder="e.g., Live shrimp, Gold spoon, Soft plastic"
            style={inputStyle}
          />
        </div>
        
        {/* Weather & Water Conditions */}
        <div>
          <label style={labelStyle}>Weather</label>
          <select
            name="weather"
            value={formData.weather}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select...</option>
            <option value="sunny">☀️ Sunny</option>
            <option value="partly-cloudy">⛅ Partly Cloudy</option>
            <option value="cloudy">☁️ Cloudy</option>
            <option value="rainy">🌧️ Rainy</option>
            <option value="stormy">⛈️ Stormy</option>
            <option value="windy">💨 Windy</option>
            <option value="foggy">🌫️ Foggy</option>
          </select>
        </div>
        
        <div>
          <label style={labelStyle}>Water Conditions</label>
          <select
            name="waterConditions"
            value={formData.waterConditions}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select...</option>
            <option value="clear">💎 Clear</option>
            <option value="slightly-murky">🟢 Slightly Murky</option>
            <option value="murky">🟤 Murky</option>
            <option value="muddy">⬛ Muddy</option>
            <option value="choppy">🌊 Choppy</option>
            <option value="calm">😌 Calm</option>
          </select>
        </div>

        {/* Spot Details Toggle */}
        <div style={{ gridColumn: 'span 2' }}>
          <button
            type="button"
            onClick={() => setShowSpotDetails(!showSpotDetails)}
            style={{
              background: 'none',
              border: '1px dashed var(--border-color)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📍 {showSpotDetails ? 'Hide' : 'Add'} Spot Details (GPS, Depth, Structure)
            <span>{showSpotDetails ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Spot Details Section */}
        {showSpotDetails && (
          <div style={{ 
            gridColumn: 'span 2',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
              📍 Spot Details
            </h4>

            {/* GPS */}
            <div>
              <label style={{ ...labelStyle, fontSize: '13px' }}>🛰️ GPS Coordinates</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                <input
                  type="text"
                  name="gpsLat"
                  value={formData.gpsLat}
                  onChange={handleChange}
                  placeholder="Latitude"
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
                />
                <input
                  type="text"
                  name="gpsLng"
                  value={formData.gpsLng}
                  onChange={handleChange}
                  placeholder="Longitude"
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--primary-color)',
                    backgroundColor: 'white',
                    color: 'var(--primary-color)',
                    cursor: gettingLocation ? 'wait' : 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {gettingLocation ? '📍...' : '📍 Get GPS'}
                </button>
              </div>
            </div>

            {/* Depth */}
            <div>
              <label style={{ ...labelStyle, fontSize: '13px' }}>🌊 Depth</label>
              <select
                name="spotDepth"
                value={formData.spotDepth}
                onChange={handleChange}
                style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
              >
                <option value="">Select depth...</option>
                {DEPTH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Structure */}
            <div>
              <label style={{ ...labelStyle, fontSize: '13px' }}>🏗️ Structure</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {STRUCTURE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStructureToggle(opt.value)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      borderRadius: '12px',
                      border: formData.spotStructure.includes(opt.value) 
                        ? '2px solid var(--primary-color)' 
                        : '1px solid #d1d5db',
                      backgroundColor: formData.spotStructure.includes(opt.value) 
                        ? '#e0f2fe' 
                        : 'white',
                      color: formData.spotStructure.includes(opt.value) 
                        ? 'var(--primary-color)' 
                        : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save as Spot */}
            <div style={{ 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '12px',
              marginTop: '4px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={saveAsSpot}
                  onChange={(e) => setSaveAsSpot(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                💾 Save this as a new spot in My Spots
              </label>
              
              {saveAsSpot && (
                <input
                  type="text"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  placeholder="Name for this spot (e.g., 'East Point Oysters')"
                  style={{ 
                    ...inputStyle, 
                    padding: '8px 12px', 
                    fontSize: '13px',
                    marginTop: '8px'
                  }}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Rating */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Trip Rating</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '4px',
                  opacity: star <= formData.rating ? 1 : 0.3,
                  transform: star <= formData.rating ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s, opacity 0.2s'
                }}
              >
                ⭐
              </button>
            ))}
            <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '14px' }}>
              {formData.rating}/5
            </span>
          </div>
        </div>
        
        {/* Photo Upload */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Photo</label>
          <div style={{ 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb'
          }}>
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={photoPreview} 
                  alt="Catch preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📸</div>
                <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
                  Add a photo of your catch
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Choose Photo
                </label>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  Max 5MB • JPG, PNG, or GIF
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Notes */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes about this catch..."
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
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
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Catch' : '🎣 Log Catch')}
        </Button>
      </div>
    </form>
  );
};

export default CatchForm;
