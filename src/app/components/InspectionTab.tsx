import { useState, useRef } from "react";
import { Plus, X, Trash2, Check, ClipboardList, Filter, Luggage, Search } from "lucide-react";
import { useStorage } from "./useStorage";
import type { InspectionItem } from "./types";

const CATEGORIES = [
  { value: "levar", label: "O que levar", color: "#8B6E52", icon: Luggage },
  { value: "verificar", label: "Pontos a verificar", color: "#4A3728", icon: Search },
] as const;

const DEFAULT_ITEMS: InspectionItem[] = [
  { id: "d1", category: "levar", description: "Câmera ou celular com bateria cheia para fotos/vídeos", checked: false },
  { id: "d2", category: "levar", description: "Caneta e bloco de anotações para pendências", checked: false },
  { id: "d3", category: "levar", description: "Lanterna forte (para inspecionar sob pias e forros)", checked: false },
  { id: "d4", category: "levar", description: "Trena ou fita métrica", checked: false },
  { id: "d5", category: "levar", description: "Carregador de celular para testar todas as tomadas", checked: false },
  { id: "d6", category: "levar", description: "Balde ou copo para testar o escoamento dos ralos", checked: false },
  { id: "d7", category: "verificar", description: "Paredes e pintura (manchas, rachaduras, umidade)", checked: false },
  { id: "d8", category: "verificar", description: "Piso e revestimento (nivelamento, rejunte, peças ocas ou trincadas)", checked: false },
  { id: "d9", category: "verificar", description: "Teto e gesso (alinhamento, manchas de vazamento)", checked: false },
  { id: "d10", category: "verificar", description: "Janelas, sacada e vidros (abertura, vedação, fechos)", checked: false },
  { id: "d11", category: "verificar", description: "Portas e portais (alinhamento, miolo, fechaduras, chaves)", checked: false },
  { id: "d12", category: "verificar", description: "Instalações elétricas (interruptores, tomadas, quadro de disjuntores)", checked: false },
  { id: "d13", category: "verificar", description: "Instalações hidráulicas (pressão da água, torneiras, vasos, sifões)", checked: false },
  { id: "d14", category: "verificar", description: "Área de serviço e tubulação de gás", checked: false },
  { id: "d15", category: "verificar", description: "Garagem e vaga de estacionamento correspondente", checked: false },
];

const emptyForm = { category: "levar" as InspectionItem["category"], description: "" };

interface Props { userId: string }

export function InspectionTab({ userId }: Props) {
  const [items, setItems] = useStorage<InspectionItem[]>(`apt_inspection_${userId}`, DEFAULT_ITEMS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Drag-to-scroll handlers
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const add = () => {
    if (!form.description.trim()) return;
    const item: InspectionItem = {
      id: Date.now().toString(),
      category: form.category,
      description: form.description.trim(),
      checked: false,
    };
    setItems(prev => [...prev, item]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Top Filter Chips & Discrete Add Button */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar select-none cursor-grab active:cursor-grabbing flex-1 py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[{ value: "all", label: "Todos os itens", icon: ClipboardList }, ...CATEGORIES].map(c => {
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                onClick={() => {
                  if (!hasMoved) {
                    setActiveCategory(c.value);
                  }
                }}
                className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all border flex items-center gap-1.5 flex-shrink-0"
                style={{
                  background: activeCategory === c.value ? "#8B6E52" : "#FBF8F5",
                  color: activeCategory === c.value ? "#FBF8F5" : "#6B584C",
                  borderColor: activeCategory === c.value ? "#8B6E52" : "#E8DDD4",
                }}
              >
                <Icon size={13} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-all active:scale-95 flex-shrink-0"
          style={{ background: "#8B6E52", borderColor: "#8B6E52" }}
          title="Adicionar Item na Vistoria"
        >
          <Plus size={18} color="#FBF8F5" />
        </button>
      </div>

      {/* Progress Header */}
      <div className="rounded-3xl p-5 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#4A3728" }}>
            <ClipboardList size={18} color="#8B6E52" /> Progresso da Vistoria
          </p>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#F5F0EB", color: "#8B6E52" }}>
            {checkedCount} / {totalCount} Concluídos
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ background: "#E8DDD4" }}>
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#8B6E52" }}
          />
        </div>
        <p className="text-xs text-right font-medium" style={{ color: "#9B8578" }}>{progress.toFixed(0)}% vistoriado</p>
      </div>

      {/* Category Summaries */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const catItems = items.filter(i => i.category === cat.value);
          const catChecked = catItems.filter(i => i.checked).length;
          return (
            <div key={cat.value} className="rounded-2xl p-3 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
              <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: "#4A3728" }}>
                <Icon size={14} color={cat.color} /> {cat.label}
              </p>
              <p className="text-xs font-medium" style={{ color: cat.color }}>{catChecked} de {catItems.length} prontos</p>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-3xl border p-5 flex flex-col gap-3.5 shadow-md" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#4A3728" }}>Novo Item de Vistoria</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-black/5">
              <X size={16} color="#9B8578" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#4A3728" }}>Categoria *</label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: form.category === cat.value ? cat.color : "#F5F0EB",
                      color: form.category === cat.value ? "#FBF8F5" : "#9B8578",
                      borderColor: form.category === cat.value ? cat.color : "#E8DDD4",
                    }}
                  >
                    <Icon size={14} /> {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Descrição do Item / Ponto de Verificação *</label>
            <textarea
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none resize-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Checar vedação do box do banheiro suite..."
              rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <button
            onClick={add}
            disabled={!form.description.trim()}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 shadow-sm"
            style={{ background: "#8B6E52", color: "#FBF8F5" }}
          >
            Adicionar à Vistoria
          </button>
        </div>
      )}

      {/* Items List grouped by Category */}
      {(activeCategory === "all" ? CATEGORIES : CATEGORIES.filter(c => c.value === activeCategory)).map(cat => {
        const Icon = cat.icon;
        const catItems = filtered.filter(i => i.category === cat.value);
        if (catItems.length === 0) return null;
        return (
          <div key={cat.value} className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wider px-1 pt-1 flex items-center gap-1.5" style={{ color: "#4A3728" }}>
              <Icon size={14} color="#8B6E52" /> {cat.label} ({catItems.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {catItems.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl border p-3.5 flex items-center gap-3 shadow-sm transition-all"
                  style={{
                    background: item.checked ? "#F0EDE8" : "#FBF8F5",
                    borderColor: "#E8DDD4",
                    opacity: item.checked ? 0.75 : 1,
                  }}
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all"
                    style={{
                      borderColor: item.checked ? "#8B6E52" : "#C4A882",
                      background: item.checked ? "#8B6E52" : "transparent",
                    }}
                  >
                    {item.checked && <Check size={14} color="#FBF8F5" />}
                  </button>
                  <p
                    className="flex-1 text-xs font-medium leading-snug"
                    style={{
                      color: "#4A3728",
                      textDecoration: item.checked ? "line-through" : "none",
                    }}
                  >
                    {item.description}
                  </p>
                  <button onClick={() => remove(item.id)} className="p-1 hover:bg-black/5 rounded-lg">
                    <Trash2 size={15} color="#C4A882" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
