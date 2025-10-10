import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from 'react-router-dom';

import RegisterPage from './pages/Register.jsx';
import VerifyEmailPage from './pages/VerifyEmail.jsx';
import LoginPage from './pages/Login.jsx';
import NotFoundPage from './pages/NotFound.jsx';
import OverviewPage from './pages/dashboard/Overview.jsx';
import SettingsPage from './pages/dashboard/Settings.jsx';
import SecurityPage from './pages/dashboard/Security.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { GuestRoute, ProtectedRoute } from './components/layout/ProtectedRoute.jsx';

// Nice error fallback for route errors
function RouteError() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : err instanceof Error
    ? err.message
    : 'Unknown error';
  return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div className="max-w-md rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="mb-4">{message}</p>
        <button onClick={() => location.reload()} className="px-4 py-2 rounded-xl shadow">
          Reload
        </button>
        <div className="mt-4">
          <Link to="/" className="underline">Go Home</Link>
        </div>
      </div>
    </div>
  );
}

function RootShell() {
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootShell />,
    errorElement: <RouteError />, // 👈 graceful error UI
    children: [
      // Public routes (only for guests)
      {
        element: <GuestRoute />,
        children: [
          { index: true, element: <Navigate to="login" replace /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'verify-email', element: <VerifyEmailPage /> },
          { path: 'login', element: <LoginPage /> },
        ],
      },
      // Private routes (only for authenticated users)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <OverviewPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'security', element: <SecurityPage /> },
            ],
          },
        ],
      },
      // Catch-all
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
