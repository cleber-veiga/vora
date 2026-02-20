import React, { useState } from 'react';
import { Briefcase, Check, ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const WorkspaceSwitcher: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  const { currentWorkspace, workspaces, switchWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    if (collapsed) {
      return (
        <div className="flex justify-center p-2">
          <div className="p-1.5 bg-[#1a1d21] border border-[#222326] rounded animate-pulse">
            <Briefcase className="h-4 w-4 text-[#f7f8f8]" />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#222326] bg-[#121417]">
        <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
          <Briefcase className="h-4 w-4 text-[#f7f8f8]" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#8a8f98]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace && workspaces.length === 0) {
    if (collapsed) {
      return (
        <>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex justify-center w-full p-2 rounded-lg hover:bg-[#15181c] transition-colors"
            title="Criar novo Workspace"
          >
            <div className="p-1.5 bg-[#1a1d21] border border-[#222326] rounded">
              <Plus className="h-4 w-4 text-[#c084fc]" />
            </div>
          </button>
          <CreateWorkspaceModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={() => console.log('Workspace criado')}
          />
        </>
      );
    }
    return (
      <>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#222326] bg-[#121417] hover:bg-[#15181c] transition-colors w-full"
        >
          <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
            <Plus className="h-4 w-4 text-[#c084fc]" />
          </div>
          <span className="text-sm font-medium text-[#f7f8f8]">Criar novo Workspace...</span>
        </button>

        <CreateWorkspaceModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {
            console.log('Workspace criado com sucesso!');
          }}
        />
      </>
    );
  }

  const handleSelectWorkspace = (workspaceId: number) => {
    switchWorkspace(workspaceId);
    setIsOpen(false);
  };

  const getRoleLabel = (role?: string): string => {
    const roleMap: { [key: string]: string } = {
      'MANAGER': 'Gerente',
      'EDITOR': 'Editor',
      'VIEWER': 'Visualizador',
    };
    return roleMap[role || ''] || 'Membro';
  };

  return (
    <>
      <div className="relative z-30">
        {/* Botão do seletor */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-[#222326] bg-[#121417] hover:bg-[#15181c] transition-colors w-full ${
            collapsed ? 'justify-center px-2 border-0 bg-transparent hover:bg-transparent' : ''
          }`}
        >
          <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326] flex-shrink-0">
            <Briefcase className="h-4 w-4 text-[#f7f8f8]" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-[#f7f8f8] truncate">
                {currentWorkspace?.name}
              </p>
              <p className="text-xs text-[#8a8f98] truncate">
                {getRoleLabel(currentWorkspace?.user_role)}
              </p>
            </div>
          )}
          {!collapsed && (
            <ChevronDown className={`h-4 w-4 text-[#8a8f98] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu dropdown */}
            <div
              className={`absolute mt-2 bg-[#121417] rounded-lg shadow-lg border border-[#222326] z-40 max-h-[400px] overflow-y-auto ${
                collapsed ? 'left-full top-0 ml-2 w-80' : 'top-full left-0 w-full min-w-[280px]'
              }`}
            >

              {/* Lista de Workspaces */}
              {workspaces.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1.5 text-xs font-semibold text-[#8a8f98] uppercase">
                    Workspaces
                  </p>
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleSelectWorkspace(workspace.id)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#15181c] transition-colors"
                    >
                      <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
                        <Briefcase className="h-4 w-4 text-[#c084fc]" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-[#f7f8f8] truncate">
                          {workspace.name}
                        </p>
                        <p className="text-xs text-[#8a8f98]">
                          {getRoleLabel(workspace.user_role)}
                        </p>
                      </div>
                      {currentWorkspace?.id === workspace.id && (
                        <Check className="h-4 w-4 text-[#c084fc] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Botão Criar Novo Workspace */}
              <div className="p-2 border-t border-[#222326]">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#15181c] transition-colors text-[#c084fc]"
                >
                  <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
                    <Plus className="h-4 w-4 text-[#c084fc]" />
                  </div>
                  <span className="text-sm font-medium">
                    Criar novo workspace
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Criação */}
      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          console.log('Workspace criado com sucesso!');
        }}
      />
    </>
  );
};
