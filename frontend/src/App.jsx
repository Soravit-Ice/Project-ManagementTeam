import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import http from './api/http.js';
import useAuthStore from './store/auth.js';
import Spinner from './components/ui/Spinner.jsx';

function App() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    const { setSession, clearSession, markHydrated } = useAuthStore.getState();
    const bootstrap = async () => {
      try {
        const { data } = await http.post('/auth/refresh');
        const payload = data?.data;
        if (payload?.user && payload?.accessToken) {
          setSession({ user: payload.user, accessToken: payload.accessToken });
        }
      } catch (error) {
        clearSession();
      } finally {
        markHydrated();
      }
    };
    bootstrap();
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
