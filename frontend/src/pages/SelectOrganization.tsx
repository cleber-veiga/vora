import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useOrganization } from '../contexts/OrganizationContext';
import { CreateOrganizationModal } from '../components/CreateOrganizationModal';

export default function SelectOrganization() {
  const navigate = useNavigate();
  const { organizations, loading, error, setCurrentOrganization } = useOrganization();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Separar organizações por tipo
  const ownedOrganizations = organizations.filter(org => org.user_role === 'OWNER');
  const participatedOrganizations = organizations.filter(org => org.user_role !== 'OWNER');

  const handleSelectOrganization = (orgId: number) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      navigate('/workspace/agents');
    }
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'OWNER': 'Dono',
      'ADMIN': 'Admin',
      'MEMBER': 'Membro',
    };
    return roleMap[role] || role;
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#5e6ad2] mx-auto mb-4" />
          <p className="text-[#8a8f98]">Carregando organizações...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121417] rounded-xl shadow-sm border border-[#222326] p-6 text-center">
          <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto mb-4">
            <Building2 className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#f7f8f8] mb-2">Erro ao carregar</h2>
          <p className="text-[#8a8f98] mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#08090a] p-6 text-[#f7f8f8]">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Cabeçalho */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-[#f7f8f8]">Bem-vindo de volta!</h1>
            <p className="mt-2 text-[#8a8f98]">Selecione uma organização para acessar o painel.</p>
          </div>

          {/* Bloco 1: Organizações que sou Dono */}
          {ownedOrganizations.length > 0 && (
            <div className="bg-[#121417] rounded-xl shadow-sm border border-[#222326] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#1a1d21] rounded-lg border border-[#222326]">
                    <Building2 className="h-6 w-6 text-[#f7f8f8]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#f7f8f8]">Minhas Organizações</h2>
                </div>
                <Button 
                  className="w-auto" 
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownedOrganizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="group relative border border-[#222326] rounded-lg p-5 hover:border-[#5e6ad2] hover:bg-[#15181c] transition-all cursor-pointer bg-[#121417]"
                    onClick={() => handleSelectOrganization(org.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#f7f8f8]">{org.name}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1a1d21] text-[#f7f8f8] border border-[#222326]">
                          {getRoleLabel(org.user_role)}
                        </span>
                      </div>
                      <div className="p-2 bg-[#1a1d21] rounded-full group-hover:bg-[#15181c] border border-transparent group-hover:border-[#2e3035] transition-colors">
                        <ArrowRight className="h-5 w-5 text-[#8a8f98] group-hover:text-[#f7f8f8]" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-[#8a8f98]">
                      <span className="text-xs bg-[#1a1d21] border border-[#222326] px-2 py-1 rounded">
                        {org.slug}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bloco 2: Organizações que Participo */}
          {participatedOrganizations.length > 0 && (
            <div className="bg-[#121417] rounded-xl shadow-sm border border-[#222326] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-[#1a1d21] rounded-lg border border-[#222326]">
                  <Users className="h-6 w-6 text-[#f7f8f8]" />
                </div>
                <h2 className="text-xl font-semibold text-[#f7f8f8]">Organizações que Participo</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participatedOrganizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="group relative border border-[#222326] rounded-lg p-5 hover:border-[#5e6ad2] hover:bg-[#15181c] transition-all cursor-pointer bg-[#121417]"
                    onClick={() => handleSelectOrganization(org.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#f7f8f8]">{org.name}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1a1d21] text-[#f7f8f8] border border-[#222326]">
                          {getRoleLabel(org.user_role)}
                        </span>
                      </div>
                      <div className="p-2 bg-[#1a1d21] rounded-full group-hover:bg-[#15181c] border border-transparent group-hover:border-[#2e3035] transition-colors">
                        <ArrowRight className="h-5 w-5 text-[#8a8f98] group-hover:text-[#f7f8f8]" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-[#8a8f98]">
                      <span className="text-xs bg-[#1a1d21] border border-[#222326] px-2 py-1 rounded">
                        {org.slug}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando não há organizações */}
          {ownedOrganizations.length === 0 && participatedOrganizations.length === 0 && (
            <div className="bg-[#121417] rounded-xl shadow-sm border border-[#222326] p-12 text-center">
              <div className="p-4 bg-[#1a1d21] rounded-full w-fit mx-auto mb-4 border border-[#222326]">
                <Building2 className="h-12 w-12 text-[#8a8f98]" />
              </div>
              <h2 className="text-xl font-semibold text-[#f7f8f8] mb-2">Nenhuma organização encontrada</h2>
              <p className="text-[#8a8f98] mb-6">Você ainda não faz parte de nenhuma organização.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar minha primeira organização
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Criação */}
      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          navigate('/workspace/agents');
        }}
      />
    </>
  );
}
