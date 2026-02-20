import { useEffect, useMemo, useState } from 'react';
import { Kanban, Plus, Search, ArrowRight, Layers, List, LayoutGrid } from 'lucide-react';
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
  cards: number;
}

export default function Kanbans() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [kanbans, setKanbans] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatUpdatedAt = (value?: string | null) => {
    if (!value) return '---';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '---';
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    if (!currentWorkspace) {
      setKanbans([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listKanbanBoards(currentWorkspace.id);
        const mapped = response.map((board) => ({
          id: board.id,
          name: board.name,
          description: board.description || 'Sem descricao',
          status: board.status,
          updatedAt: formatUpdatedAt(board.updated_at),
          columns: board.columns_count ?? 0,
          cards: board.cards_count ?? 0,
        }));
        setKanbans(mapped);
      } catch (err: any) {
        console.error('Erro ao carregar quadros:', err);
        setError(err.response?.data?.detail || 'Erro ao carregar quadros');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [currentWorkspace?.id]);

  const filteredKanbans = useMemo(() => {
    if (!searchQuery.trim()) return kanbans;
    const query = searchQuery.toLowerCase();
    return kanbans.filter((kanban) =>
      kanban.name.toLowerCase().includes(query) ||
      kanban.description.toLowerCase().includes(query)
    );
  }, [searchQuery, kanbans]);

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  return (
    <div className="pl-3 pr-4 pt-2 pb-4 w-full text-[#f7f8f8]">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-[#8a8f98]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{currentWorkspace?.name}</span>
          <span className="text-[#2e3035]">/</span>
          <span className="font-medium text-[#f7f8f8]">Quadros</span>
        </div>
        <span className="hidden sm:inline text-[11px] text-[#6b6f78]">
          {kanbans.length} quadros cadastrados
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a8f98]" />
          <Input
            type="text"
            placeholder="Buscar quadros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-[#121417] border-[#222326] text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 justify-between md:justify-end mt-1 md:mt-0">
          <div className="flex items-center gap-1 bg-[#121417] border border-[#222326] rounded-md p-0.5">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="xs"
              className="w-auto h-7 w-7 p-0"
              onClick={() => setViewMode('cards')}
              title="Visao em cards"
              aria-label="Visao em cards"
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="xs"
              className="w-auto h-7 w-7 p-0"
              onClick={() => setViewMode('list')}
              title="Visao em lista"
              aria-label="Visao em lista"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
          <Button
            size="xs"
            className="w-auto h-7 w-7 p-0 rounded-md"
            onClick={() => navigate('/workspace/kanban/new')}
            title="Novo quadro"
            aria-label="Novo quadro"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-6 text-center text-sm text-[#8a8f98]">
          Carregando quadros...
        </div>
      ) : error ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-6 text-center text-sm text-[#fca5a5]">
          {error}
        </div>
      ) : filteredKanbans.length === 0 ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-12 text-center">
          <div className="p-4 bg-[#1a1d21] rounded-full w-fit mx-auto mb-4 border border-[#222326]">
            <Kanban className="h-12 w-12 text-[#8a8f98]" />
          </div>
          <h3 className="text-lg font-semibold text-[#f7f8f8] mb-2">
            {searchQuery ? 'Nenhum quadro encontrado' : 'Nenhum quadro cadastrado'}
          </h3>
          <p className="text-[#8a8f98] mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca ou crie um novo quadro.'
              : 'Crie seu primeiro quadro para organizar os atendimentos.'}
          </p>
          {!searchQuery && (
            <Button className="w-auto" onClick={() => navigate('/workspace/kanban/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Quadro
            </Button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKanbans.map((kanban) => (
            <div
              key={kanban.id}
              className="bg-[#121417] rounded-xl border border-[#222326] p-6 hover:border-[#2e3035] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#1a1d21] rounded-lg border border-[#222326]">
                  <Kanban className="h-6 w-6 text-[#f7f8f8]" />
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    kanban.status === 'active'
                      ? 'bg-green-500/10 text-green-300 border border-green-500/40'
                      : kanban.status === 'archived'
                        ? 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                      : 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                  }`}
                >
                  {kanban.status === 'active' ? 'Ativo' : kanban.status === 'archived' ? 'Arquivado' : 'Inativo'}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#f7f8f8] mb-1">
                  {kanban.name}
                </h3>
                <p className="text-sm text-[#8a8f98] line-clamp-2">
                  {kanban.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8a8f98] mb-4">
                <div className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  {kanban.columns} colunas
                </div>
                <div className="h-1 w-1 rounded-full bg-[#2e3035]" />
                <div>{kanban.cards} cards</div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#222326]">
                <span className="text-xs text-[#8a8f98]">Atualizado {kanban.updatedAt}</span>
                <Button
                  variant="ghost"
                  className="w-auto h-9 px-3"
                  onClick={() => navigate(`/workspace/kanban/${kanban.id}`)}
                >
                  Entrar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#121417] rounded-xl border border-[#222326] overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-[#8a8f98] uppercase tracking-wider border-b border-[#222326]">
            <span>Quadro</span>
            <span>Descricao</span>
            <span>Status</span>
            <span>Colunas</span>
            <span>Cards</span>
            <span className="text-right">Acoes</span>
          </div>
          <div className="divide-y divide-[#222326]">
            {filteredKanbans.map((kanban) => (
              <div
                key={kanban.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#15181c] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a1d21] rounded-lg border border-[#222326]">
                    <Kanban className="h-4 w-4 text-[#f7f8f8]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#f7f8f8]">
                      {kanban.name}
                    </div>
                    <div className="text-xs text-[#8a8f98] md:hidden">
                      Atualizado {kanban.updatedAt}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#8a8f98] line-clamp-2">
                  {kanban.description}
                </p>

                <span
                  className={`w-fit px-2 py-1 text-xs font-medium rounded-full ${
                    kanban.status === 'active'
                      ? 'bg-green-500/10 text-green-300 border border-green-500/40'
                      : kanban.status === 'archived'
                        ? 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                      : 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                  }`}
                >
                  {kanban.status === 'active' ? 'Ativo' : kanban.status === 'archived' ? 'Arquivado' : 'Inativo'}
                </span>

                <div className="text-sm text-[#8a8f98]">{kanban.columns}</div>
                <div className="text-sm text-[#8a8f98]">{kanban.cards}</div>

                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span className="text-xs text-[#8a8f98] hidden md:inline">
                    Atualizado {kanban.updatedAt}
                  </span>
                  <Button
                    variant="ghost"
                    className="w-auto h-9 px-3"
                    onClick={() => navigate(`/workspace/kanban/${kanban.id}`)}
                  >
                    Entrar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
