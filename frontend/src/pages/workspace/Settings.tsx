import { useState } from 'react';
import { Settings as SettingsIcon, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

export default function Settings() {
  const { currentWorkspace } = useWorkspace();
  const [name, setName] = useState(currentWorkspace?.name || '');
  const [hasChanges, setHasChanges] = useState(false);
 

  const handleSave = () => {
    // Implementar salvamento
    console.log('Salvando configurações:', { name });
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este workspace? Esta ação não pode ser desfeita.')) {
      // Implementar exclusão
      console.log('Excluindo workspace');
    }
  };

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f7f8f8]">Configurações</h1>
        <p className="text-[#8a8f98] mt-1">
          Gerencie as configurações do workspace {currentWorkspace?.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Gerais */}
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1a1d21] rounded-lg border border-[#222326]">
              <SettingsIcon className="h-5 w-5 text-[#f7f8f8]" />
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8]">Informações Gerais</h2>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Nome do Workspace
              </label>
              <Input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Nome do workspace"
              />
            </div>

            {/* ID do Workspace */}
            <div>
              <label htmlFor="workspace-id" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                ID do Workspace
              </label>
              <Input
                id="workspace-id"
                type="text"
                value={currentWorkspace?.id || ''}
                disabled
                className="bg-[#1a1d21] border-[#222326]"
              />
              <p className="text-xs text-[#8a8f98] mt-1">
                Identificador único do workspace
              </p>
            </div>

            {/* Organização */}
            <div>
              <label htmlFor="workspace-org" className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Organização
              </label>
              <Input
                id="workspace-org"
                type="text"
                value={`ID: ${currentWorkspace?.organization_id || ''}`}
                disabled
                className="bg-[#1a1d21] border-[#222326]"
              />
              <p className="text-xs text-[#8a8f98] mt-1">
                Organização à qual este workspace pertence
              </p>
            </div>

            {/* Botão Salvar */}
            {hasChanges && (
              <div className="flex justify-end pt-4 border-t border-[#222326]">
                <Button onClick={handleSave} className="w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-6">
          <h2 className="text-xl font-semibold text-[#f7f8f8] mb-4">Permissões</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#222326]">
              <div>
                <p className="font-medium text-[#f7f8f8]">Permitir novos membros</p>
                <p className="text-sm text-[#8a8f98]">Membros podem convidar outros usuários</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[#222326] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5e6ad2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121417] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f7f8f8] after:border-[#222326] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5e6ad2]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#222326]">
              <div>
                <p className="font-medium text-[#f7f8f8]">Criar agentes</p>
                <p className="text-sm text-[#8a8f98]">Membros podem criar novos agentes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[#222326] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5e6ad2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121417] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f7f8f8] after:border-[#222326] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5e6ad2]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-[#f7f8f8]">Editar bases de conhecimento</p>
                <p className="text-sm text-[#8a8f98]">Membros podem editar bases de conhecimento</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-[#222326] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5e6ad2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121417] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f7f8f8] after:border-[#222326] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5e6ad2]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="bg-[#121417] rounded-xl border border-red-500/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-400">Zona de Perigo</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-red-500/40">
              <div>
                <p className="font-medium text-[#f7f8f8]">Excluir Workspace</p>
                <p className="text-sm text-[#8a8f98]">
                  Esta ação é permanente e não pode ser desfeita. Todos os agentes, bases de conhecimento e configurações serão perdidos.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-auto border-red-500/60 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
