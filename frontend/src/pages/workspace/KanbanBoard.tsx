import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, Edit2, X, Check,
  Layers, Kanban, ChevronRight,
} from 'lucide-react';
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

/* ── helpers ─────────────────────────────────────────────────────────── */
const normalizeColumnName  = (name: string) => name.trim().toLowerCase();
const isNovoColumn         = (c: KanbanColumn) => normalizeColumnName(c.name) === 'novo';
const isConcluidoColumn    = (c: KanbanColumn) => normalizeColumnName(c.name) === 'concluido';
const isCanceladoColumn    = (c: KanbanColumn) => normalizeColumnName(c.name) === 'cancelado';
const isProcessColumn      = (c: KanbanColumn) => !c.is_required;
const isTailRequiredColumn = (c: KanbanColumn) => c.is_required && !isNovoColumn(c);

const getOrderedColumns = (list: KanbanColumn[]) => {
  const novo    = list.find(isNovoColumn);
  const process = list.filter(isProcessColumn).sort((a, b) => a.position - b.position);
  const tail    = list
    .filter(isTailRequiredColumn)
    .sort((a, b) => {
      if (isConcluidoColumn(a) && isCanceladoColumn(b)) return -1;
      if (isCanceladoColumn(a) && isConcluidoColumn(b)) return 1;
      return a.position - b.position;
    });
  return [...(novo ? [novo] : []), ...process, ...tail];
};

/* ── Toggle component ────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-[#5e6ad2]' : 'bg-[#272b3a] border border-[#3a4060]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
      `}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function KanbanBoard() {
  const { currentWorkspace } = useWorkspace();
  const navigate             = useNavigate();
  const { kanbanId }         = useParams();

  const [board,          setBoard]          = useState<KanbanBoardType | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [name,           setName]           = useState('');
  const [description,    setDescription]    = useState('');
  const [status,         setStatus]         = useState<KanbanBoardType['status']>('active');
  const [columns,        setColumns]        = useState<KanbanColumn[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [isAdding,       setIsAdding]       = useState(false);
  const [newName,        setNewName]        = useState('');
  const [newColor,       setNewColor]       = useState('#f59e0b');
  const [newDescription, setNewDescription] = useState('');
  const [editingId,      setEditingId]      = useState<number | null>(null);
  const [editingName,    setEditingName]    = useState('');
  const [editingColor,   setEditingColor]   = useState('#f59e0b');
  const [editingDesc,    setEditingDesc]    = useState('');

  const boardId = Number(kanbanId);

  /* fetch board */
  useEffect(() => {
    if (!currentWorkspace || Number.isNaN(boardId)) {
      setLoading(false);
      setError('Quadro inválido');
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getKanbanBoard(currentWorkspace.id, boardId);
        setBoard(res);
        setName(res.name);
        setDescription(res.description || '');
        setStatus(res.status);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erro ao carregar quadro');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentWorkspace?.id, boardId]);

  /* fetch columns */
  useEffect(() => {
    if (!currentWorkspace || Number.isNaN(boardId)) {
      setColumns([]);
      setColumnsLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        setColumnsLoading(true);
        const res = await listKanbanColumns(currentWorkspace.id, boardId);
        setColumns(res);
      } catch {
        /* silent */
      } finally {
        setColumnsLoading(false);
      }
    };
    fetch();
  }, [currentWorkspace?.id, boardId]);

  const hasChanges = useMemo(() => {
    if (!board) return false;
    return (
      board.name !== name.trim() ||
      (board.description || '') !== description.trim() ||
      board.status !== status
    );
  }, [board, name, description, status]);

  /* add column */
  const handleAddColumn = async () => {
    if (!currentWorkspace || Number.isNaN(boardId) || !newName.trim()) return;
    try {
      const ordered      = getOrderedColumns(columns);
      const novoIndex    = ordered.findIndex(isNovoColumn);
      const processCount = ordered.filter(isProcessColumn).length;
      const insertPos    = (novoIndex >= 0 ? novoIndex + 1 : 0) + processCount;
      const created      = await createKanbanColumn(currentWorkspace.id, boardId, {
        name: newName.trim(), description: newDescription.trim() || undefined,
        color: newColor, position: insertPos, is_required: false,
      });
      let updated = [...columns, created];
      const tail  = ordered.filter(isTailRequiredColumn).sort((a, b) => {
        if (isConcluidoColumn(a) && isCanceladoColumn(b)) return -1;
        if (isCanceladoColumn(a) && isConcluidoColumn(b)) return 1;
        return a.position - b.position;
      });
      let nextPos = insertPos + 1;
      for (const col of tail) {
        if (col.position <= insertPos) {
          const u = await updateKanbanColumn(currentWorkspace.id, boardId, col.id, { position: nextPos });
          updated = updated.map(c => c.id === u.id ? u : c);
          nextPos++;
        }
      }
      setColumns(updated);
      setBoard(prev => prev ? { ...prev, columns_count: prev.columns_count + 1 } : prev);
      setNewName(''); setNewDescription(''); setNewColor('#f59e0b'); setIsAdding(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao adicionar coluna');
    }
  };

  /* edit column */
  const startEdit  = (col: KanbanColumn) => { setEditingId(col.id); setEditingName(col.name); setEditingColor(col.color || '#f59e0b'); setEditingDesc(col.description || ''); };
  const cancelEdit = () => { setEditingId(null); setEditingName(''); setEditingColor('#f59e0b'); setEditingDesc(''); };
  const confirmEdit = async () => {
    if (!currentWorkspace || Number.isNaN(boardId) || editingId === null || !editingName.trim()) return;
    try {
      const u = await updateKanbanColumn(currentWorkspace.id, boardId, editingId, {
        name: editingName.trim(), description: editingDesc.trim() || undefined, color: editingColor,
      });
      setColumns(prev => prev.map(c => c.id === u.id ? u : c));
      cancelEdit();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao editar coluna');
    }
  };

  /* delete column */
  const handleDelete = async (col: KanbanColumn) => {
    if (!currentWorkspace || Number.isNaN(boardId) || col.is_required) return;
    try {
      await deleteKanbanColumn(currentWorkspace.id, boardId, col.id);
      setColumns(prev => prev.filter(c => c.id !== col.id));
      setBoard(prev => prev ? { ...prev, columns_count: Math.max(prev.columns_count - 1, 0) } : prev);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao remover coluna');
    }
  };

  /* save board */
  const handleSave = async () => {
    if (!currentWorkspace || !board || Number.isNaN(boardId)) return;
    if (!name.trim()) { setError('Informe o nome do quadro'); return; }
    try {
      setSaving(true); setError(null);
      const u = await updateKanbanBoard(currentWorkspace.id, boardId, {
        name: name.trim(), description: description.trim() || undefined, status,
      });
      setBoard(u);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar quadro');
    } finally {
      setSaving(false);
    }
  };

  const orderedColumns = useMemo(() => getOrderedColumns(columns), [columns]);

  if (!currentWorkspace) return <NoWorkspaceState />;

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-[1400px] mx-auto text-[#eef0f6]">

      {/* Back link */}
      <button
        onClick={() => navigate('/workspace/kanban')}
        className="inline-flex items-center gap-1.5 text-sm text-[#8b90a8] hover:text-[#eef0f6] mb-5 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
        Voltar para Quadros
      </button>

      {/* Page header */}
      {!loading && board && (
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#555b72] mb-1.5">
              <span>Cadastros</span>
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              <span>Quadros</span>
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              <span className="text-[#eef0f6] font-medium">{board.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#eef0f6] tracking-tight">{board.name}</h1>
            <p className="text-sm text-[#8b90a8] mt-1">Configure as colunas, nome e comportamento deste quadro</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {status === 'active' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Ativo
              </span>
            )}
            {status === 'inactive' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#555b72]/15 text-[#8b90a8] border border-[#272b3a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b90a8]" />
                Inativo
              </span>
            )}
            {status !== 'archived' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Não arquivado
              </span>
            )}
            {status === 'archived' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#555b72]/15 text-[#8b90a8] border border-[#272b3a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b90a8]" />
                Arquivado
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/8 text-sm text-red-400 px-4 py-3 flex items-center gap-2">
          <X className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-10 text-center text-sm text-[#8b90a8]">
          Carregando quadro...
        </div>
      ) : !board ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-12 text-center">
          <div className="p-4 bg-[#1f2330] rounded-full w-fit mx-auto mb-4 border border-[#272b3a]">
            <Kanban className="h-10 w-10 text-[#8b90a8]" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-[#eef0f6] mb-2">Quadro não encontrado</h3>
          <p className="text-[#8b90a8]">Verifique se o quadro ainda existe ou tente novamente.</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Card: Informações ─────────────────────────────────────── */}
          <div className="bg-[#181b22] border border-[#272b3a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#272b3a] flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-[#5e6ad2]/15 flex items-center justify-center flex-shrink-0">
                <Kanban className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-[#eef0f6]">Informações do Quadro</span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8b90a8] tracking-wide" htmlFor="kb-name">
                    Nome do quadro <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="kb-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Suporte ao Cliente"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8b90a8] tracking-wide" htmlFor="kb-desc">
                    Descrição
                  </label>
                  <Input
                    id="kb-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva o propósito deste quadro"
                  />
                </div>
              </div>

              <div className="border-t border-[#272b3a] pt-4 space-y-1">
                {/* Toggle Ativo */}
                <div className="flex items-center justify-between py-3 border-b border-[#272b3a]">
                  <div>
                    <p className="text-sm font-medium text-[#eef0f6]">Ativo</p>
                    <p className="text-xs text-[#8b90a8] mt-0.5">Quadros ativos ficam disponíveis para uso nos atendimentos</p>
                  </div>
                  <Toggle
                    checked={status === 'active'}
                    disabled={status === 'archived'}
                    onChange={() => {
                      if (status === 'archived') return;
                      setStatus(status === 'active' ? 'inactive' : 'active');
                    }}
                  />
                </div>
                {/* Toggle Arquivado */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[#eef0f6]">Arquivado</p>
                    <p className="text-xs text-[#8b90a8] mt-0.5">Quadros arquivados ficam ocultos mas preservam o histórico</p>
                  </div>
                  <Toggle
                    checked={status === 'archived'}
                    onChange={() => setStatus(status === 'archived' ? 'inactive' : 'archived')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Card: Colunas ─────────────────────────────────────────── */}
          <div className="bg-[#181b22] border border-[#272b3a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#272b3a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 text-green-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-[#eef0f6]">Colunas do Quadro</span>
                <span className="text-xs text-[#8b90a8]">{columns.length} colunas configuradas</span>
              </div>
              <span className="text-xs text-[#555b72] hidden sm:inline">Arraste para reordenar</span>
            </div>

            <div className="p-5">
              {columnsLoading ? (
                <div className="text-sm text-[#8b90a8] py-4 text-center">Carregando colunas...</div>
              ) : (
                /* Scroll wrapper with fade */
                <div className="relative">
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#181b22] to-transparent pointer-events-none z-10 rounded-r-lg" />
                  <div className="flex gap-3 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-[4px]">
                    {(() => {
                      const novoCol     = orderedColumns.find(isNovoColumn);
                      const processCols = orderedColumns.filter(isProcessColumn);
                      const tailCols    = orderedColumns.filter(isTailRequiredColumn);

                      const renderCol = (col: KanbanColumn, idx: number) => (
                        <div
                          key={col.id}
                          className="group flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#272b3a] rounded-xl overflow-hidden
                            hover:border-[#5e6ad2]/40 hover:shadow-[0_0_0_1px_rgba(94,106,210,0.12)] transition-all duration-150"
                        >
                          {editingId === col.id ? (
                            /* Edit mode */
                            <div className="p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={e => setEditingName(e.target.value)}
                                  placeholder="Nome da coluna"
                                  className="h-8 text-xs"
                                />
                                <input
                                  aria-label="Cor da coluna"
                                  type="color"
                                  value={editingColor}
                                  onChange={e => setEditingColor(e.target.value)}
                                  className="h-8 w-9 rounded-lg border border-[#272b3a] bg-transparent cursor-pointer flex-shrink-0"
                                />
                              </div>
                              <Input
                                value={editingDesc}
                                onChange={e => setEditingDesc(e.target.value)}
                                placeholder="Descrição da coluna"
                                className="h-8 text-xs"
                              />
                              <div className="flex items-center gap-2 pt-1">
                                <Button size="xs" className="w-auto flex-1" onClick={confirmEdit}>
                                  <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                                  Salvar
                                </Button>
                                <Button variant="ghost" size="xs" className="w-auto" onClick={cancelEdit}>
                                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* View mode */
                            <>
                              <div className="px-3.5 py-3 border-b border-[#272b3a] flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: col.color || '#9ca3af' }}
                                  />
                                  <span className="text-sm font-semibold text-[#eef0f6] truncate">{col.name}</span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
                                  <button
                                    onClick={() => startEdit(col)}
                                    className="w-6 h-6 rounded flex items-center justify-center text-[#8b90a8] hover:bg-[#252a38] hover:text-[#eef0f6] transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(col)}
                                    disabled={col.is_required}
                                    className="w-6 h-6 rounded flex items-center justify-center text-[#8b90a8] hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={col.is_required ? 'Coluna obrigatória' : 'Excluir'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                  </button>
                                </div>
                              </div>
                              <div className="px-3.5 py-3">
                                {col.description && (
                                  <p className="text-xs text-[#8b90a8] mb-2.5 line-clamp-2 leading-relaxed">{col.description}</p>
                                )}
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#8b9fff] font-medium">
                                    Posição {idx + 1}
                                  </span>
                                  {col.is_required && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">
                                      Obrigatória
                                    </span>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );

                      const renderAddCard = () => (
                        <>
                          {!isAdding ? (
                            <button
                              onClick={() => setIsAdding(true)}
                              className="flex-shrink-0 w-[200px] rounded-xl border-2 border-dashed border-[#272b3a]
                                hover:border-[#5e6ad2] hover:bg-[#5e6ad2]/5 flex flex-col items-center justify-center gap-1.5
                                p-5 text-[#555b72] hover:text-[#5e6ad2] transition-all duration-150 cursor-pointer min-h-[110px]"
                            >
                              <div className="w-8 h-8 rounded-lg border-2 border-dashed border-current flex items-center justify-center">
                                <Plus className="h-4 w-4" strokeWidth={2} />
                              </div>
                              <span className="text-xs font-semibold">Adicionar coluna</span>
                              <span className="text-[11px] opacity-70">Defina nome e cor</span>
                            </button>
                          ) : (
                            <div className="flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#5e6ad2]/40 rounded-xl p-3 space-y-2 shadow-[0_0_0_1px_rgba(94,106,210,0.1)]">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newName}
                                  onChange={e => setNewName(e.target.value)}
                                  placeholder="Nome da coluna"
                                  className="h-8 text-xs"
                                  autoFocus
                                />
                                <input
                                  aria-label="Cor da nova coluna"
                                  type="color"
                                  value={newColor}
                                  onChange={e => setNewColor(e.target.value)}
                                  className="h-8 w-9 rounded-lg border border-[#272b3a] bg-transparent cursor-pointer flex-shrink-0"
                                />
                              </div>
                              <Input
                                value={newDescription}
                                onChange={e => setNewDescription(e.target.value)}
                                placeholder="Descrição (opcional)"
                                className="h-8 text-xs"
                              />
                              <div className="flex items-center gap-2 pt-1">
                                <Button
                                  size="xs"
                                  className="w-auto flex-1"
                                  onClick={handleAddColumn}
                                  disabled={!newName.trim()}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                                  Adicionar
                                </Button>
                                <Button variant="ghost" size="xs" className="w-auto" onClick={() => setIsAdding(false)}>
                                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      );

                      return (
                        <>
                          {novoCol && renderCol(novoCol, 0)}
                          {processCols.map((col, i) => renderCol(col, i + 1))}
                          {renderAddCard()}
                          {tailCols.map((col, i) =>
                            renderCol(col, i + 1 + processCols.length + (novoCol ? 1 : 0))
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="px-5 py-4 border-t border-[#272b3a] bg-[#181b22] flex items-center justify-end gap-3">
              <button
                onClick={() => navigate('/workspace/kanban')}
                className="px-4 py-2 rounded-lg border border-[#272b3a] text-sm font-medium text-[#8b90a8]
                  hover:bg-[#1f2330] hover:text-[#eef0f6] hover:border-[#3a4060] transition-all"
              >
                Cancelar
              </button>
              <Button
                className="w-auto"
                disabled={saving || !hasChanges}
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
