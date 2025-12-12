import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '40px', textAlign: 'center' }}>
      <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '72px', margin: '20px 0' }}>🎣</div>
        <h1 style={{ fontSize: '32px', margin: '0 0 12px 0' }}>Page Not Found</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Looks like this fishing spot doesn't exist!
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate('/locations')}>
            Browse Locations
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;







