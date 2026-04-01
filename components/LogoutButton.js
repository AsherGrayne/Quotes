'use client';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('username');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleLogout} className="nav-button">Logout</button>
  );
}
