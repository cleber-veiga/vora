import { useEffect, useMemo, useState } from 'react';
import {
  Kanban, Plus, Search, ArrowRight, Layers, List, LayoutGrid, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';
import { listKanbanBoards } from '../../services/kanbanService';

interface KanbanItem {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  updatedAt: string;
  columns: number;
}

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('pt-BR');
};

const StatusBadge = ({ status }: { status: KanbanItem['status'] }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Ativo
      </span>
    );
  }
  if (status === 'archived') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#272b3a] text-[#8b90a8] border border-[#272b3a]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8b90a8]" />
        Arquivado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#272b3a] text-[#8b90a8] border border-[#272b3a]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8b90a8]" />
      Inativo
    </span>
  );
};

export default function Kanbans() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode,    setViewMode]    = useState<'cards' | 'list'>('cards');
  const [kanbans,     setKanbans]     = useState<KanbanItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspace) { setKanbans([]); setLoading(false); setError(null); return; }
    const fetch = async () => {
      try {
        setLoading(true); setError(null);
        const res = await listKanbanBoards(currentWorkspace.id);
        setKanbans(res.map(b => ({
          id: b.id, name: b.name,
          description: b.description || 'Sem descrição',
          status: b.status,
          updatedAt: formatUpdatedAt(b.updated_at),
          columns: b.columns_count ?? 0,
        })));
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erro ao carregar quadros');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentWorkspace?.id]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return kanbans;
    const q = searchQuery.toLowerCase();
    return kanbans.filter(k => k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q));
  }, [searchQuery, kanbans]);

  if (!currentWorkspace) return <NoWorkspaceState />;

  /* ── render ──────────────────────────────────────────────────────── */
  return (
    <div className="max-w-[1400px] mx-auto text-[#eef0f6]">

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#555b72] mb-1.5">
            <span>{currentWorkspace.name}</span>
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-[#eef0f6] font-medium">Quadros</span>
          </div>
          <h1 className="text-2xl font-bold text-[#eef0f6] tracking-tight">Quadros</h1>
          <p className="text-sm text-[#8b90a8] mt-1">
            {kanbans.length === 0 ? 'Nenhum quadro cadastrado' : `${kanbans.length} quadro${kanbans.length !== 1 ? 's' : ''} cadastrado${kanbans.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button className="w-auto sm:mt-1 flex-shrink-0" onClick={() => navigate('/workspace/kanban/new')}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
          Novo Quadro
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555b72]" strokeWidth={1.5} />
          <Input
            type="text"
            placeholder="Buscar quadros..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[#181b22] border border-[#272b3a] rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            title="Visão em cards"
            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${
              viewMode === 'cards'
                ? 'bg-[#5e6ad2] text-white shadow-sm'
                : 'text-[#8b90a8] hover:bg-[#1f2330] hover:text-[#eef0f6]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Visão em lista"
            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-[#5e6ad2] text-white shadow-sm'
                : 'text-[#8b90a8] hover:bg-[#1f2330] hover:text-[#eef0f6]'
            }`}
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-10 text-center text-sm text-[#8b90a8]">
          Carregando quadros...
        </div>
      ) : error ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-10 text-center text-sm text-red-400">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-14 text-center">
          <div className="p-4 bg-[#1f2330] rounded-2xl w-fit mx-auto mb-5 border border-[#272b3a]">
            <Kanban className="h-10 w-10 text-[#555b72]" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-[#eef0f6] mb-2">
            {searchQuery ? 'Nenhum quadro encontrado' : 'Nenhum quadro cadastrado'}
          </h3>
          <p className="text-sm text-[#8b90a8] mb-6 max-w-xs mx-auto">
            {searchQuery
              ? 'Tente ajustar sua busca ou crie um novo quadro.'
              : 'Crie seu primeiro quadro para organizar os atendimentos.'}
          </p>
          {!searchQuery && (
            <Button className="w-auto mx-auto" onClick={() => navigate('/workspace/kanban/new')}>
              <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
              Criar Primeiro Quadro
            </Button>
          )}
        </div>

      ) : viewMode === 'cards' ? (
        /* ── Cards view ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(k => (
            <div
              key={k.id}
              onClick={() => navigate(`/workspace/kanban/${k.id}`)}
              className="group bg-[#181b22] rounded-xl border border-[#272b3a] p-5 cursor-pointer
                hover:border-[#5e6ad2]/40 hover:shadow-[0_0_0_1px_rgba(94,106,210,0.1),0_4px_20px_rgba(0,0,0,0.3)]
                transition-all duration-150"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-[#1f2330] rounded-xl border border-[#272b3a] group-hover:border-[#5e6ad2]/30 group-hover:bg-[#5e6ad2]/10 transition-all">
                  <Kanban className="h-5 w-5 text-[#8b90a8] group-hover:text-[#5e6ad2] transition-colors" strokeWidth={1.5} />
                </div>
                <StatusBadge status={k.status} />
              </div>

              <div className="mb-4">
                <h3 className="text-base font-semibold text-[#eef0f6] mb-1 group-hover:text-white transition-colors">
                  {k.name}
                </h3>
                <p className="text-sm text-[#8b90a8] line-clamp-2 leading-relaxed">{k.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#555b72] mb-4">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {k.columns} colunas
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#272b3a]">
                <span className="text-xs text-[#555b72]">Atualizado {k.updatedAt}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8b90a8] group-hover:text-[#5e6ad2] transition-colors">
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </span>
              </div>
            </div>
          ))}
        </div>

      ) : (
        /* ── List view ──────────────────────────────────────────────── */
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_80px_auto] gap-4 px-5 py-3 text-[11px] font-semibold text-[#555b72] uppercase tracking-widest border-b border-[#272b3a]">
            <span>Quadro</span>
            <span>Descrição</span>
            <span>Status</span>
            <span>Colunas</span>
            <span className="text-right">Ação</span>
          </div>

          <div className="divide-y divide-[#272b3a]">
            {filtered.map(k => (
              <div
                key={k.id}
                className="group grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_80px_auto] gap-4 px-5 py-4 items-center
                  hover:bg-[#1f2330] transition-colors cursor-pointer"
                onClick={() => navigate(`/workspace/kanban/${k.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1f2330] rounded-lg border border-[#272b3a] group-hover:border-[#5e6ad2]/30 group-hover:bg-[#5e6ad2]/10 transition-all flex-shrink-0">
                    <Kanban className="h-4 w-4 text-[#8b90a8] group-hover:text-[#5e6ad2] transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#eef0f6] truncate">{k.name}</div>
                    <div className="text-xs text-[#555b72] mt-0.5">Atualizado {k.updatedAt}</div>
                  </div>
                </div>

                <p className="text-sm text-[#8b90a8] line-clamp-2">{k.description}</p>

                <div><StatusBadge status={k.status} /></div>

                <div className="text-sm text-[#8b90a8]">{k.columns}</div>

                <div className="flex items-center justify-end gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8b90a8] group-hover:text-[#5e6ad2] transition-colors whitespace-nowrap">
                    Abrir
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
