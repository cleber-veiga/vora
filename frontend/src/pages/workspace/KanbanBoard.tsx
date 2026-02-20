import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Kanban, Save, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';
import {
  getKanbanBoard,
  updateKanbanBoard,
  listKanbanColumns,
  createKanbanColumn,
  updateKanbanColumn,
  deleteKanbanColumn,
} from '../../services/kanbanService';
import type { KanbanBoard as KanbanBoardType, KanbanColumn } from '../../services/kanbanService';

const normalizeColumnName = (name: string) => name.trim().toLowerCase();
const isNovoColumn = (column: KanbanColumn) => normalizeColumnName(column.name) === 'novo';
const isConcluidoColumn = (column: KanbanColumn) => normalizeColumnName(column.name) === 'concluido';
const isCanceladoColumn = (column: KanbanColumn) => normalizeColumnName(column.name) === 'cancelado';
const isProcessColumn = (column: KanbanColumn) => !column.is_required;
const isTailRequiredColumn = (column: KanbanColumn) =>
  column.is_required && !isNovoColumn(column);
const getOrderedColumns = (list: KanbanColumn[]) => {
  const novo = list.find(isNovoColumn);
  const process = list.filter(isProcessColumn);
  const tail = list
    .filter(isTailRequiredColumn)
    .sort((a, b) => {
      if (isConcluidoColumn(a) && isCanceladoColumn(b)) return -1;
      if (isCanceladoColumn(a) && isConcluidoColumn(b)) return 1;
      return a.position - b.position;
    });

  return [
    ...(novo ? [novo] : []),
    ...process.sort((a, b) => a.position - b.position),
    ...tail,
  ];
};

export default function KanbanBoard() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { kanbanId } = useParams();
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<KanbanBoardType['status']>('active');
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#f59e0b');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#f59e0b');
  const [editingDescription, setEditingDescription] = useState('');

  const boardId = Number(kanbanId);

  useEffect(() => {
    if (!currentWorkspace || Number.isNaN(boardId)) {
      setLoading(false);
      setError('Quadro inválido');
      return;
    }

    const fetchBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getKanbanBoard(currentWorkspace.id, boardId);
        setBoard(response);
        setName(response.name);
        setDescription(response.description || '');
        setStatus(response.status);
      } catch (err: any) {
        console.error('Erro ao carregar quadro:', err);
        setError(err.response?.data?.detail || 'Erro ao carregar quadro');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [currentWorkspace?.id, boardId]);

  useEffect(() => {
    if (!currentWorkspace || Number.isNaN(boardId)) {
      setColumns([]);
      setColumnsLoading(false);
      return;
    }

    const fetchColumns = async () => {
      try {
        setColumnsLoading(true);
        const response = await listKanbanColumns(currentWorkspace.id, boardId);
        setColumns(response);
      } catch (err: any) {
        console.error('Erro ao carregar colunas:', err);
      } finally {
        setColumnsLoading(false);
      }
    };

    fetchColumns();
  }, [currentWorkspace?.id, boardId]);

  const hasChanges = useMemo(() => {
    if (!board) return false;
    return (
      board.name !== name.trim() ||
      (board.description || '') !== description.trim() ||
      board.status !== status
    );
  }, [board, name, description, status]);

  const handleAddColumn = async () => {
    if (!currentWorkspace || Number.isNaN(boardId)) return;
    if (!newName.trim()) return;

    try {
      const ordered = getOrderedColumns(columns);
      const novoIndex = ordered.findIndex(isNovoColumn);
      const processCount = ordered.filter(isProcessColumn).length;
      const insertPosition = (novoIndex >= 0 ? novoIndex + 1 : 0) + processCount;
      const created = await createKanbanColumn(currentWorkspace.id, boardId, {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        color: newColor,
        position: insertPosition,
        is_required: false,
      });
      let updatedColumns = [...columns, created];
      const tailRequired = ordered
        .filter(isTailRequiredColumn)
        .sort((a, b) => {
          if (isConcluidoColumn(a) && isCanceladoColumn(b)) return -1;
          if (isCanceladoColumn(a) && isConcluidoColumn(b)) return 1;
          return a.position - b.position;
        });

      let nextPos = insertPosition + 1;
      for (const col of tailRequired) {
        if (col.position <= insertPosition) {
          const updated = await updateKanbanColumn(currentWorkspace.id, boardId, col.id, {
            position: nextPos,
          });
          updatedColumns = updatedColumns.map((c) => (c.id === updated.id ? updated : c));
          nextPos += 1;
        }
      }

      setColumns(updatedColumns);
      setBoard((prev) => (prev ? { ...prev, columns_count: prev.columns_count + 1 } : prev));
      setNewName('');
      setNewDescription('');
      setNewColor('#f59e0b');
      setIsAdding(false);
    } catch (err: any) {
      console.error('Erro ao adicionar coluna:', err);
      setError(err.response?.data?.detail || 'Erro ao adicionar coluna');
    }
  };

  const startEditColumn = (column: KanbanColumn) => {
    setEditingId(column.id);
    setEditingName(column.name);
    setEditingColor(column.color || '#f59e0b');
    setEditingDescription(column.description || '');
  };

  const cancelEditColumn = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#f59e0b');
    setEditingDescription('');
  };

  const confirmEditColumn = async () => {
    if (!currentWorkspace || Number.isNaN(boardId) || editingId === null) return;
    if (!editingName.trim()) return;

    try {
      const updated = await updateKanbanColumn(currentWorkspace.id, boardId, editingId, {
        name: editingName.trim(),
        description: editingDescription.trim() || undefined,
        color: editingColor,
      });
      setColumns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      cancelEditColumn();
    } catch (err: any) {
      console.error('Erro ao editar coluna:', err);
      setError(err.response?.data?.detail || 'Erro ao editar coluna');
    }
  };

  const handleDeleteColumn = async (column: KanbanColumn) => {
    if (!currentWorkspace || Number.isNaN(boardId)) return;
    if (column.is_required) return;

    try {
      await deleteKanbanColumn(currentWorkspace.id, boardId, column.id);
      setColumns((prev) => prev.filter((c) => c.id !== column.id));
      setBoard((prev) => (prev ? { ...prev, columns_count: Math.max(prev.columns_count - 1, 0) } : prev));
    } catch (err: any) {
      console.error('Erro ao remover coluna:', err);
      setError(err.response?.data?.detail || 'Erro ao remover coluna');
    }
  };

  const orderedColumns = useMemo(() => getOrderedColumns(columns), [columns]);

  const handleSave = async () => {
    if (!currentWorkspace || !board || Number.isNaN(boardId)) return;
    if (!name.trim()) {
      setError('Informe o nome do quadro');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateKanbanBoard(currentWorkspace.id, boardId, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      });
      setBoard(updated);
    } catch (err: any) {
      console.error('Erro ao salvar quadro:', err);
      setError(err.response?.data?.detail || 'Erro ao salvar quadro');
    } finally {
      setSaving(false);
    }
  };

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  return (
    <div className="px-5 lg:px-8 py-4 max-w-[1400px] mx-auto text-[#f7f8f8]">
      <div className="mb-4">
        <Button variant="ghost" className="w-auto mb-4" onClick={() => navigate('/workspace/kanban')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-[#f7f8f8]">
          {loading ? 'Carregando...' : board ? `Quadro: ${board.name}` : 'Quadro'}
        </h1>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#3f1d1d] bg-[#1f0e0e] text-sm text-[#fca5a5] px-4 py-2">
          {error}
        </div>
      ) : loading ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-6 text-center text-sm text-[#8a8f98]">
          Carregando quadro...
        </div>
      ) : board ? (
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] items-end">
              <div>
                <label className="text-xs text-[#8a8f98]" htmlFor="kanban-edit-name">Nome do quadro</label>
                <Input
                  id="kanban-edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-[#8a8f98]" htmlFor="kanban-edit-description">Descricao</label>
                <Input
                  id="kanban-edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#f7f8f8]">Preview do quadro</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#2a2d33] bg-[#15181c] text-[#8a8f98]">
                  {name.trim() || 'Quadro'}
                </span>
              </div>

              <div className="rounded-xl border border-[#1e2126] bg-gradient-to-br from-[#0f1114] via-[#121417] to-[#0c0e11] p-4">
                {columnsLoading ? (
                  <div className="text-sm text-[#8a8f98]">Carregando colunas...</div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {(() => {
                      const novoColumn = orderedColumns.find(isNovoColumn);
                      const processColumns = orderedColumns.filter(isProcessColumn);
                      const tailColumns = orderedColumns.filter(isTailRequiredColumn);
                      const renderColumn = (column: KanbanColumn, index: number) => (
                      <div key={column.id} className="min-w-[210px] flex-shrink-0">
                        <div className="rounded-lg border border-[#1f2329] bg-[#14171b] p-3">
                          {editingId === column.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  placeholder="Nome da coluna"
                                />
                                <input
                                  aria-label="Cor da coluna"
                                  type="color"
                                  value={editingColor}
                                  onChange={(e) => setEditingColor(e.target.value)}
                                  className="h-8 w-10 rounded border border-[#2a2d33] bg-transparent"
                                />
                              </div>
                              <Input
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                placeholder="Descricao da coluna"
                              />
                              <div className="flex items-center gap-2">
                                <Button size="xs" className="w-auto h-8 px-2" onClick={confirmEditColumn}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="xs" className="w-auto h-8 px-2" onClick={cancelEditColumn}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color || '#9ca3af' }} />
                                  <span className="text-sm font-semibold text-[#f7f8f8]">
                                    {column.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="xs" className="w-auto h-7 px-2" onClick={() => startEditColumn(column)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    className="w-auto h-7 px-2"
                                    onClick={() => handleDeleteColumn(column)}
                                    disabled={column.is_required}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {column.description && (
                                <p className="text-xs text-[#8a8f98] mt-2 line-clamp-2">{column.description}</p>
                              )}
                          <div className="text-[10px] text-[#6b6f78] mt-2">
                            Posicao {index + 1}{column.is_required ? ' · Obrigatoria' : ''}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                      );

                      const renderAddCard = () => (
                        <>
                          {!isAdding && (
                            <button
                              className="min-w-[210px] flex-shrink-0 rounded-lg border border-[#1f2329] bg-[#111318] hover:bg-[#15181c] text-left p-3 text-[#8a8f98] flex items-center gap-2"
                              onClick={() => setIsAdding(true)}
                              aria-label="Adicionar coluna"
                            >
                              <div className="h-8 w-8 rounded-md bg-[#1a1d21] border border-[#222326] flex items-center justify-center">
                                <Plus className="h-4 w-4 text-[#f7f8f8]" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#f7f8f8]">Adicionar coluna</div>
                                <div className="text-[11px]">Defina nome e cor</div>
                              </div>
                            </button>
                          )}

                          {isAdding && (
                            <div className="min-w-[210px] flex-shrink-0 rounded-lg border border-[#1f2329] bg-[#14171b] p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Input
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  placeholder="Nome da coluna"
                                />
                                <input
                                  aria-label="Cor da nova coluna"
                                  type="color"
                                  value={newColor}
                                  onChange={(e) => setNewColor(e.target.value)}
                                  className="h-8 w-10 rounded border border-[#2a2d33] bg-transparent"
                                />
                              </div>
                              <Input
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Descricao da coluna"
                                className="mb-2"
                              />
                              <div className="flex items-center gap-2">
                                <Button size="xs" className="w-auto" onClick={handleAddColumn} disabled={!newName.trim()}>
                                  <Check className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                                <Button variant="ghost" size="xs" className="w-auto" onClick={() => setIsAdding(false)}>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      );

                      return (
                        <>
                          {novoColumn ? renderColumn(novoColumn, 0) : null}
                          {processColumns.map((column, index) => renderColumn(column, index + 1))}
                          {renderAddCard()}
                          {tailColumns.map((column, index) =>
                            renderColumn(column, index + 1 + processColumns.length + (novoColumn ? 1 : 0)),
                          )}
                        </>
                      );
                    })()}

              </div>
            )}
          </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8a8f98]">Ativo</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (status === 'archived') return;
                      setStatus(status === 'active' ? 'inactive' : 'active');
                    }}
                    aria-pressed={status === 'active'}
                    aria-label="Alternar ativo"
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      status === 'active' ? 'bg-[#5e6ad2]' : 'bg-[#222326]'
                    } ${status === 'archived' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#f7f8f8] shadow-sm transition-transform ${
                        status === 'active' ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8a8f98]">Arquivado</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (status === 'archived') {
                        setStatus('inactive');
                      } else {
                        setStatus('archived');
                      }
                    }}
                    aria-pressed={status === 'archived'}
                    aria-label="Alternar arquivado"
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      status === 'archived' ? 'bg-[#5e6ad2]' : 'bg-[#222326]'
                    } cursor-pointer`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#f7f8f8] shadow-sm transition-transform ${
                        status === 'archived' ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <Button
              className="w-auto"
              disabled={saving || !hasChanges}
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-10 text-center">
          <div className="p-4 bg-[#1a1d21] rounded-full w-fit mx-auto mb-4 border border-[#222326]">
            <Kanban className="h-12 w-12 text-[#8a8f98]" />
          </div>
          <h3 className="text-lg font-semibold text-[#f7f8f8] mb-2">
            Quadro nao encontrado
          </h3>
          <p className="text-[#8a8f98]">
            Verifique se o quadro ainda existe ou tente novamente mais tarde.
          </p>
        </div>
      )}
    </div>
  );
}
