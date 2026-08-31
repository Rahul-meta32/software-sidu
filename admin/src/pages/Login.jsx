import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/demoSiteService';
import { Key, Mail, Loader2 } from 'lucide-react';
import logoImg from '../assets/smartsoft.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(email.trim(), password);
      if (data.success) {
        // Save email to localStorage for display on Sidebar Layout
        localStorage.setItem('adminEmail', email.trim());
        navigate('/', { replace: true });
      } else {
        setErrorMsg(data.message || 'Access denied. Verify credentials.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || 
        'Unable to connect to MERN backend server. Ensure it is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Visual Accent Top Bar mimicking the SmartSoft site header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'var(--primary)'
      }} />

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="brand-glow-circle" />
          
          {/* Custom SmartSoft Logo Image */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img 
              src={logoImg} 
              alt="SmartSoft Technologies" 
              style={{ height: '56px', width: 'auto', maxWidth: '240px', objectFit: 'contain', display: 'block' }} 
            />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Admin Console — Manage portfolio demo websites
          </p>
        </div>

        {errorMsg && <div className="login-error-toast">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Username or Email</label>
            <div className="input-with-icon">
              <Mail className="input-field-icon" size={18} />
              <input
                type="text"
                id="email"
                placeholder="superadmin or admin@smartsoft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Key className="input-field-icon" size={18} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Accessing Portal...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>SmartSoft Technology Development Portal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
