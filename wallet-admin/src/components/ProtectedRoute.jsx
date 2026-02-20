import { Navigate, Outlet } from 'react-router-dom';
import {TokenManager} from "../pages/LoginPage.jsx";

const ProtectedRoute = () => {
  const isAuthenticated = TokenManager.isAuthenticated();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;