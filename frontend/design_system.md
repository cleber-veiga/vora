**Objetivo:** Refatorar a interface do sistema atual para o padrão visual "Linear Design", focado em modo escuro profundo, tipografia nítida, micro-bordas e layout em grade (Bento Grid).

---

## 🎨 1. Design Tokens (Paleta de Cores e Estilos)

Aplique rigorosamente estas definições visuais:

* **Background Principal:** `#08090a` (Preto profundo, levemente frio).
* **Superfície/Cards:** `#121417` (Para elementos elevados como containers e modais).
* **Bordas:** `1px solid #222326` (Sutil, para separação de seções).
* **Ação Primária (Brand):** `#5e6ad2` (Indigo Linear).
* **Texto Primário:** `#f7f8f8` (Quase branco, alta legibilidade).
* **Texto Secundário:** `#8a8f98` (Cinza suave para labels e descrições).
* **Border Radius:** Padrão de `8px` para botões e `12px` para containers maiores.

---

## 📐 2. Regras de Layout e Espaçamento

* **Bento Grid:** Organize listas e painéis de dados em grids modulares com espaçamento (`gap`) consistente de `16px` ou `24px`.
* **Hierarquia:** Use o peso da fonte (Medium/Semi-bold) em vez de aumentar excessivamente o tamanho do texto para títulos.
* **Densidade:** Mantenha uma densidade de informação alta, mas com "respiro" (padding interno) generoso nos cards.
* **Interações:** Adicione estados de `:hover` que clareiam levemente o fundo ou a borda (`border-color: #2e3035`).

---

## 💻 3. Instruções Técnicas (Tailwind/CSS)

Ao refatorar os componentes, siga este padrão de classes:

* **Containers:** `bg-[#121417] border border-[#222326] rounded-xl shadow-sm`
* **Botão Primário:** `bg-[#5e6ad2] hover:bg-[#6e7be2] text-[#f7f8f8] px-4 py-2 rounded-md transition-all`
* **Inputs:** `bg-transparent border border-[#222326] focus:border-[#5e6ad2] outline-none transition-colors`
* **Efeito Glass:** Para modais e dropdowns, use `bg-[#121417]/80 backdrop-blur-md`.

---

## 🛠️ 4. Ações de Refatoração (O que fazer)

1. **Limpeza:** Remova sombras projetadas (drop-shadows) pesadas, gradientes coloridos de fundo e bordas grossas.
2. **Consistência:** Substitua todos os `bg-white` ou cinzas claros pelos tokens escuros acima.
3. **Refinamento:** Adicione separadores finos (`border-b` ou `border-r`) de `1px` entre colunas de navegação e conteúdo principal.
4. **Ícones:** Utilize ícones de linha fina (como *Lucide React* ou *Radix Icons*) com espessura (`stroke-width`) de `1.5px`.

---

## 🛑 O que NÃO fazer:

* Não use preto puro (`#000000`) para o fundo.
* Não use cores vibrantes em excesso; a cor deve ser usada apenas para botões de ação ou indicadores de status.
* Não use cantos excessivamente arredondados (estilo "pílula") para cards, prefira o arredondamento sutil de 8px a 12px.

---

### Proxima Etapa sugerida:

**"Analise o arquivo [NOME_DO_ARQUIVO] e aplique as regras acima, focando primeiro na estrutura de cores e bordas da Dashboard principal."**

---

**Dica:** Se você estiver usando o **Cursor**, recomendo colocar este texto no seu arquivo `.cursorrules` na raiz do projeto. Assim, ele sempre saberá como "estilizar" qualquer novo código que gerar.

Quer que eu gere um exemplo de código de um **Card de Dashboard** seguindo exatamente esse prompt para você testar?