import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin, error }) => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (username === 'Ramazan' && password === 'Kanki_1866@') {
        console.log("Giriş başarılı");
        localStorage.setItem('isLoggedIn', 'true');
        onLogin(true);
        navigate('/');
    } else {
        localStorage.removeItem('isLoggedIn');
        onLogin(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input 
              type="text" 
              name="username" 
              placeholder="Kullanıcı Adı"
              className="form-input" 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Şifre"
              className="form-input" 
            />
          </div>
          <button type="submit" className="login-button">
            Giriş Yap
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 