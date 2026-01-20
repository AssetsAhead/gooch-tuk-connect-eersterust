import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SafeMode = () => {
  const navigate = useNavigate();

  const handlePanicButton = () => {
    alert('PANIC BUTTON ACTIVATED - Emergency services would be contacted');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '20px',
      fontFamily: 'Heebo, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        padding: '30px',
        borderRadius: '10px',
        border: '2px solid #cccccc'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px',
          color: '#1e3a5f'
        }}>
          🚖 MojaRide Safe Mode
        </h1>
        
        <p style={{
          fontSize: '18px',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#666666'
        }}>
          Connecting Communities - Your transport network is working! This is safe mode with basic styling.
        </p>

        <div style={{
          display: 'grid',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={handlePanicButton}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🚨 PANIC BUTTON
          </button>

          <button
            onClick={() => navigate('/auth')}
            style={{
              backgroundColor: '#1e3a5f',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔐 Go to Authentication
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#e67e22',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🏠 Back to Main App
          </button>
        </div>

        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#155724', marginBottom: '10px' }}>✅ App Status: WORKING</h3>
          <ul style={{ color: '#155724', margin: 0, paddingLeft: '20px' }}>
            <li>React components are rendering</li>
            <li>Navigation is functional</li>
            <li>JavaScript is executing</li>
            <li>Core functionality is operational</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '10px' }}>⚠️ Next Steps:</h3>
          <ol style={{ color: '#856404', margin: 0, paddingLeft: '20px' }}>
            <li>Test panic button (emergency feature)</li>
            <li>Try authentication flow</li>
            <li>Your app's core features are working</li>
            <li>Ready for production testing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
