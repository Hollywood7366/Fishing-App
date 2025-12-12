import React, { useState, useEffect } from 'react';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { useChat } from '../contexts/ChatContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  requestNotificationPermission, 
  getPermissionStatus, 
  sendTestNotification 
} from '../utils/notifications';

const Preferences = () => {
  const {
    availableSpecies,
    targetSpecies,
    toggleTargetSpecies,
    preferences,
    updatePreferences,
    notificationSettings,
    updateNotificationSettings
  } = useUserPreferences();
  
  const { apiKey, updateApiKey, hasApiKey } = useChat();
  
  const [notificationPermission, setNotificationPermission] = useState(getPermissionStatus());
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  
  // Sync tempApiKey with apiKey from context when it loads from localStorage
  useEffect(() => {
    if (apiKey && !tempApiKey) {
      setTempApiKey(apiKey);
    }
  }, [apiKey, tempApiKey]);
  
  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      updateNotificationSettings({ enabled: true });
    }
  };
  
  const handleTestNotification = () => {
    sendTestNotification();
  };
  
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Preferences</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Customize your fishing app experience
        </p>
      </div>
      
      {/* Target Species */}
      <Card title="Target Species" subtitle="Select species you're interested in for personalized recommendations" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '16px'
        }}>
          {availableSpecies.map(species => {
            const isSelected = targetSpecies.includes(species.id);
            return (
              <div
                key={species.id}
                onClick={() => toggleTargetSpecies(species.id)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                    {species.name}
                  </span>
                  {isSelected && <span style={{ fontSize: '20px' }}>✓</span>}
                </div>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic'
                }}>
                  {species.scientificName}
                </p>
              </div>
            );
          })}
        </div>
        
        {targetSpecies.length === 0 && (
          <p style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#fff3e0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#f57c00'
          }}>
            💡 Tip: Select species to get customized fishing scores based on their preferences
          </p>
        )}
      </Card>
      
      {/* Notifications */}
      <Card title="Notifications" subtitle="Get alerted when fishing conditions are great" style={{ marginBottom: '20px' }}>
        <div style={{ marginTop: '16px' }}>
          {notificationPermission === 'granted' ? (
            <div>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#e8f5e9',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#2e7d32'
              }}>
                ✓ Notifications are enabled
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.enabled}
                    onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>
                    Enable fishing condition alerts
                  </span>
                </label>
              </div>
              
              {notificationSettings.enabled && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '8px'
                    }}>
                      Alert Threshold (Score)
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      step="5"
                      value={notificationSettings.threshold}
                      onChange={(e) => updateNotificationSettings({ threshold: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>50 (Fair)</span>
                      <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {notificationSettings.threshold}
                      </span>
                      <span>90 (Excellent)</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '8px'
                    }}>
                      Notification Time Window
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={notificationSettings.timeWindow.start}
                        onChange={(e) => updateNotificationSettings({
                          timeWindow: {
                            ...notificationSettings.timeWindow,
                            start: parseInt(e.target.value)
                          }
                        })}
                        style={{
                          width: '80px',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={notificationSettings.timeWindow.end}
                        onChange={(e) => updateNotificationSettings({
                          timeWindow: {
                            ...notificationSettings.timeWindow,
                            end: parseInt(e.target.value)
                          }
                        })}
                        style={{
                          width: '80px',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        (24-hour format)
                      </span>
                    </div>
                  </div>
                  
                  {/* Bite Time Alerts */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.biteTimeAlerts || false}
                        onChange={(e) => updateNotificationSettings({ biteTimeAlerts: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: '500' }}>
                          🎣 Bite Time Reminders
                        </span>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: '13px', 
                          color: 'var(--text-secondary)'
                        }}>
                          Get alerts 15 min before major solunar feeding periods
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Excellent Conditions Alert */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.excellentConditionsAlert || false}
                        onChange={(e) => updateNotificationSettings({ excellentConditionsAlert: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: '500' }}>
                          ⭐ Excellent Conditions Alert
                        </span>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: '13px', 
                          color: 'var(--text-secondary)'
                        }}>
                          Alert when conditions reach 85+ at favorite locations
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <Button variant="secondary" onClick={handleTestNotification}>
                    Send Test Notification
                  </Button>
                </>
              )}
            </div>
          ) : notificationPermission === 'denied' ? (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffebee',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#c62828'
            }}>
              ✗ Notifications are blocked. Please enable them in your browser settings.
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                Enable notifications to receive alerts when fishing conditions are excellent at your favorite spots.
              </p>
              <Button onClick={handleRequestNotifications}>
                Enable Notifications
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* AI Chat Assistant */}
      <Card title="AI Chat Assistant" subtitle="Configure the fishing assistant chatbot" style={{ marginBottom: '20px' }}>
        <div style={{ marginTop: '16px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: hasApiKey ? '#e8f5e9' : '#fff3e0',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            color: hasApiKey ? '#2e7d32' : '#f57c00',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {hasApiKey ? '✓ API key configured' : '🔑 API key required to use chat assistant'}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px'
            }}>
              OpenAI API Key
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              onClick={() => {
                const keyToSave = tempApiKey.trim();
                console.log('Saving API key:', keyToSave ? 'key provided' : 'no key');
                if (keyToSave) {
                  updateApiKey(keyToSave);
                }
              }}
              disabled={!tempApiKey.trim() || tempApiKey === apiKey}
            >
              Save API Key
            </Button>
            {hasApiKey && (
              <Button 
                variant="secondary"
                onClick={() => {
                  setTempApiKey('');
                  updateApiKey('');
                }}
              >
                Remove Key
              </Button>
            )}
          </div>
          
          <p style={{ 
            marginTop: '16px', 
            fontSize: '13px', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)' }}
            >
              OpenAI's platform
            </a>. 
            The chat uses GPT-4o-mini (~$0.15 per 1M tokens). Your key is stored locally in your browser.
          </p>
        </div>
      </Card>
      
      {/* Units */}
      <Card title="Units" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px'
            }}>
              Temperature
            </label>
            <select
              value={preferences.units.temperature}
              onChange={(e) => updatePreferences({
                units: { ...preferences.units, temperature: e.target.value }
              })}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '16px',
                backgroundColor: 'white',
                minWidth: '150px'
              }}
            >
              <option value="fahrenheit">Fahrenheit (°F)</option>
              <option value="celsius">Celsius (°C)</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px'
            }}>
              Wind Speed
            </label>
            <select
              value={preferences.units.speed}
              onChange={(e) => updatePreferences({
                units: { ...preferences.units, speed: e.target.value }
              })}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '16px',
                backgroundColor: 'white',
                minWidth: '150px'
              }}
            >
              <option value="mph">Miles per hour (mph)</option>
              <option value="knots">Knots</option>
              <option value="kph">Kilometers per hour (km/h)</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Summary */}
      <Card title="Your Settings Summary">
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <p><strong>Target Species:</strong> {targetSpecies.length > 0 ? targetSpecies.length + ' selected' : 'None (using general scoring)'}</p>
          <p><strong>Notifications:</strong> {notificationSettings.enabled ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Chat Assistant:</strong> {hasApiKey ? 'Configured ✓' : 'Not configured'}</p>
          <p><strong>Units:</strong> {preferences.units.temperature === 'fahrenheit' ? 'Fahrenheit' : 'Celsius'}, {preferences.units.speed}</p>
        </div>
      </Card>
    </div>
  );
};

export default Preferences;


