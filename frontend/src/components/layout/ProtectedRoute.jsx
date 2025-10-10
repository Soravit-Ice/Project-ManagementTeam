import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.js';
import Spinner from '../ui/Spinner.jsx';

// If you prefer one call, you can import shallow and use it:
// import { shallow } from 'zustand/shallow';

export function ProtectedRoute() {
  const location = useLocation();

  // ❌ Don't do: (s) => ({ user: s.user, isHydrated: s.isHydrated })
  // ✅ Select separately to avoid new-object identity every render
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Or single call with shallow:
  // const { user, isHydrated } = useAuthStore(
  //   (s) => ({ user: s.user, isHydrated: s.isHydrated }),
  //   shallow
  // );

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  // Same fix here
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Or:
  // const { user, isHydrated } = useAuthStore(
  //   (s) => ({ user: s.user, isHydrated: s.isHydrated }),
  //   shallow
  // );

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}