import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';
import { createKanbanBoard } from '../../services/kanbanService';

const REQUIRED_COLUMNS = [
  { key: 'novo', label: 'Novo', color: '#9ca3af', description: 'Entrada de novas solicitacoes' },
  { key: 'concluido', label: 'Concluido', color: '#22c55e', description: 'Atendimento finalizado' },
  { key: 'cancelado', label: 'Cancelado', color: '#ef4444', description: 'Encerrado sem conclusao' },
];

const PROCESS_COLOR_PALETTE = ['#f59e0b', '#38bdf8', '#10b981', '#fb7185', '#a3e635', '#f97316'];

type ProcessColumn = {
  name: string;
  color: string;
  description: string;
};

export default function CreateKanban() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [processColumns, setProcessColumns] = useState<ProcessColumn[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PROCESS_COLOR_PALETTE[0]);
  const [newDescription, setNewDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState(PROCESS_COLOR_PALETTE[0]);
  const [editingDescription, setEditingDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmAddProcessColumn = () => {
    if (!newName.trim()) return;
    setProcessColumns((prev) => [
      ...prev,
      { name: newName.trim(), color: newColor, description: newDescription.trim() },
    ]);
    setNewName('');
    setNewDescription('');
    setNewColor(PROCESS_COLOR_PALETTE[(processColumns.length + 1) % PROCESS_COLOR_PALETTE.length]);
    setIsAdding(false);
  };

  const removeProcessColumn = (index: number) => {
    setProcessColumns((prev) => prev.filter((_, i) => i !== index));
  };
  const startEdit = (index: number) => {
    const c = processColumns[index];
    setEditingIndex(index);
    setEditingName(c.name);
    setEditingColor(c.color);
    setEditingDescription(c.description || '');
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingName('');
    setEditingColor(PROCESS_COLOR_PALETTE[0]);
    setEditingDescription('');
  };
  const confirmEdit = () => {
    if (editingIndex === null) return;
    if (!editingName.trim()) return;
    setProcessColumns((prev) =>
      prev.map((c, i) =>
        i === editingIndex
          ? { ...c, name: editingName.trim(), color: editingColor, description: editingDescription.trim() }
          : c
      ),
    );
    cancelEdit();
  };

  const hasValidProcessColumns = processColumns.some((col) => col.name.trim().length > 0);
  const boardName = name.trim() || 'Novo quadro';

  const handleSave = async () => {
    if (!currentWorkspace) return;
    if (!name.trim() || !hasValidProcessColumns) return;

    try {
      setSaving(true);
      setError(null);
      const totalColumns = REQUIRED_COLUMNS.length + processColumns.length;
      const created = await createKanbanBoard(currentWorkspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        columns_count: totalColumns,
        cards_count: 0,
        columns: [
          {
            name: REQUIRED_COLUMNS[0].label,
            description: REQUIRED_COLUMNS[0].description,
            color: REQUIRED_COLUMNS[0].color,
            position: 0,
            is_required: true,
          },
          ...processColumns.map((column, index) => ({
            name: column.name,
            description: column.description || undefined,
            color: column.color,
            position: index + 1,
            is_required: false,
          })),
          {
            name: REQUIRED_COLUMNS[1].label,
            description: REQUIRED_COLUMNS[1].description,
            color: REQUIRED_COLUMNS[1].color,
            position: processColumns.length + 1,
            is_required: true,
          },
          {
            name: REQUIRED_COLUMNS[2].label,
            description: REQUIRED_COLUMNS[2].description,
            color: REQUIRED_COLUMNS[2].color,
            position: processColumns.length + 2,
            is_required: true,
          },
        ],
      });
      navigate(`/workspace/kanban/${created.id}`);
    } catch (err: any) {
      console.error('Erro ao criar quadro:', err);
      setError(err.response?.data?.detail || 'Erro ao criar quadro');
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
        <h1 className="text-3xl font-bold text-[#f7f8f8]">Novo Quadro</h1>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="rounded-lg border border-[#3f1d1d] bg-[#1f0e0e] text-sm text-[#fca5a5] px-4 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] items-end">
          <div>
            <label className="text-xs text-[#8a8f98]" htmlFor="kanban-name">Nome do quadro</label>
            <Input
              id="kanban-name"
              placeholder="Ex: Atendimento VIP"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[#8a8f98]" htmlFor="kanban-description">Descricao</label>
            <Input
              id="kanban-description"
              placeholder="Descreva o objetivo deste quadro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#f7f8f8]">Preview do quadro</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#2a2d33] bg-[#15181c] text-[#8a8f98]">
              {boardName}
            </span>
          </div>

          <div className="rounded-xl border border-[#1e2126] bg-gradient-to-br from-[#0f1114] via-[#121417] to-[#0c0e11] p-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
                {REQUIRED_COLUMNS.slice(0, 1).map((column) => (
                  <div key={column.key} className="min-w-[210px] flex-shrink-0">
                    <div className="rounded-lg border border-[#1f2329] bg-[#14171b] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                          <span className="text-sm font-semibold text-[#f7f8f8]">{column.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {processColumns.map((column, index) => (
                <div key={`preview-${index}`} className="min-w-[210px] flex-shrink-0">
                  <div className="rounded-lg border border-[#1f2329] bg-[#14171b] p-3">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2 mb-3">
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
                        <Button size="xs" className="w-auto h-8 px-2" onClick={confirmEdit} title="Salvar">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="xs" className="w-auto h-8 px-2" onClick={cancelEdit} title="Cancelar">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                          <span className="text-sm font-semibold text-[#f7f8f8]">
                            {column.name.trim() || `Processo ${index + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="xs" className="w-auto h-7 px-2" onClick={() => startEdit(index)} title="Editar">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="w-auto h-7 px-2"
                            onClick={() => removeProcessColumn(index)}
                            disabled={processColumns.length === 1}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {editingIndex === index ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Descricao da coluna"
                        />
                      </div>
                    ) : (
                      column.description && (
                        <p className="text-xs text-[#8a8f98] mt-2 line-clamp-2">{column.description}</p>
                      )
                    )}
                  </div>
                </div>
              ))}

              {!isAdding && (
                <button
                  className="min-w-[210px] flex-shrink-0 rounded-lg border border-[#1f2329] bg-[#111318] hover:bg-[#15181c] text-left p-3 text-[#8a8f98] flex items-center gap-2"
                  onClick={() => {
                    setIsAdding(true);
                    setNewColor(PROCESS_COLOR_PALETTE[processColumns.length % PROCESS_COLOR_PALETTE.length]);
                  }}
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
                    <Button size="xs" className="w-auto" onClick={confirmAddProcessColumn} disabled={!newName.trim()}>
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

              {REQUIRED_COLUMNS.slice(1).map((column) => (
                <div key={column.key} className="min-w-[210px] flex-shrink-0">
                  <div className="rounded-lg border border-[#1f2329] bg-[#14171b] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                        <span className="text-sm font-semibold text-[#f7f8f8]">{column.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" className="w-auto" onClick={() => navigate('/workspace/kanban')}>
          Cancelar
        </Button>
        <Button className="w-auto" disabled={!name.trim() || !hasValidProcessColumns || saving} onClick={handleSave}>
          <Plus className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Quadro'}
        </Button>
      </div>
    </div>
  );
}
