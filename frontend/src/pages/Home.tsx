import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { OrganizationSwitcher } from '../components/OrganizationSwitcher';
import { useOrganization } from '../contexts/OrganizationContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { currentOrganization, loading } = useOrganization();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selected_organization_id');
    localStorage.removeItem('selected_organization_slug');
    navigate('/login');
  };

  // Se não há organização selecionada e não está carregando, redireciona
  if (!loading && !currentOrganization) {
    navigate('/select-organization');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]">
      {/* Navbar */}
      <nav className="bg-[#121417] border-b border-[#222326] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-[#f7f8f8]">Vora</h1>
            <OrganizationSwitcher />
          </div>
          <Button onClick={handleLogout} className="w-auto px-6" variant="outline">
            Sair
          </Button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#121417] rounded-xl shadow-sm border border-[#222326] p-8">
          <h2 className="text-2xl font-bold text-[#f7f8f8] mb-4">
            Bem-vindo ao {currentOrganization?.name}!
          </h2>
          <p className="text-[#8a8f98]">
            Você está visualizando o painel da organização <strong>{currentOrganization?.name}</strong> 
            {' '}(slug: <code className="bg-[#1a1d21] border border-[#222326] px-2 py-0.5 rounded text-sm">{currentOrganization?.slug}</code>).
          </p>
          <p className="text-[#8a8f98] mt-2">
            Seu papel: <span className="font-semibold">{currentOrganization?.user_role}</span>
          </p>
          
          <div className="mt-6 p-4 bg-[#121417] border border-[#222326] rounded-lg">
            <p className="text-sm text-[#8a8f98]">
              💡 Use o seletor de organizações no canto superior esquerdo para alternar entre suas organizações 
              ou criar uma nova.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
