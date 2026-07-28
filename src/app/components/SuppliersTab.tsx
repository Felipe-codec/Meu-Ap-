import { useState, useRef } from "react";
import { Plus, X, Trash2, MessageCircle, ChevronDown, Phone, Briefcase, Filter } from "lucide-react";
import { useStorage } from "./useStorage";
import type { Supplier } from "./types";

const STATUSES = [
  { value: "pendente", label: "Pendente", color: "#9B8578", bg: "#F5F0EB" },
  { value: "orcado", label: "Orçado", color: "#C4A882", bg: "#EFE8DF" },
  { value: "contratado", label: "Contratado", color: "#8B6E52", bg: "#E8DDD4" },
] as const;

const SPECIALTIES = [
  "Eletricista",
  "Pedreiro",
  "Pintor",
  "Encanador",
  "Marceneiro",
  "Serralheiro",
  "Gesseiro / Gesso",
  "Azulejista",
  "Arquiteto / Interior",
  "Vidraceiro",
  "Limpeza Pós-Obra",
  "Fretrete / Mudança",
  "Outro",
];

const emptyForm = {
  name: "",
  contact: "",
  specialty: "",
  whatsappLink: "",
  value: "",
  status: "pendente" as Supplier["status"],
  observation: "",
};

const fmt = (v: number) => v > 0 ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

interface Props { userId: string }

export function SuppliersTab({ userId }: Props) {
  const [suppliers, setSuppliers] = useStorage<Supplier[]>(`apt_suppliers_${userId}`, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");

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

  const buildWhatsappUrl = (linkOrPhone: string) => {
    if (!linkOrPhone) return "";
    if (linkOrPhone.startsWith("http://") || linkOrPhone.startsWith("https://")) {
      return linkOrPhone;
    }
    const digits = linkOrPhone.replace(/\D/g, "");
    if (!digits) return "";
    const phoneWithCountry = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${phoneWithCountry}`;
  };

  const add = () => {
    if (!form.name) return;
    const finalWa = buildWhatsappUrl(form.whatsappLink || form.contact);
    const item: Supplier = {
      id: Date.now().toString(),
      name: form.name,
      contact: form.contact,
      specialty: form.specialty,
      whatsappLink: finalWa,
      value: parseFloat(form.value) || 0,
      status: form.status,
      observation: form.observation,
    };
    setSuppliers(prev => [...prev, item]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const remove = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  const setStatus = (id: string, status: Supplier["status"]) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const filtered = filterStatus === "all" ? suppliers : suppliers.filter(s => s.status === filterStatus);

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
          {[{ value: "all", label: "Todos" }, ...STATUSES].map(s => (
            <button
              key={s.value}
              onClick={() => {
                if (!hasMoved) {
                  setFilterStatus(s.value);
                }
              }}
              className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all border flex-shrink-0"
              style={{
                background: filterStatus === s.value ? "#8B6E52" : "#FBF8F5",
                color: filterStatus === s.value ? "#FBF8F5" : "#6B584C",
                borderColor: filterStatus === s.value ? "#8B6E52" : "#E8DDD4",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-all active:scale-95 flex-shrink-0"
          style={{ background: "#8B6E52", borderColor: "#8B6E52" }}
          title="Cadastrar Fornecedor"
        >
          <Plus size={18} color="#FBF8F5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {STATUSES.map(s => {
          const count = suppliers.filter(sup => sup.status === s.value).length;
          return (
            <div key={s.value} className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
              <p className="text-sm font-bold" style={{ color: s.color }}>{count}</p>
              <p className="text-[11px] font-medium" style={{ color: "#9B8578" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-3xl border p-5 flex flex-col gap-3.5 shadow-md" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#4A3728" }}>Novo Fornecedor</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-black/5">
              <X size={16} color="#9B8578" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Nome do Prestador / Empresa *</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Carlos Eletricista"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Contato / Telefone</label>
              <input
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="(11) 99999-9999"
                value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Valor Orçado (R$)</label>
              <input
                type="number"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="0,00"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Link / Número do WhatsApp</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: (11) 99999-9999 ou https://wa.me/..."
              value={form.whatsappLink}
              onChange={e => setForm(f => ({ ...f, whatsappLink: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Especialidade</label>
            <div className="relative">
              <select
                className="w-full rounded-2xl px-4 py-3 text-sm border outline-none appearance-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                value={form.specialty}
                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
              >
                <option value="">Selecionar especialidade...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} color="#9B8578" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#4A3728" }}>Status</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: s.value }))}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: form.status === s.value ? s.color : "#F5F0EB",
                    color: form.status === s.value ? "#FBF8F5" : "#9B8578",
                    borderColor: form.status === s.value ? s.color : "#E8DDD4",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Observação</label>
            <textarea
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none resize-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Recomendado por amigo, orçamento inclui material..."
              rows={2}
              value={form.observation}
              onChange={e => setForm(f => ({ ...f, observation: e.target.value }))}
            />
          </div>

          <button
            onClick={add}
            disabled={!form.name}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 shadow-sm"
            style={{ background: "#8B6E52", color: "#FBF8F5" }}
          >
            Adicionar Fornecedor
          </button>
        </div>
      )}

      {/* Supplier List */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-10 rounded-2xl border" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
            <p className="text-xs font-medium" style={{ color: "#9B8578" }}>Nenhum fornecedor registrado nesta categoria.</p>
          </div>
        )}
        {filtered.map(item => {
          const waUrl = item.whatsappLink || buildWhatsappUrl(item.contact);
          return (
            <div key={item.id} className="rounded-2xl border p-4 shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold truncate" style={{ color: "#4A3728" }}>{item.name}</h4>
                  {item.specialty && (
                    <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: "#8B6E52" }}>
                      <Briefcase size={12} /> {item.specialty}
                    </p>
                  )}
                </div>
                <button onClick={() => remove(item.id)} className="p-1 rounded-lg hover:bg-black/5">
                  <Trash2 size={15} color="#C4A882" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                {item.value > 0 && (
                  <span className="font-bold px-2.5 py-1 rounded-full" style={{ background: "#F5F0EB", color: "#4A3728" }}>
                    {fmt(item.value)}
                  </span>
                )}
                {item.contact && (
                  <span className="flex items-center gap-1 font-medium" style={{ color: "#9B8578" }}>
                    <Phone size={12} /> {item.contact}
                  </span>
                )}
                {item.observation && (
                  <p className="w-full text-xs mt-1" style={{ color: "#9B8578" }}>
                    <strong>Obs:</strong> {item.observation}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "#F5F0EB" }}>
                <div className="flex gap-1.5">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(item.id, s.value)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all"
                      style={{
                        background: item.status === s.value ? s.color : "#F5F0EB",
                        color: item.status === s.value ? "#FBF8F5" : "#9B8578",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95"
                    style={{ background: "#25D366", color: "#FFFFFF" }}
                  >
                    <MessageCircle size={14} color="#FFFFFF" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
