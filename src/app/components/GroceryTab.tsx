import { useState, useRef } from "react";
import { Plus, X, Trash2, Check, ShoppingCart, ChevronDown, Eye, EyeOff, CheckCircle2, ShoppingBag } from "lucide-react";
import { useStorage } from "./useStorage";
import type { GroceryItem } from "./types";

const emptyForm = { name: "", quantity: "1", unitValue: "" };

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props { userId: string }

export function GroceryTab({ userId }: Props) {
  const [items, setItems] = useStorage<GroceryItem[]>(`apt_grocery_${userId}`, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showChecked, setShowChecked] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "checked">("all");

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
    if (!form.name.trim()) return;
    const qty = parseFloat(form.quantity) || 1;
    const unit = parseFloat(form.unitValue) || 0;

    const item: GroceryItem = {
      id: Date.now().toString(),
      name: form.name.trim(),
      quantity: qty,
      unitValue: unit,
      checked: false,
    };
    setItems(prev => [...prev, item]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const pending = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  // Valor da lista = soma do campo Valor final dos itens que NÃO foi dado o check-in
  const valorDaLista = pending.reduce((acc, i) => acc + i.quantity * i.unitValue, 0);

  // Valor comprados = soma do campo Valor final dos itens que FOI dado o check-in
  const valorComprados = checked.reduce((acc, i) => acc + i.quantity * i.unitValue, 0);

  return (
    <div className="flex flex-col gap-4 pb-28">
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
          {[
            { value: "all", label: "Todos os Itens", icon: ShoppingBag, count: items.length },
            { value: "pending", label: "A Comprar", icon: ShoppingCart, count: pending.length },
            { value: "checked", label: "Comprados", icon: CheckCircle2, count: checked.length },
          ].map(c => {
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                onClick={() => {
                  if (!hasMoved) {
                    setFilterMode(c.value as any);
                  }
                }}
                className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all border flex items-center gap-1.5 flex-shrink-0"
                style={{
                  background: filterMode === c.value ? "#8B6E52" : "#FBF8F5",
                  color: filterMode === c.value ? "#FBF8F5" : "#6B584C",
                  borderColor: filterMode === c.value ? "#8B6E52" : "#E8DDD4",
                }}
              >
                <Icon size={13} />
                <span>{c.label} ({c.count})</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-all active:scale-95 flex-shrink-0"
          style={{ background: "#8B6E52", borderColor: "#8B6E52" }}
          title="Cadastrar Produto no Mercado"
        >
          <Plus size={18} color="#FBF8F5" />
        </button>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-4 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1 font-semibold uppercase tracking-wider" style={{ color: "#9B8578" }}>
            Valor da Lista (Falta)
          </p>
          <p className="text-base font-bold" style={{ color: "#4A3728" }}>{fmt(valorDaLista)}</p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: "#8B6E52" }}>{pending.length} itens a comprar</p>
        </div>
        <div className="rounded-2xl p-4 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1 font-semibold uppercase tracking-wider" style={{ color: "#9B8578" }}>
            Valor Comprados
          </p>
          <p className="text-base font-bold" style={{ color: "#8B6E52" }}>{fmt(valorComprados)}</p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: "#C4A882" }}>{checked.length} itens no carrinho</p>
        </div>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="rounded-2xl p-3.5 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="font-semibold" style={{ color: "#4A3728" }}>Progresso do Carrinho</span>
            <span className="font-bold" style={{ color: "#8B6E52" }}>{checked.length} de {items.length}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#E8DDD4" }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checked.length / items.length) * 100}%`, background: "#8B6E52" }}
            />
          </div>
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="rounded-3xl border p-5 flex flex-col gap-3.5 shadow-md" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#4A3728" }}>Novo Produto de Mercado</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-black/5">
              <X size={16} color="#9B8578" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Nome do Produto *</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Café Torrado 500g"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Quantidade</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="1"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Valor Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="0,00"
                value={form.unitValue}
                onChange={e => setForm(f => ({ ...f, unitValue: e.target.value }))}
              />
            </div>
          </div>

          {/* Valor final Preview = Quantidade * Valor Unitário */}
          {parseFloat(form.quantity) > 0 && parseFloat(form.unitValue) > 0 && (
            <div className="rounded-2xl p-3 text-center border" style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}>
              <p className="text-[11px] font-medium" style={{ color: "#9B8578" }}>Valor Final Calculado (Qtd × Unitário)</p>
              <p className="text-base font-bold" style={{ color: "#8B6E52" }}>
                {fmt(parseFloat(form.quantity) * parseFloat(form.unitValue))}
              </p>
            </div>
          )}

          <button
            onClick={add}
            disabled={!form.name.trim()}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 shadow-sm"
            style={{ background: "#8B6E52", color: "#FBF8F5" }}
          >
            Adicionar Produto
          </button>
        </div>
      )}

      {/* Pending Items List */}
      {(filterMode === "all" || filterMode === "pending") && pending.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5" style={{ color: "#4A3728" }}>
            <ShoppingCart size={15} color="#8B6E52" /> Itens a Comprar ({pending.length})
          </p>
          <div className="flex flex-col gap-2">
            {pending.map(item => {
              const valorFinal = item.quantity * item.unitValue;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border p-3.5 flex items-center gap-3 shadow-sm"
                  style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all"
                    style={{ borderColor: "#C4A882" }}
                    title="Marcar como comprado"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "#4A3728" }}>{item.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#9B8578" }}>
                      {item.quantity}x {item.unitValue > 0 ? fmt(item.unitValue) : "—"}
                      {item.unitValue > 0 && (
                        <span className="font-semibold" style={{ color: "#8B6E52" }}> = {fmt(valorFinal)}</span>
                      )}
                    </p>
                  </div>
                  <button onClick={() => remove(item.id)} className="p-1 hover:bg-black/5 rounded-lg">
                    <Trash2 size={15} color="#C4A882" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checked Items List */}
      {(filterMode === "all" || filterMode === "checked") && checked.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 mb-2 px-1 text-xs font-bold"
            style={{ color: "#8B6E52" }}
            onClick={() => setShowChecked(s => !s)}
          >
            {showChecked ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} color="#8B6E52" /> Comprados ({checked.length})
            </span>
            <span className="text-[11px] font-normal" style={{ color: "#9B8578" }}>
              ({showChecked ? "ocultar" : "mostrar"})
            </span>
          </button>

          {showChecked && (
            <div className="flex flex-col gap-2">
              {checked.map(item => {
                const valorFinal = item.quantity * item.unitValue;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border p-3.5 flex items-center gap-3 shadow-sm transition-all"
                    style={{ background: "#F0EDE8", borderColor: "#E8DDD4", opacity: 0.75 }}
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                      style={{ borderColor: "#8B6E52", background: "#8B6E52" }}
                      title="Desmarcar item"
                    >
                      <Check size={14} color="#FBF8F5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-through" style={{ color: "#9B8578" }}>{item.name}</p>
                      <p className="text-[11px]" style={{ color: "#9B8578" }}>
                        {item.quantity}x {item.unitValue > 0 && <span>= {fmt(valorFinal)}</span>}
                      </p>
                    </div>
                    <button onClick={() => remove(item.id)} className="p-1 hover:bg-black/5 rounded-lg">
                      <Trash2 size={15} color="#C4A882" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-10 rounded-2xl border" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <ShoppingCart size={32} color="#C4A882" className="mx-auto mb-2 opacity-60" />
          <p className="text-xs font-medium" style={{ color: "#9B8578" }}>Sua lista de mercado está vazia.</p>
        </div>
      )}

      {/* Fixed bottom bar for exact requested totals */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <div className="rounded-2xl p-4 flex justify-between items-center shadow-xl border" style={{ background: "#4A3728", borderColor: "#6B584C" }}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#C4A882" }}>
              Valor da lista
            </p>
            <p className="text-base font-extrabold" style={{ color: "#FBF8F5" }}>{fmt(valorDaLista)}</p>
          </div>
          <div className="h-8 w-px" style={{ background: "rgba(196, 168, 130, 0.3)" }} />
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#C4A882" }}>
              Valor comprados
            </p>
            <p className="text-base font-extrabold" style={{ color: "#FBF8F5" }}>{fmt(valorComprados)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
