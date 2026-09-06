import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { loginSchema, type LoginFormData } from '../../types/auth.schema';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // TODO: Implement actual axios login call
    console.log('Logging in:', data);
    
    // Fake API call
    setTimeout(() => {
      // Fake setting auth
      setAuth(
        { id: '1', email: data.email, role: 'owner' }, // mock user
        'fake-jwt-token'
      );
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
            <Building2 size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">WorkFlow</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to manage your company and team.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
            
            <p className="mt-6 text-center text-sm text-zinc-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-500">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
