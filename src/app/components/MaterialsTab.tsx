import { useState, useRef } from "react";
import { Plus, X, Trash2, ExternalLink, ChevronDown, Image as ImageIcon, Store, Tag, Filter } from "lucide-react";
import { useStorage } from "./useStorage";
import type { Material } from "./types";

const STATUSES = [
  { value: "pendente", label: "Pendente", color: "#9B8578" },
  { value: "orcado", label: "Orçado", color: "#C4A882" },
  { value: "comprado", label: "Comprado", color: "#8B6E52" },
] as const;

const emptyForm = {
  name: "",
  storeContact: "",
  value: "",
  quantity: "1",
  model: "",
  link: "",
  image: "",
  status: "pendente" as Material["status"],
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props { userId: string }

export function MaterialsTab({ userId }: Props) {
  const [materials, setMaterials] = useStorage<Material[]>(`apt_materials_${userId}`, []);
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

  const isImageUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png") ||
      lower.includes(".webp") ||
      lower.includes(".gif") ||
      lower.startsWith("data:image/")
    );
  };

  const add = () => {
    if (!form.name) return;
    const item: Material = {
      id: Date.now().toString(),
      name: form.name,
      storeContact: form.storeContact,
      value: parseFloat(form.value) || 0,
      quantity: parseInt(form.quantity) || 1,
      model: form.model,
      link: form.link,
      image: form.image,
      status: form.status,
    };
    setMaterials(prev => [...prev, item]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const remove = (id: string) => setMaterials(prev => prev.filter(m => m.id !== id));

  const setStatus = (id: string, status: Material["status"]) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const filtered = filterStatus === "all" ? materials : materials.filter(m => m.status === filterStatus);

  const totalValue = materials.reduce((acc, m) => acc + m.value * m.quantity, 0);
  const boughtValue = materials.filter(m => m.status === "comprado").reduce((acc, m) => acc + m.value * m.quantity, 0);

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
          title="Cadastrar Material/Item"
        >
          <Plus size={18} color="#FBF8F5" />
        </button>
      </div>

      {/* Overview Totals */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1" style={{ color: "#9B8578" }}>Total Estimado</p>
          <p className="text-sm font-bold" style={{ color: "#4A3728" }}>{fmt(totalValue)}</p>
        </div>
        <div className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] mb-1" style={{ color: "#8B6E52" }}>Já Comprado</p>
          <p className="text-sm font-bold" style={{ color: "#8B6E52" }}>{fmt(boughtValue)}</p>
        </div>
      </div>

      {/* Counts by status */}
      <div className="grid grid-cols-3 gap-2">
        {STATUSES.map(s => {
          const count = materials.filter(m => m.status === s.value).length;
          return (
            <div key={s.value} className="rounded-2xl p-3 border text-center shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
              <p className="text-sm font-bold" style={{ color: s.color }}>{count}</p>
              <p className="text-[11px] font-medium" style={{ color: "#9B8578" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      {showForm && (
        <div className="rounded-3xl border p-5 flex flex-col gap-3.5 shadow-md" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#4A3728" }}>Novo Item de Enxoval / Mobília</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-black/5">
              <X size={16} color="#9B8578" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Nome do Item *</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="Ex: Geladeira Inverter 450L"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Contato da Loja</label>
              <input
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: Fast Shop / Vendedor"
                value={form.storeContact}
                onChange={e => setForm(f => ({ ...f, storeContact: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Modelo / Referência</label>
              <input
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: Inox 110V - Cód 459"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Valor Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="0,00"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Quantidade</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl px-3 py-3 text-sm border outline-none font-medium"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="1"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Link do Site / Rede Social</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="https://..."
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>URL da Foto / Imagem (Opcional)</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm border outline-none font-medium"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              placeholder="https://exemplo.com/foto.jpg"
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            />
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

          <button
            onClick={add}
            disabled={!form.name}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 shadow-sm"
            style={{ background: "#8B6E52", color: "#FBF8F5" }}
          >
            Adicionar Item
          </button>
        </div>
      )}

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 && (
          <div className="text-center py-10 rounded-2xl border" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
            <p className="text-xs font-medium" style={{ color: "#9B8578" }}>Nenhum item cadastrado nesta categoria.</p>
          </div>
        )}
        {filtered.map(item => {
          const total = item.value * item.quantity;
          const displayImage = item.image || (isImageUrl(item.link) ? item.link : null);

          return (
            <div key={item.id} className="rounded-2xl border p-4 shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
              <div className="flex items-start gap-3">
                {displayImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: "#E8DDD4" }}>
                    <img src={displayImage} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold truncate" style={{ color: "#4A3728" }}>{item.name}</h4>
                      {item.model && (
                        <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: "#8B6E52" }}>
                          <Tag size={11} /> {item.model}
                        </p>
                      )}
                    </div>
                    <button onClick={() => remove(item.id)} className="p-1 rounded-lg hover:bg-black/5">
                      <Trash2 size={15} color="#C4A882" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                    {item.value > 0 && (
                      <span className="font-semibold" style={{ color: "#4A3728" }}>
                        {fmt(item.value)} × {item.quantity} = <strong style={{ color: "#8B6E52" }}>{fmt(total)}</strong>
                      </span>
                    )}
                    {item.storeContact && (
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "#9B8578" }}>
                        <Store size={11} /> {item.storeContact}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t" style={{ borderColor: "#F5F0EB" }}>
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

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95"
                    style={{ borderColor: "#E8DDD4", background: "#F5F0EB" }}
                    title="Abrir link do produto"
                  >
                    <ExternalLink size={14} color="#8B6E52" />
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
