import React, { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { useOrganization } from '../contexts/OrganizationContext';

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { createOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gerar slug automaticamente a partir do nome
  const handleNameChange = (value: string) => {
    setName(value);
    // Gerar slug: lowercase, remover acentos, substituir espaços por hífens
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!name.trim()) {
      setError('O nome da organização é obrigatório');
      return;
    }

    if (!slug.trim()) {
      setError('O slug da organização é obrigatório');
      return;
    }

    if (slug.length < 3) {
      setError('O slug deve ter pelo menos 3 caracteres');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('O slug deve conter apenas letras minúsculas, números e hífens');
      return;
    }

    try {
      setLoading(true);
      await createOrganization(name, slug);
      
      // Limpar formulário
      setName('');
      setSlug('');
      setError(null);
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar organização');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setSlug('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader onClose={handleClose}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Criar Nova Organização</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar sua organização
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Campo Nome */}
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Organização *
              </label>
              <Input
                id="org-name"
                type="text"
                placeholder="Ex: Minha Empresa"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Campo Slug */}
            <div>
              <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL amigável) *
              </label>
              <Input
                id="org-slug"
                type="text"
                placeholder="minha-empresa"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Será usado na URL: /org/{slug || 'seu-slug'}
              </p>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Organização'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
