import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const userRoles: string[] = payload.roles || [];

    // Nếu có yêu cầu role cụ thể
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => userRoles.includes(`ROLE_${role}`));
      if (!hasAccess) {
        // Nếu không có quyền, đá về dashboard hoặc trang chủ
        return <Navigate to="/dashboard" replace />;
      }
    }
  } catch (err) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
