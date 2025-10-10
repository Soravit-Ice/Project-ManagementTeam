import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-10 text-center text-slate-100 space-y-5">
        <h1 className="text-4xl font-semibold text-glow">404</h1>
        <p className="text-slate-200/80">ไม่พบหน้าที่คุณร้องขอ</p>
        <Link to="/" className="text-sky-300 hover:underline">
          กลับหน้าหลัก
        </Link>
      </Card>
    </div>
  );
}
