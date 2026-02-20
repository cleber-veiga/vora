import api from './api';

export type KanbanStatus = 'active' | 'inactive' | 'archived';

export interface KanbanBoard {
  id: number;
  workspace_id: number;
  name: string;
  description?: string | null;
  status: KanbanStatus;
  columns_count: number;
  cards_count: number;
  created_at?: string;
  updated_at?: string;
  created_by_id?: number | null;
  updated_by_id?: number | null;
}

export interface KanbanBoardCreate {
  name: string;
  description?: string;
  status?: KanbanStatus;
  columns_count?: number;
  cards_count?: number;
  columns?: KanbanColumnCreate[];
}

export interface KanbanBoardUpdate {
  name?: string;
  description?: string;
  status?: KanbanStatus;
  columns_count?: number;
  cards_count?: number;
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  position: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KanbanColumnCreate {
  name: string;
  description?: string;
  color?: string;
  position: number;
  is_required?: boolean;
}

export interface KanbanColumnUpdate {
  name?: string;
  description?: string;
  color?: string;
  position?: number;
}

export const listKanbanBoards = async (workspaceId: number): Promise<KanbanBoard[]> => {
  const response = await api.get(`/workspace/${workspaceId}/kanban/`);
  return response.data;
};

export const getKanbanBoard = async (workspaceId: number, boardId: number): Promise<KanbanBoard> => {
  const response = await api.get(`/workspace/${workspaceId}/kanban/${boardId}`);
  return response.data;
};

export const createKanbanBoard = async (
  workspaceId: number,
  data: KanbanBoardCreate,
): Promise<KanbanBoard> => {
  const response = await api.post(`/workspace/${workspaceId}/kanban/`, data);
  return response.data;
};

export const updateKanbanBoard = async (
  workspaceId: number,
  boardId: number,
  data: KanbanBoardUpdate,
): Promise<KanbanBoard> => {
  const response = await api.put(`/workspace/${workspaceId}/kanban/${boardId}`, data);
  return response.data;
};

export const deleteKanbanBoard = async (workspaceId: number, boardId: number): Promise<void> => {
  await api.delete(`/workspace/${workspaceId}/kanban/${boardId}`);
};

export const listKanbanColumns = async (
  workspaceId: number,
  boardId: number,
): Promise<KanbanColumn[]> => {
  const response = await api.get(`/workspace/${workspaceId}/kanban/${boardId}/columns`);
  return response.data;
};

export const createKanbanColumn = async (
  workspaceId: number,
  boardId: number,
  data: KanbanColumnCreate,
): Promise<KanbanColumn> => {
  const response = await api.post(`/workspace/${workspaceId}/kanban/${boardId}/columns`, data);
  return response.data;
};

export const updateKanbanColumn = async (
  workspaceId: number,
  boardId: number,
  columnId: number,
  data: KanbanColumnUpdate,
): Promise<KanbanColumn> => {
  const response = await api.put(`/workspace/${workspaceId}/kanban/${boardId}/columns/${columnId}`, data);
  return response.data;
};

export const deleteKanbanColumn = async (
  workspaceId: number,
  boardId: number,
  columnId: number,
): Promise<void> => {
  await api.delete(`/workspace/${workspaceId}/kanban/${boardId}/columns/${columnId}`);
};
