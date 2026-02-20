import { useState } from 'react';
import { Building2, Save, Trash2, Loader2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';
import OrganizationMembers from './Members';

export default function OrganizationSettings() {
  const { currentOrganization, updateOrganization, deleteOrganization } = useOrganization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(currentOrganization?.name || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!currentOrganization) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f7f8f8]">Configurações da Organização</h1>
        <p className="text-[#8a8f98] mt-1">
          Selecione uma organização para acessar as configurações.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      await updateOrganization(currentOrganization.id, { name });
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar organização');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrganization) return;
    if (confirm('Tem certeza que deseja excluir esta organização? Esta ação não pode ser desfeita.')) {
      try {
        setLoading(true);
        await deleteOrganization(currentOrganization.id);
        navigate('/select-organization');
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir organização');
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f7f8f8]">Configurações da Organização</h1>
        <p className="text-[#8a8f98] mt-1">
          Gerencie as configurações da organização {currentOrganization?.name}
        </p>
      </div>

      <div className="flex border-b border-[#222326] mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-[#5e6ad2] text-[#f7f8f8]'
              : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8]'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Geral
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'members'
              ? 'border-[#5e6ad2] text-[#f7f8f8]'
              : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8]'
          }`}
        >
          <Users className="h-4 w-4" />
          Membros
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="bg-[#121417] rounded-xl border border-[#222326] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1a1d21] rounded-lg border border-[#222326]">
              <Building2 className="h-5 w-5 text-[#f7f8f8]" />
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8]">Informações Gerais</h2>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Nome da Organização
              </label>
              <Input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Nome da organização"
              />
            </div>

            {/* ID da Organização */}
            <div>
              <label htmlFor="org-id" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                ID da Organização
              </label>
              <Input
                id="org-id"
                type="text"
                value={currentOrganization?.id || ''}
                disabled
                className="bg-[#1a1d21] border-[#222326]"
              />
              <p className="text-xs text-[#8a8f98] mt-1">
                Identificador único da organização
              </p>
            </div>

            {/* Role do Usuário */}
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Sua Permissão
              </label>
              <Input
                id="user-role"
                type="text"
                value={currentOrganization?.user_role || ''}
                disabled
                className="bg-[#1a1d21] border-[#222326]"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-[#222326]">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Zona de Perigo */}
        {currentOrganization.user_role === 'OWNER' && (
          <div className="bg-[#121417] rounded-xl border border-red-500/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-red-400">Zona de Perigo</h2>
            </div>
            
            <p className="text-red-400 mb-6">
              A exclusão da organização é permanente e não pode ser desfeita. 
              Todos os workspaces, agentes e dados associados serão perdidos.
            </p>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Excluir Organização
            </Button>
          </div>
        )}
      </div>
      )}

      {activeTab === 'members' && (
        <OrganizationMembers />
      )}
    </div>
  );
}
