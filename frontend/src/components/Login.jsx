import React, { useState } from 'react';
import usePayrollStore from '../store/payrollStore';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = usePayrollStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success && error) {
      alert('Login failed: ' + error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <form className="card" onSubmit={handleLogin} style={{ width: '300px' }}>
        <h2>ดาวรุ่ง ทราเวล Login</h2>
        <div style={{ marginTop: '15px' }}>
          <input style={{ width: '100%', marginBottom: '10px' }} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input style={{ width: '100%', marginBottom: '15px' }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="primary" style={{ width: '100%' }} type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
