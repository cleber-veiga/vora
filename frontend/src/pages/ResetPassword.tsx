import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirm_password: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de recuperação inválido ou ausente.');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirm_password) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: formData.password
      });
      setStatus('success');
      setMessage('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Sua senha foi redefinida. Faça login com a nova senha.' } });
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      if (err.response && err.response.data && err.response.data.detail) {
        setMessage(err.response.data.detail);
      } else {
        setMessage('Falha ao redefinir a senha. O token pode ter expirado.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a] px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full bg-[#121417] border border-[#222326] p-6 rounded-xl shadow-sm text-center">
          <div className="mx-auto h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#f7f8f8] mb-2">Sucesso!</h2>
          <p className="text-[#f7f8f8] mb-6">{message}</p>
          <p className="text-sm text-[#8a8f98]">Você será redirecionado para o login em instantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a] px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-6 bg-[#121417] border border-[#222326] rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-lg font-medium text-[#f7f8f8] mb-2">
            Redefinir Senha
          </h2>
        </div>
        
        {status === 'error' && !formData.password && !token ? (
           <div className="rounded-md bg-red-500/10 border border-red-500/40 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">{message}</h3>
                <div className="mt-4">
                  <Link to="/forgot-password" className="text-sm font-medium text-[#5e6ad2] hover:text-[#6e7be2]">
                    Solicitar novo link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#8a8f98]" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Nova Senha"
                    className="pl-10 h-12 rounded-lg"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirm_password" className="sr-only">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#8a8f98]" />
                  </div>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Confirmar Nova Senha"
                    className="pl-10 h-12 rounded-lg"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {status === 'error' && (
              <div className="rounded-md bg-red-500/10 border border-red-500/40 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-200">{message}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 rounded-lg font-semibold"
              >
                {status === 'loading' ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
