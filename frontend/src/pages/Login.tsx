import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useOrganization } from '../contexts/OrganizationContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshOrganizations } = useOrganization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clean state to avoid showing message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData);
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);
      await refreshOrganizations();
      
      navigate('/select-organization');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Falha no login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  // const googleLogin = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     // Implementation moved to GoogleLoginButton component
  //   },
  //   onError: () => {
  //     // Implementation moved to GoogleLoginButton component
  //   }
  // });

  // Since useGoogleLogin returns access_token by default, and we need id_token for the current backend implementation:
  // We will change the strategy to use the <GoogleLogin /> component or accept that we need to change backend to accept access_token?
  // No, let's keep backend as is (secure with id_token).
  // I will use the <GoogleLogin /> component rendered invisible or styled, OR I will simply use the hook 
  // but I need to make sure I get the id_token.
  // Actually, the `useGoogleLogin` hook DOES NOT return the id_token in the success callback response by default (it returns access_token).
  // Unless we use `flow: 'idToken'`? No, that's not an option.
  
  // So I will use the GoogleLogin component from the library which returns the credential (id_token).
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a] px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-6 bg-[#121417] border border-[#222326] rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#f7f8f8] mb-2">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-[#8a8f98]">
            Insira seu e-mail e senha para fazer login.
          </p>
        </div>
        
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Login"
                  className="pl-4 h-12 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Senha"
                  className="pl-4 h-12 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/40 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-500/10 border border-green-500/40 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-200">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg font-semibold"
            >
              {loading ? 'Entrando...' : 'Acessar'}
            </Button>
          </div>
          
          <div className="text-center">
             <Link to="/forgot-password" className="text-sm text-[#8a8f98] hover:text-[#f7f8f8]">
                Esqueci minha senha
              </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222326]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121417] text-[#8a8f98]">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div className="flex justify-center">
                <GoogleLoginButton 
                  onSuccess={async (credential) => {
                    setLoading(true);
                    try {
                      const response = await api.post('/auth/google', { token: credential });
                      const { access_token } = response.data;
                      localStorage.setItem('token', access_token);
                      await refreshOrganizations();
                      navigate('/select-organization');
                    } catch (err) {
                      console.error(err);
                      setError('Falha no login com Google.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    setError('Falha no login com Google.');
                  }}
                />
            </div>
          </div>
          
           <div className="mt-4 text-center">
              <p className="text-sm text-[#8a8f98]">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-[#5e6ad2] hover:text-[#6e7be2]">
                  Cadastre-se
                </Link>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function GoogleLoginButton({ onSuccess, onError }: { onSuccess: (credential: string) => void, onError: () => void }) {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        if (credentialResponse.credential) {
          onSuccess(credentialResponse.credential);
        } else {
          onError();
        }
      }}
      onError={() => {
        onError();
      }}
      useOneTap
      width="300"
    />
  );
}
