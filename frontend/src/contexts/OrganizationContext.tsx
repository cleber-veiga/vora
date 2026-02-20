import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import api from '../services/api';

// Definição de tipos
export interface Organization {
  id: number;
  name: string;
  slug: string;
  user_role: string;
  is_owner: boolean;
  is_admin: boolean;
}

export interface OrganizationMember {
  user_id: number;
  organization_id: number;
  role: string;
  user: {
    id: number;
    email: string;
    full_name?: string;
  };
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  setCurrentOrganization: (org: Organization) => void;
  switchOrganization: (orgId: number) => void;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (name: string, slug: string) => Promise<Organization>;
  updateOrganization: (id: number, data: { name?: string; slug?: string }) => Promise<Organization>;
  deleteOrganization: (id: number) => Promise<void>;
  getOrganizationMembers: (orgId: number) => Promise<OrganizationMember[]>;
  inviteMember: (orgId: number, email: string, role: string) => Promise<void>;
  updateMemberRole: (orgId: number, userId: number, role: string) => Promise<void>;
  removeMember: (orgId: number, userId: number) => Promise<void>;
}

// Criação do contexto
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Provider do contexto
export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar organizações do usuário
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/organization/me/detailed');
      const orgs: Organization[] = response.data;
      setOrganizations(orgs);

      // Tentar restaurar organização selecionada do localStorage
      const savedOrgId = localStorage.getItem('selected_organization_id');
      if (savedOrgId) {
        const savedOrg = orgs.find(org => org.id === parseInt(savedOrgId));
        if (savedOrg) {
          setCurrentOrganizationState(savedOrg);
        } else if (orgs.length > 0) {
          // Se não encontrar a organização salva, seleciona a primeira
          setCurrentOrganizationState(orgs[0]);
          localStorage.setItem('selected_organization_id', orgs[0].id.toString());
          localStorage.setItem('selected_organization_slug', orgs[0].slug);
        }
      } else if (orgs.length > 0) {
        // Se não há organização salva, seleciona a primeira
        setCurrentOrganizationState(orgs[0]);
        localStorage.setItem('selected_organization_id', orgs[0].id.toString());
        localStorage.setItem('selected_organization_slug', orgs[0].slug);
      }
    } catch (err: any) {
      console.error('Erro ao buscar organizações:', err);
      setError(err.response?.data?.message || 'Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar organizações ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchOrganizations();
    } else {
      setLoading(false);
    }
  }, []);

  // Função para definir a organização atual
  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    localStorage.setItem('selected_organization_id', org.id.toString());
    localStorage.setItem('selected_organization_slug', org.slug);
  };

  // Função para alternar entre organizações
  const switchOrganization = (orgId: number) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  // Função para atualizar lista de organizações
  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  // Função para criar nova organização
  const createOrganization = async (name: string, slug: string): Promise<Organization> => {
    try {
      const response = await api.post('/organization', { name, slug });
      const newOrg: Organization = response.data;
      
      // Atualizar lista de organizações
      await refreshOrganizations();
      
      // Selecionar a nova organização automaticamente
      setCurrentOrganization(newOrg);
      
      return newOrg;
    } catch (err: any) {
      console.error('Erro ao criar organização:', err);
      throw new Error(err.response?.data?.message || 'Erro ao criar organização');
    }
  };

  const updateOrganization = async (id: number, data: { name?: string; slug?: string }): Promise<Organization> => {
    try {
      const response = await api.put(`/organization/${id}`, data);
      const updatedOrg: Organization = response.data;
      await refreshOrganizations();
      
      if (currentOrganization?.id === id) {
        // Manter o user_role e outros campos calculados que podem não vir no update simples
        setCurrentOrganization({
          ...currentOrganization,
          ...updatedOrg
        });
      }
      
      return updatedOrg;
    } catch (err: any) {
      console.error('Erro ao atualizar organização:', err);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar organização');
    }
  };

  const deleteOrganization = async (id: number): Promise<void> => {
    try {
      await api.delete(`/organization/${id}`);
      await refreshOrganizations();
      
      if (currentOrganization?.id === id) {
        setCurrentOrganizationState(null);
        localStorage.removeItem('selected_organization_id');
        localStorage.removeItem('selected_organization_slug');
      }
    } catch (err: any) {
      console.error('Erro ao excluir organização:', err);
      throw new Error(err.response?.data?.message || 'Erro ao excluir organização');
    }
  };

  const getOrganizationMembers = async (orgId: number): Promise<OrganizationMember[]> => {
    try {
      const response = await api.get(`/organization/${orgId}/members`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar membros:', err);
      throw new Error(err.response?.data?.message || 'Erro ao buscar membros');
    }
  };

  const inviteMember = async (orgId: number, email: string, role: string): Promise<void> => {
    try {
      await api.post(`/organization/${orgId}/invite`, { email, role });
    } catch (err: any) {
      console.error('Erro ao convidar membro:', err);
      throw new Error(err.response?.data?.message || 'Erro ao convidar membro');
    }
  };

  const updateMemberRole = async (orgId: number, userId: number, role: string): Promise<void> => {
    try {
      await api.put(`/organization/${orgId}/members/${userId}`, { role });
    } catch (err: any) {
      console.error('Erro ao atualizar papel do membro:', err);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar papel do membro');
    }
  };

  const removeMember = async (orgId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/organization/${orgId}/members/${userId}`);
    } catch (err: any) {
      console.error('Erro ao remover membro:', err);
      throw new Error(err.response?.data?.message || 'Erro ao remover membro');
    }
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    loading,
    error,
    setCurrentOrganization,
    switchOrganization,
    refreshOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization deve ser usado dentro de um OrganizationProvider');
  }
  return context;
};
