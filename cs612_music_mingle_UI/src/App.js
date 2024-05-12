import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Home } from "./pages/home";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token !== null;
};

const PrivateRoute = ({ children }) => {
  const authed = isAuthenticated();
  return authed ? children : <Navigate to="/login" />;
}

const AuthRoute = ({ children }) => {
  const authed = isAuthenticated();
  return authed ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <div className="App" style={{
      height: '100vh'
    }}>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/favorite" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/playlist" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      </Routes>
    </div>

  );
}

export default App;
