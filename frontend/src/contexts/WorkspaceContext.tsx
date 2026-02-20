import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { useOrganization } from './OrganizationContext';

// Definição de tipos baseada no backend
export interface Workspace {
  id: number;
  name: string;
  organization_id: number;
  credits: number;
  created_at?: string;
  created_by_id?: number;
}

// Tipo estendido com informações de membro (se disponível)
export interface WorkspaceWithRole extends Workspace {
  user_role?: string;
  is_owner?: boolean;
  is_admin?: boolean;
}

interface WorkspaceContextType {
  currentWorkspace: WorkspaceWithRole | null;
  workspaces: WorkspaceWithRole[];
  loading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: WorkspaceWithRole) => void;
  switchWorkspace: (workspaceId: number) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, organization_id: number) => Promise<Workspace>;
}

// Criação do contexto
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Provider do contexto
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentOrganization } = useOrganization();
  const [currentWorkspace, setCurrentWorkspaceState] = useState<WorkspaceWithRole | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar workspaces da organização atual
  const fetchWorkspaces = async () => {
    if (!currentOrganization) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar workspaces já filtrados pela organização atual
      const response = await api.get('/workspace', {
        params: { organization_id: currentOrganization.id },
      });
      const orgWorkspaces: Workspace[] = response.data;
      
      // Adicionar informações de role (por enquanto, assumir que o criador é MANAGER)
      // TODO: Implementar rota no backend para obter role do usuário em cada workspace
      const workspacesWithRole: WorkspaceWithRole[] = orgWorkspaces.map(w => ({
        ...w,
        user_role: 'MANAGER', // Placeholder - deve vir do backend
        is_owner: true, // Placeholder
        is_admin: true, // Placeholder
      }));
      
      setWorkspaces(workspacesWithRole);

      // Se não há workspaces, limpa seleção e storage
      if (workspacesWithRole.length === 0) {
        setCurrentWorkspaceState(null);
        localStorage.removeItem(`selected_workspace_id_org_${currentOrganization.id}`);
        return;
      }

      // Tentar restaurar workspace selecionado do localStorage
      const savedWorkspaceId = localStorage.getItem(`selected_workspace_id_org_${currentOrganization.id}`);
      let workspaceToSelect: WorkspaceWithRole | undefined;

      if (savedWorkspaceId) {
        workspaceToSelect = workspacesWithRole.find(w => w.id === parseInt(savedWorkspaceId));
      }

      // Se não encontrou o salvo ou não tinha salvo, pega o primeiro disponível
      if (!workspaceToSelect && workspacesWithRole.length > 0) {
        workspaceToSelect = workspacesWithRole[0];
      }

      if (workspaceToSelect) {
        setCurrentWorkspaceState(workspaceToSelect);
        localStorage.setItem(`selected_workspace_id_org_${currentOrganization.id}`, workspaceToSelect.id.toString());
      } else {
        setCurrentWorkspaceState(null);
        localStorage.removeItem(`selected_workspace_id_org_${currentOrganization.id}`);
      }
    } catch (err: any) {
      console.error('Erro ao buscar workspaces:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Erro ao carregar workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar workspaces quando a organização mudar
  useEffect(() => {
    // Limpar estado atual imediatamente para evitar mostrar dados da organização anterior
    setCurrentWorkspaceState(null);
    setWorkspaces([]);
    
    if (currentOrganization) {
      fetchWorkspaces();
    } else {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  // Função para definir o workspace atual
  const setCurrentWorkspace = (workspace: WorkspaceWithRole) => {
    setCurrentWorkspaceState(workspace);
    if (currentOrganization) {
      localStorage.setItem(`selected_workspace_id_org_${currentOrganization.id}`, workspace.id.toString());
    }
  };

  // Função para alternar entre workspaces
  const switchWorkspace = (workspaceId: number) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  // Função para atualizar lista de workspaces
  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  // Função para criar novo workspace
  const createWorkspace = async (name: string, organization_id: number): Promise<Workspace> => {
    if (!currentOrganization) {
      throw new Error('Nenhuma organização selecionada');
    }

    try {
      // Criar workspace usando a rota correta do backend
      const response = await api.post('/workspace', {
        name,
        organization_id,
      });
      const newWorkspace: Workspace = response.data;
      
      // Atualizar lista de workspaces
      await refreshWorkspaces();
      
      // Selecionar o novo workspace automaticamente
      const workspaceWithRole: WorkspaceWithRole = {
        ...newWorkspace,
        user_role: 'MANAGER',
        is_owner: true,
        is_admin: true,
      };
      setCurrentWorkspace(workspaceWithRole);
      
      return newWorkspace;
    } catch (err: any) {
      console.error('Erro ao criar workspace:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Erro ao criar workspace';
      throw new Error(errorMessage);
    }
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    loading,
    error,
    setCurrentWorkspace,
    switchWorkspace,
    refreshWorkspaces,
    createWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace deve ser usado dentro de um WorkspaceProvider');
  }
  return context;
};
