import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mockToken, setMockToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setMockToken('');

    try {
      const response = await api.post('/auth/password-recovery', { email });
      setStatus('success');
      setMessage(response.data.msg);
      // For demo purposes only, displaying the mock token
      if (response.data.mock_token) {
        setMockToken(response.data.mock_token);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      if (err.response && err.response.data && err.response.data.detail) {
        setMessage(err.response.data.detail);
      } else {
        setMessage('Ocorreu um erro. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a] px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-6 bg-[#121417] border border-[#222326] rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#f7f8f8] mb-2">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-sm text-[#8a8f98]">
            Informe seu email para receber o link de recuperação.
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="rounded-xl bg-green-500/10 border border-green-500/40 p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-200">Email enviado!</h3>
                <p className="mt-2 text-sm text-green-100">{message}</p>
                {mockToken && (
                  <div className="mt-4 p-2 bg-[#121417] border border-[#222326] rounded text-xs break-all text-[#f7f8f8]">
                    <strong>Link de teste (Simulação):</strong><br/>
                    <Link to={`/reset-password?token=${mockToken}`} className="text-[#5e6ad2] underline">
                      Clique aqui para redefinir a senha
                    </Link>
                  </div>
                )}
              </div>
            </div>
             <div className="mt-6">
                <Link to="/login" className="text-sm font-medium text-[#5e6ad2] hover:text-[#6e7be2] flex items-center justify-center transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para o Login
                </Link>
             </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#8a8f98]" />
                </div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email"
                  className="pl-10 h-12 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                {status === 'loading' ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-[#5e6ad2] hover:text-[#6e7be2] transition-colors">
                Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
