import { useState, useRef } from "react";
import { Plus, Check, X, ChevronDown, Trash2, Calendar, FileText, DollarSign, Filter } from "lucide-react";
import { useStorage } from "./useStorage";
import type { UserProfile, Installment } from "./types";

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

const TYPES = [
  { value: "entrada", label: "Entrada" },
  { value: "mensal", label: "Parcelas Mensais" },
  { value: "anual", label: "Parcelas Anuais" },
  { value: "taxa_obra", label: "Taxa de Obra" },
  { value: "financiamento", label: "Financiamento" },
] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  entrada: { bg: "#EFE8DF", text: "#8B6E52" },
  mensal: { bg: "#E8DDD4", text: "#4A3728" },
  anual: { bg: "#DFD3C6", text: "#6B4F3A" },
  taxa_obra: { bg: "#F0EDE8", text: "#A0856A" },
  financiamento: { bg: "#E5DDD5", text: "#4A3728" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyForm = {
  type: "mensal" as Installment["type"],
  dueDate: "",
  value: "",
  installmentNumber: "",
  observation: "",
};

interface Props { userId: string }

export function FinancingTab({ userId }: Props) {
  const [profile] = useStorage<UserProfile>(`apt_profile_${userId}`, defaultProfile);
  const [installments, setInstallments] = useStorage<Installment[]>(`apt_installments_${userId}`, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState<string>("all");

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

  const totalPaid = installments.filter(i => i.paid).reduce((acc, i) => acc + i.value, 0);
  const totalFinancing = profile.totalFinancing || 0;
  const remaining = Math.max(0, totalFinancing - totalPaid);

  const addInstallment = () => {
    if (!form.value || !form.dueDate) return;
    const newItem: Installment = {
      id: Date.now().toString(),
      type: form.type,
      dueDate: form.dueDate,
      value: parseFloat(form.value),
      installmentNumber: form.installmentNumber,
      observation: form.observation,
      paid: false,
    };
    setInstallments(prev => [...prev, newItem]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const togglePaid = (id: string) => {
    setInstallments(prev => prev.map(i => i.id === id ? { ...i, paid: !i.paid } : i));
  };

  const deleteInstallment = (id: string) => {
    setInstallments(prev => prev.filter(i => i.id !== id));
  };

  const filtered = filterType === "all" ? installments : installments.filter(i => i.type === filterType);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Filter Chips & Discrete Add Button (Single line, drag scrollable, no scrollbar) */}
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
          {[{ value: "all", label: "Todas" }, ...TYPES].map(t => (
            <button
              key={t.value}
              onClick={() => {
                if (!hasMoved) {
                  setFilterType(t.value);
                }
              }}
              className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all border flex-shrink-0"
              style={{
                background: filterType === t.value ? "#8B6E52" : "#FBF8F5",
                color: filterType === t.value ? "#FBF8F5" : "#6B584C",
                borderColor: filterType === t.value ? "#8B6E52" : "#E8DDD4",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-all active:scale-95 flex-shrink-0"
          style={{ background: "#8B6E52", borderColor: "#8B6E52" }}
          title="Cadastrar Nova Parcela"
        >
          <Plus size={18} color="#FBF8F5" />
        </button>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1" style={{ color: "#9B8578" }}>Valor Total</p>
          <p className="text-xs font-bold truncate" style={{ color: "#4A3728" }}>{fmt(totalFinancing)}</p>
        </div>
        <div className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1" style={{ color: "#8B6E52" }}>Já Pago</p>
          <p className="text-xs font-bold truncate" style={{ color: "#8B6E52" }}>{fmt(totalPaid)}</p>
        </div>
        <div className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1" style={{ color: "#9B8578" }}>Falta Pagar</p>
          <p className="text-xs font-bold truncate" style={{ color: "#6B584C" }}>{fmt(remaining)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl p-4 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold" style={{ color: "#4A3728" }}>Progresso dos Pagamentos</p>
          <p className="text-xs font-bold" style={{ color: "#8B6E52" }}>
            {totalFinancing > 0 ? ((totalPaid / totalFinancing) * 100).toFixed(1) : "0"}%
          </p>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "#E8DDD4" }}>
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${totalFinancing > 0 ? Math.min(100, (totalPaid / totalFinancing) * 100) : 0}%`, background: "#8B6E52" }}
          />
        </div>
      </div>

      {/* Form Modal/Card */}
      {showForm && (
        <div className="rounded-3xl border p-5 flex flex-col gap-4 shadow-md" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#4A3728" }}>Cadastrar Parcela</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-black/5">
              <X size={16} color="#9B8578" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Tipo de Parcela *</label>
            <div className="relative">
              <select
                className="w-full rounded-2xl px-4 py-3 text-sm border outline-none appearance-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as Installment["type"] }))}
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown size={16} color="#9B8578" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Data de Vencimento *</label>
              <input
                type="date"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Nº da Parcela</label>
              <input
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: Parcela 1 ou 2/12"
                value={form.installmentNumber}
                onChange={e => setForm(f => ({ ...f, installmentNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="0,00"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Observação</label>
            <textarea
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none resize-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Comprovante guardado, pago via PIX..."
              rows={2}
              value={form.observation}
              onChange={e => setForm(f => ({ ...f, observation: e.target.value }))}
            />
          </div>

          <button
            onClick={addInstallment}
            disabled={!form.value || !form.dueDate}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 shadow-sm"
            style={{ background: "#8B6E52", color: "#FBF8F5" }}
          >
            Adicionar Parcela
          </button>
        </div>
      )}

      {/* Parcels List */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-10 rounded-2xl border" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
            <p className="text-xs font-medium" style={{ color: "#9B8578" }}>Nenhuma parcela registrada nesta categoria.</p>
          </div>
        )}
        {filtered.map(item => {
          const typeLabel = TYPES.find(t => t.value === item.type)?.label || item.type;
          const badgeStyle = TYPE_COLORS[item.type] || { bg: "#E8DDD4", text: "#4A3728" };
          const dateStr = item.dueDate ? new Date(item.dueDate + "T00:00:00").toLocaleDateString("pt-BR") : "";

          return (
            <div
              key={item.id}
              className="rounded-2xl border p-4 flex items-center gap-3 transition-all shadow-sm"
              style={{
                background: item.paid ? "#F0EDE8" : "#FBF8F5",
                borderColor: "#E8DDD4",
                opacity: item.paid ? 0.8 : 1,
              }}
            >
              {/* Checkbox for paid status */}
              <button
                onClick={() => togglePaid(item.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all"
                style={{
                  borderColor: item.paid ? "#8B6E52" : "#C4A882",
                  background: item.paid ? "#8B6E52" : "transparent",
                }}
                title={item.paid ? "Marcar como não paga" : "Marcar como paga"}
              >
                {item.paid && <Check size={18} color="#FBF8F5" />}
              </button>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: badgeStyle.bg, color: badgeStyle.text }}
                  >
                    {typeLabel}
                  </span>
                  {item.installmentNumber && (
                    <span className="text-[11px] font-semibold" style={{ color: "#8B6E52" }}>
                      Nº {item.installmentNumber}
                    </span>
                  )}
                </div>
                <p className="text-base font-bold" style={{ color: "#4A3728" }}>{fmt(item.value)}</p>
                <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "#9B8578" }}>
                  <span className="flex items-center gap-1"><Calendar size={11} /> Venc: {dateStr}</span>
                  {item.observation && <span className="truncate flex items-center gap-1">• <FileText size={11} /> {item.observation}</span>}
                </div>
              </div>

              {/* Actions & Status */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    background: item.paid ? "rgba(139, 110, 82, 0.15)" : "rgba(155, 133, 120, 0.15)",
                    color: item.paid ? "#8B6E52" : "#9B8578",
                  }}
                >
                  {item.paid ? "Paga" : "Pendente"}
                </span>
                <button
                  onClick={() => deleteInstallment(item.id)}
                  className="p-1 rounded-lg hover:bg-black/5"
                  title="Excluir parcela"
                >
                  <Trash2 size={15} color="#C4A882" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
