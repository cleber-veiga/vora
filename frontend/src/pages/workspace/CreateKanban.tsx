import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, X, Check, Layers, Kanban, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';
import { createKanbanBoard } from '../../services/kanbanService';

const REQUIRED_COLUMNS = [
  { key: 'novo',      label: 'Novo',      color: '#9ca3af', description: 'Entrada de novas solicitações' },
  { key: 'concluido', label: 'Concluído', color: '#22c55e', description: 'Atendimento finalizado' },
  { key: 'cancelado', label: 'Cancelado', color: '#ef4444', description: 'Encerrado sem conclusão' },
];

const PROCESS_COLOR_PALETTE = ['#f59e0b', '#38bdf8', '#10b981', '#fb7185', '#a3e635', '#f97316'];

type ProcessColumn = { name: string; color: string; description: string };

export default function CreateKanban() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [name,             setName]             = useState('');
  const [description,      setDescription]      = useState('');
  const [processColumns,   setProcessColumns]   = useState<ProcessColumn[]>([]);
  const [isAdding,         setIsAdding]         = useState(false);
  const [newName,          setNewName]          = useState('');
  const [newColor,         setNewColor]         = useState(PROCESS_COLOR_PALETTE[0]);
  const [newDescription,   setNewDescription]   = useState('');
  const [editingIndex,     setEditingIndex]     = useState<number | null>(null);
  const [editingName,      setEditingName]      = useState('');
  const [editingColor,     setEditingColor]     = useState(PROCESS_COLOR_PALETTE[0]);
  const [editingDesc,      setEditingDesc]      = useState('');
  const [saving,           setSaving]           = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  /* ── column actions ──────────────────────────────────────────────── */
  const confirmAdd = () => {
    if (!newName.trim()) return;
    setProcessColumns(prev => [...prev, { name: newName.trim(), color: newColor, description: newDescription.trim() }]);
    setNewName(''); setNewDescription('');
    setNewColor(PROCESS_COLOR_PALETTE[(processColumns.length + 1) % PROCESS_COLOR_PALETTE.length]);
    setIsAdding(false);
  };

  const removeColumn = (i: number) => setProcessColumns(prev => prev.filter((_, idx) => idx !== i));

  const startEdit = (i: number) => {
    const c = processColumns[i];
    setEditingIndex(i); setEditingName(c.name); setEditingColor(c.color); setEditingDesc(c.description || '');
  };
  const cancelEdit = () => { setEditingIndex(null); setEditingName(''); setEditingColor(PROCESS_COLOR_PALETTE[0]); setEditingDesc(''); };
  const confirmEdit = () => {
    if (editingIndex === null || !editingName.trim()) return;
    setProcessColumns(prev => prev.map((c, i) =>
      i === editingIndex ? { ...c, name: editingName.trim(), color: editingColor, description: editingDesc.trim() } : c
    ));
    cancelEdit();
  };

  const hasValidProcessColumns = processColumns.some(c => c.name.trim().length > 0);
  const boardName = name.trim() || 'Novo quadro';

  /* ── save ────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!currentWorkspace || !name.trim() || !hasValidProcessColumns) return;
    try {
      setSaving(true); setError(null);
      const total   = REQUIRED_COLUMNS.length + processColumns.length;
      const created = await createKanbanBoard(currentWorkspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        columns_count: total,
        cards_count: 0,
        columns: [
          { name: REQUIRED_COLUMNS[0].label, description: REQUIRED_COLUMNS[0].description, color: REQUIRED_COLUMNS[0].color, position: 0, is_required: true },
          ...processColumns.map((col, i) => ({ name: col.name, description: col.description || undefined, color: col.color, position: i + 1, is_required: false })),
          { name: REQUIRED_COLUMNS[1].label, description: REQUIRED_COLUMNS[1].description, color: REQUIRED_COLUMNS[1].color, position: processColumns.length + 1, is_required: true },
          { name: REQUIRED_COLUMNS[2].label, description: REQUIRED_COLUMNS[2].description, color: REQUIRED_COLUMNS[2].color, position: processColumns.length + 2, is_required: true },
        ],
      });
      navigate(`/workspace/kanban/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar quadro');
    } finally {
      setSaving(false);
    }
  };

  if (!currentWorkspace) return <NoWorkspaceState />;

  /* ── render ──────────────────────────────────────────────────────── */
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
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#555b72] mb-1.5">
          <span>Cadastros</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          <span>Quadros</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-[#eef0f6] font-medium">Novo Quadro</span>
        </div>
        <h1 className="text-2xl font-bold text-[#eef0f6] tracking-tight">Novo Quadro</h1>
        <p className="text-sm text-[#8b90a8] mt-1">Configure o nome, descrição e colunas do novo quadro</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/8 text-sm text-red-400 px-4 py-3 flex items-center gap-2">
          <X className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}

      <div className="space-y-5">

        {/* ── Card: Informações ──────────────────────────────────────── */}
        <div className="bg-[#181b22] border border-[#272b3a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#272b3a] flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#5e6ad2]/15 flex items-center justify-center flex-shrink-0">
              <Kanban className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-[#eef0f6]">Informações do Quadro</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8b90a8] tracking-wide" htmlFor="ck-name">
                  Nome do quadro <span className="text-red-400">*</span>
                </label>
                <Input
                  id="ck-name"
                  placeholder="Ex: Atendimento VIP"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8b90a8] tracking-wide" htmlFor="ck-desc">
                  Descrição
                </label>
                <Input
                  id="ck-desc"
                  placeholder="Descreva o objetivo deste quadro"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Card: Colunas ──────────────────────────────────────────── */}
        <div className="bg-[#181b22] border border-[#272b3a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#272b3a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Layers className="h-4 w-4 text-green-400" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-[#eef0f6]">Colunas do Quadro</span>
              <span className="text-xs text-[#8b90a8]">
                {REQUIRED_COLUMNS.length + processColumns.length} colunas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#272b3a] bg-[#1f2330] text-[#8b90a8]">
                {boardName}
              </span>
            </div>
          </div>

          <div className="p-5">
            {/* Scroll wrapper with fade */}
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#181b22] to-transparent pointer-events-none z-10 rounded-r-lg" />
              <div className="flex gap-3 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-[4px]">

                {/* Required: Novo */}
                <div className="flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#272b3a] rounded-xl overflow-hidden">
                  <div className="px-3.5 py-3 border-b border-[#272b3a] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: REQUIRED_COLUMNS[0].color }} />
                    <span className="text-sm font-semibold text-[#eef0f6]">{REQUIRED_COLUMNS[0].label}</span>
                  </div>
                  <div className="px-3.5 py-3">
                    <p className="text-xs text-[#8b90a8] mb-2">{REQUIRED_COLUMNS[0].description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#8b9fff] font-medium">Posição 1</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">Obrigatória</span>
                    </div>
                  </div>
                </div>

                {/* Process columns */}
                {processColumns.map((col, i) => (
                  <div
                    key={`proc-${i}`}
                    className="group flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#272b3a] rounded-xl overflow-hidden
                      hover:border-[#5e6ad2]/40 hover:shadow-[0_0_0_1px_rgba(94,106,210,0.12)] transition-all duration-150"
                  >
                    {editingIndex === i ? (
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={editingName} onChange={e => setEditingName(e.target.value)} placeholder="Nome" className="h-8 text-xs" />
                          <input
                            aria-label="Cor"
                            type="color"
                            value={editingColor}
                            onChange={e => setEditingColor(e.target.value)}
                            className="h-8 w-9 rounded-lg border border-[#272b3a] bg-transparent cursor-pointer flex-shrink-0"
                          />
                        </div>
                        <Input value={editingDesc} onChange={e => setEditingDesc(e.target.value)} placeholder="Descrição" className="h-8 text-xs" />
                        <div className="flex gap-2 pt-1">
                          <Button size="xs" className="w-auto flex-1" onClick={confirmEdit}>
                            <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} /> Salvar
                          </Button>
                          <Button variant="ghost" size="xs" className="w-auto" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="px-3.5 py-3 border-b border-[#272b3a] flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                            <span className="text-sm font-semibold text-[#eef0f6] truncate">{col.name || `Processo ${i + 1}`}</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
                            <button
                              onClick={() => startEdit(i)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#8b90a8] hover:bg-[#252a38] hover:text-[#eef0f6] transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => removeColumn(i)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#8b90a8] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                        <div className="px-3.5 py-3">
                          {col.description && <p className="text-xs text-[#8b90a8] mb-2 line-clamp-2">{col.description}</p>}
                          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#8b9fff] font-medium">
                            Posição {i + 2}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add column button */}
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
                    <div className="flex gap-2 pt-1">
                      <Button size="xs" className="w-auto flex-1" onClick={confirmAdd} disabled={!newName.trim()}>
                        <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} /> Adicionar
                      </Button>
                      <Button variant="ghost" size="xs" className="w-auto" onClick={() => setIsAdding(false)}>
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Required: Concluído */}
                <div className="flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#272b3a] rounded-xl overflow-hidden">
                  <div className="px-3.5 py-3 border-b border-[#272b3a] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: REQUIRED_COLUMNS[1].color }} />
                    <span className="text-sm font-semibold text-[#eef0f6]">{REQUIRED_COLUMNS[1].label}</span>
                  </div>
                  <div className="px-3.5 py-3">
                    <p className="text-xs text-[#8b90a8] mb-2">{REQUIRED_COLUMNS[1].description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#8b9fff] font-medium">
                        Posição {processColumns.length + 2}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">Obrigatória</span>
                    </div>
                  </div>
                </div>

                {/* Required: Cancelado */}
                <div className="flex-shrink-0 w-[200px] bg-[#1a1d27] border border-[#272b3a] rounded-xl overflow-hidden">
                  <div className="px-3.5 py-3 border-b border-[#272b3a] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: REQUIRED_COLUMNS[2].color }} />
                    <span className="text-sm font-semibold text-[#eef0f6]">{REQUIRED_COLUMNS[2].label}</span>
                  </div>
                  <div className="px-3.5 py-3">
                    <p className="text-xs text-[#8b90a8] mb-2">{REQUIRED_COLUMNS[2].description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#8b9fff] font-medium">
                        Posição {processColumns.length + 3}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">Obrigatória</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Hint */}
            {!hasValidProcessColumns && (
              <p className="text-xs text-[#555b72] mt-3 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#555b72] flex-shrink-0" />
                Adicione pelo menos uma coluna de processo para salvar o quadro
              </p>
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
              disabled={saving || !name.trim() || !hasValidProcessColumns}
              onClick={handleSave}
            >
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
              {saving ? 'Salvando...' : 'Salvar Quadro'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
