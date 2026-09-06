import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
        <FileQuestion size={40} className="text-orange-500" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900">404</h1>
      <h2 className="mb-6 text-xl font-medium text-zinc-600">Page Not Found</h2>
      <p className="mb-8 max-w-md text-zinc-500">
        The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
      </p>
      <Button onClick={() => navigate('/dashboard')} size="lg">
        Return to Dashboard
      </Button>
    </div>
  );
}
