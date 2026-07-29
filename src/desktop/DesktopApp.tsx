import { useState } from "react";
import {
  Home,
  CreditCard,
  Users,
  Package,
  ClipboardCheck,
  ShoppingCart,
  UserCheck,
  FileSpreadsheet,
  Building2,
  Sparkles,
  LogOut,
  Plus,
  Check,
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  MessageCircle,
  ExternalLink,
  Tag,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";
import { useStorage } from "../app/components/useStorage";
import type { UserProfile, Installment, Supplier, Material, InspectionItem, GroceryItem } from "../app/components/types";
import { isWebPlatform } from "../app/services/googleSheetsService";
import { GoogleSheetsModal } from "../app/components/GoogleSheetsModal";
import { UserSelect } from "../app/components/UserSelect";

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

const NAV_ITEMS = [
  { id: 0, label: "Visão Geral", icon: Home, subtitle: "Painel Geral & Métricas do Apê" },
  { id: 1, label: "Financiamento", icon: CreditCard, subtitle: "Gestão de Parcelas & Vencimentos" },
  { id: 2, label: "Fornecedores", icon: Users, subtitle: "Contatos, Serviços & Orçamentos" },
  { id: 3, label: "Materiais & Enxoval", icon: Package, subtitle: "Lista de Compras & Mobília" },
  { id: 4, label: "Vistoria do Imóvel", icon: ClipboardCheck, subtitle: "Checklist de Entrega de Chaves" },
  { id: 5, label: "Lista de Mercado", icon: ShoppingCart, subtitle: "Planejamento de Compras de Mantimentos" },
];

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function DesktopApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState(0);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  const [profile] = useStorage<UserProfile>(userId ? `apt_profile_${userId}` : "apt_profile_none", defaultProfile);
  const [installments, setInstallments] = useStorage<Installment[]>(userId ? `apt_installments_${userId}` : "temp_inst", []);
  const [suppliers, setSuppliers] = useStorage<Supplier[]>(userId ? `apt_suppliers_${userId}` : "temp_supp", []);
  const [materials, setMaterials] = useStorage<Material[]>(userId ? `apt_materials_${userId}` : "temp_mat", []);
  const [inspectionItems, setInspectionItems] = useStorage<InspectionItem[]>(userId ? `apt_inspection_${userId}` : "temp_insp", []);
  const [groceryItems, setGroceryItems] = useStorage<GroceryItem[]>(userId ? `apt_grocery_${userId}` : "temp_groc", []);

  // Form states
  const [showInstForm, setShowInstForm] = useState(false);
  const [instForm, setInstForm] = useState({ type: "mensal" as Installment["type"], dueDate: "", value: "", installmentNumber: "", observation: "" });

  const [showSuppForm, setShowSuppForm] = useState(false);
  const [suppForm, setSuppForm] = useState({ name: "", contact: "", specialty: "", whatsappLink: "", value: "", status: "pendente" as Supplier["status"], observation: "" });

  const [showMatForm, setShowMatForm] = useState(false);
  const [matForm, setMatForm] = useState({ name: "", storeContact: "", value: "", quantity: "1", model: "", link: "", image: "", status: "pendente" as Material["status"] });

  const [showInspForm, setShowInspForm] = useState(false);
  const [inspForm, setInspForm] = useState({ category: "geral", description: "" });

  const [showGrocForm, setShowGrocForm] = useState(false);
  const [grocForm, setGrocForm] = useState({ name: "", quantity: "1", unitValue: "" });

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#EFE8DF] flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-[#F5F0EB] rounded-3xl shadow-2xl border border-[#E8DDD4] p-8">
          <UserSelect onSelect={setUserId} />
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    setUserId(null);
    setActiveNav(0);
  };

  // Calculations
  const totalPaid = installments.filter(i => i.paid).reduce((acc, i) => acc + i.value, 0);
  const totalFinancing = profile.totalFinancing || 0;
  const remainingFinancing = Math.max(0, totalFinancing - totalPaid);
  const paidPercent = totalFinancing > 0 ? Math.min(100, (totalPaid / totalFinancing) * 100) : 0;

  const totalSuppliersCost = suppliers.reduce((acc, s) => acc + (s.value || 0), 0);
  const totalMaterialsCost = materials.reduce((acc, m) => acc + (m.value * m.quantity || 0), 0);
  const groceryTotal = groceryItems.reduce((acc, g) => acc + (g.quantity * g.unitValue || 0), 0);

  return (
    <div className="min-h-screen bg-[#EFE8DF] flex font-sans text-[#4A3728]">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#FBF8F5] border-r border-[#E8DDD4] flex flex-col justify-between p-6 shrink-0 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E8DDD4]">
            <div className="w-12 h-12 rounded-2xl bg-[#4A3728] flex items-center justify-center text-[#FBF8F5] shadow-md relative">
              <Home size={24} />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C4A882] flex items-center justify-center">
                <Sparkles size={10} color="#4A3728" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none" style={{ color: "#4A3728" }}>
                Meu Apê
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8DDD4] text-[#8B6E52] mt-1 inline-block">
                Desktop Edition
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-[#E8DDD4] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#8B6E52] text-[#FBF8F5] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{profile.name || "Perfil"}</p>
                <p className="text-xs text-[#8B6E52] truncate font-medium">Apto {profile.apartmentNumber || "N/A"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-[#E8DDD4] bg-[#FBF8F5] hover:bg-[#E8DDD4] transition-colors"
              title="Trocar Usuário"
            >
              <LogOut size={16} color="#8B6E52" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 pt-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    active
                      ? "bg-[#8B6E52] text-[#FBF8F5] shadow-md translate-x-1"
                      : "text-[#6B584C] hover:bg-[#F5F0EB] hover:text-[#4A3728]"
                  }`}
                >
                  <Icon size={18} color={active ? "#FBF8F5" : "#8B6E52"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#E8DDD4]">
          {isWebPlatform() && (
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] text-[#166534] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:bg-[#DCFCE7]"
            >
              <FileSpreadsheet size={16} color="#34A853" />
              <span>Google Sheets Sync</span>
            </button>
          )}

          <p className="text-[11px] text-center text-[#9B8578]">
            Meu Apê © 2026 • Painel de Controle
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Bar */}
        <header className="sticky top-0 z-30 bg-[#FBF8F5] border-b border-[#E8DDD4] px-8 py-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B6E52]">
              {NAV_ITEMS[activeNav].label}
            </span>
            <h2 className="text-2xl font-black text-[#4A3728] tracking-tight">
              {NAV_ITEMS[activeNav].subtitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#F5F0EB] border border-[#E8DDD4] px-4 py-2 rounded-2xl flex items-center gap-3">
              <Building2 size={18} color="#8B6E52" />
              <div>
                <p className="text-[10px] text-[#9B8578] font-bold uppercase">Financiamento Total</p>
                <p className="text-sm font-extrabold text-[#4A3728]">{fmt(totalFinancing)}</p>
              </div>
            </div>

            <div className="bg-[#F5F0EB] border border-[#E8DDD4] px-4 py-2 rounded-2xl flex items-center gap-3">
              <Calendar size={18} color="#8B6E52" />
              <p className="text-xs font-bold text-[#4A3728]">
                {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" })}
              </p>
            </div>
          </div>
        </header>

        {/* View Router */}
        <div className="p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* TAB 0: DASHBOARD / VISÃO GERAL */}
          {activeNav === 0 && (
            <div className="flex flex-col gap-8">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#4A3728] text-[#FBF8F5] p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#C4A882] uppercase tracking-wider mb-1">Total Financiado</p>
                    <h3 className="text-2xl font-black">{fmt(totalFinancing)}</h3>
                  </div>
                  <p className="text-xs text-[#C4A882] mt-4 font-medium">Contrato Principal do Imóvel</p>
                </div>

                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#8B6E52] uppercase tracking-wider mb-1">Total Já Pago</p>
                    <h3 className="text-2xl font-black text-[#8B6E52]">{fmt(totalPaid)}</h3>
                  </div>
                  <p className="text-xs text-[#9B8578] mt-4 font-medium">{installments.filter(i => i.paid).length} parcelas quitadas</p>
                </div>

                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#9B8578] uppercase tracking-wider mb-1">Saldo Devedor</p>
                    <h3 className="text-2xl font-black text-[#4A3728]">{fmt(remainingFinancing)}</h3>
                  </div>
                  <p className="text-xs text-[#9B8578] mt-4 font-medium">Falta quitar do financiamento</p>
                </div>

                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-[#8B6E52] uppercase tracking-wider">Progresso</p>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#F5F0EB] text-[#8B6E52]">
                        {paidPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#E8DDD4] overflow-hidden my-2">
                      <div className="h-3 rounded-full bg-[#8B6E52] transition-all duration-500" style={{ width: `${paidPercent}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-[#9B8578] font-medium">Porcentagem total paga</p>
                </div>
              </div>

              {/* Module Summary Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fornecedores summary */}
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-[#4A3728] flex items-center gap-2">
                      <Users size={18} color="#8B6E52" /> Fornecedores &amp; Serviços
                    </h4>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F0EB] text-[#8B6E52]">
                      {suppliers.length} cadastrados
                    </span>
                  </div>
                  <p className="text-xs text-[#9B8578] mb-4">Total orçado/contratado em prestação de serviços:</p>
                  <h3 className="text-xl font-extrabold text-[#4A3728] mb-4">{fmt(totalSuppliersCost)}</h3>
                  <button
                    onClick={() => setActiveNav(2)}
                    className="w-full py-2.5 rounded-xl border border-[#E8DDD4] bg-[#F5F0EB] text-xs font-bold text-[#4A3728] hover:bg-[#8B6E52] hover:text-[#FBF8F5] transition-all"
                  >
                    Gerenciar Fornecedores →
                  </button>
                </div>

                {/* Materiais summary */}
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-[#4A3728] flex items-center gap-2">
                      <Package size={18} color="#8B6E52" /> Materiais &amp; Enxoval
                    </h4>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F0EB] text-[#8B6E52]">
                      {materials.length} itens
                    </span>
                  </div>
                  <p className="text-xs text-[#9B8578] mb-4">Investimento total em materiais e mobília:</p>
                  <h3 className="text-xl font-extrabold text-[#4A3728] mb-4">{fmt(totalMaterialsCost)}</h3>
                  <button
                    onClick={() => setActiveNav(3)}
                    className="w-full py-2.5 rounded-xl border border-[#E8DDD4] bg-[#F5F0EB] text-xs font-bold text-[#4A3728] hover:bg-[#8B6E52] hover:text-[#FBF8F5] transition-all"
                  >
                    Gerenciar Materiais →
                  </button>
                </div>

                {/* Vistoria summary */}
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-[#4A3728] flex items-center gap-2">
                      <ClipboardCheck size={18} color="#8B6E52" /> Vistoria do Imóvel
                    </h4>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F0EB] text-[#8B6E52]">
                      {inspectionItems.filter(i => i.checked).length}/{inspectionItems.length} verificados
                    </span>
                  </div>
                  <p className="text-xs text-[#9B8578] mb-4">Status de verificação do checklist de chaves:</p>
                  <h3 className="text-xl font-extrabold text-[#4A3728] mb-4">
                    {inspectionItems.length > 0
                      ? `${Math.round((inspectionItems.filter(i => i.checked).length / inspectionItems.length) * 100)}% Concluído`
                      : "Sem itens"}
                  </h3>
                  <button
                    onClick={() => setActiveNav(4)}
                    className="w-full py-2.5 rounded-xl border border-[#E8DDD4] bg-[#F5F0EB] text-xs font-bold text-[#4A3728] hover:bg-[#8B6E52] hover:text-[#FBF8F5] transition-all"
                  >
                    Abrir Vistoria →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: FINANCIAMENTO */}
          {activeNav === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[#FBF8F5] p-6 rounded-3xl border border-[#E8DDD4] shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">Gestão de Parcelas &amp; Financiamento</h3>
                  <p className="text-xs text-[#9B8578]">Cadastre e controle entradas, parcelas mensais, anuais e taxa de obra</p>
                </div>
                <button
                  onClick={() => setShowInstForm(!showInstForm)}
                  className="px-5 py-3 rounded-2xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={16} /> Nova Parcela
                </button>
              </div>

              {/* Form Modal / Panel */}
              {showInstForm && (
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-md flex flex-col gap-4">
                  <h4 className="text-sm font-bold">Cadastrar Nova Parcela</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold mb-1 block">Tipo</label>
                      <select
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs font-medium outline-none"
                        value={instForm.type}
                        onChange={e => setInstForm(f => ({ ...f, type: e.target.value as Installment["type"] }))}
                      >
                        <option value="entrada">Entrada</option>
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                        <option value="taxa_obra">Taxa de Obra</option>
                        <option value="financiamento">Financiamento</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Vencimento</label>
                      <input
                        type="date"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs font-medium outline-none"
                        value={instForm.dueDate}
                        onChange={e => setInstForm(f => ({ ...f, dueDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Valor (R$)</label>
                      <input
                        type="number"
                        placeholder="0,00"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs font-medium outline-none"
                        value={instForm.value}
                        onChange={e => setInstForm(f => ({ ...f, value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Nº Parcela</label>
                      <input
                        placeholder="Ex: 01/12"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs font-medium outline-none"
                        value={instForm.installmentNumber}
                        onChange={e => setInstForm(f => ({ ...f, installmentNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowInstForm(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#E8DDD4] text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!instForm.value || !instForm.dueDate) return;
                        setInstallments(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            type: instForm.type,
                            dueDate: instForm.dueDate,
                            value: parseFloat(instForm.value),
                            installmentNumber: instForm.installmentNumber,
                            observation: instForm.observation,
                            paid: false,
                          },
                        ]);
                        setShowInstForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold"
                    >
                      Salvar Parcela
                    </button>
                  </div>
                </div>
              )}

              {/* Installments Table */}
              <div className="bg-[#FBF8F5] border border-[#E8DDD4] rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F0EB] border-b border-[#E8DDD4] text-xs font-bold text-[#8B6E52]">
                      <th className="p-4">Status</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Nº Parcela</th>
                      <th className="p-4">Vencimento</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD4] text-xs font-medium">
                    {installments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#9B8578]">
                          Nenhuma parcela cadastrada até o momento.
                        </td>
                      </tr>
                    ) : (
                      installments.map(item => (
                        <tr key={item.id} className={item.paid ? "bg-[#F0EDE8]/50 text-[#9B8578]" : "hover:bg-[#F5F0EB]/50"}>
                          <td className="p-4">
                            <button
                              onClick={() => setInstallments(prev => prev.map(i => i.id === item.id ? { ...i, paid: !i.paid } : i))}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                                item.paid ? "bg-[#8B6E52] text-[#FBF8F5] border-[#8B6E52]" : "bg-[#F5F0EB] text-[#9B8578] border-[#E8DDD4]"
                              }`}
                            >
                              {item.paid && <Check size={12} />}
                              <span>{item.paid ? "Paga" : "Pendente"}</span>
                            </button>
                          </td>
                          <td className="p-4 font-bold capitalize">{item.type}</td>
                          <td className="p-4">{item.installmentNumber || "—"}</td>
                          <td className="p-4">{item.dueDate ? new Date(item.dueDate + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="p-4 font-extrabold text-[#4A3728]">{fmt(item.value)}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setInstallments(prev => prev.filter(i => i.id !== item.id))}
                              className="p-1.5 rounded-lg hover:bg-black/5 text-[#C4A882] hover:text-[#991B1B]"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FORNECEDORES */}
          {activeNav === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[#FBF8F5] p-6 rounded-3xl border border-[#E8DDD4] shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">Fornecedores &amp; Prestadores de Serviço</h3>
                  <p className="text-xs text-[#9B8578]">Guarde contatos de pedreiros, marceneiros, eletricistas e orçamentos</p>
                </div>
                <button
                  onClick={() => setShowSuppForm(!showSuppForm)}
                  className="px-5 py-3 rounded-2xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={16} /> Novo Fornecedor
                </button>
              </div>

              {showSuppForm && (
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-md flex flex-col gap-4">
                  <h4 className="text-sm font-bold">Cadastrar Fornecedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold mb-1 block">Nome *</label>
                      <input
                        placeholder="Ex: Marceneiro João"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={suppForm.name}
                        onChange={e => setSuppForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Especialidade</label>
                      <input
                        placeholder="Ex: Marcenaria / Cozinha"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={suppForm.specialty}
                        onChange={e => setSuppForm(f => ({ ...f, specialty: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Valor Orçado (R$)</label>
                      <input
                        type="number"
                        placeholder="0,00"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={suppForm.value}
                        onChange={e => setSuppForm(f => ({ ...f, value: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowSuppForm(false)} className="px-4 py-2.5 rounded-xl border border-[#E8DDD4] text-xs font-bold">
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!suppForm.name) return;
                        setSuppliers(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            name: suppForm.name,
                            contact: suppForm.contact,
                            specialty: suppForm.specialty,
                            whatsappLink: suppForm.whatsappLink,
                            value: parseFloat(suppForm.value) || 0,
                            status: suppForm.status,
                            observation: suppForm.observation,
                          },
                        ]);
                        setShowSuppForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold"
                    >
                      Salvar Fornecedor
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Supplier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#FBF8F5] rounded-3xl border border-[#E8DDD4] text-[#9B8578] text-xs">
                    Nenhum fornecedor registrado ainda.
                  </div>
                ) : (
                  suppliers.map(s => (
                    <div key={s.id} className="bg-[#FBF8F5] border border-[#E8DDD4] p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-base font-bold text-[#4A3728]">{s.name}</h4>
                            <p className="text-xs text-[#8B6E52] font-semibold">{s.specialty || "Serviço Geral"}</p>
                          </div>
                          <button onClick={() => setSuppliers(prev => prev.filter(item => item.id !== s.id))} className="p-1 text-[#C4A882] hover:text-[#991B1B]">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-lg font-extrabold text-[#4A3728] mb-2">{s.value > 0 ? fmt(s.value) : "Sem orçamento"}</p>
                      </div>

                      <div className="pt-3 border-t border-[#E8DDD4] flex items-center justify-between mt-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#F5F0EB] text-[#8B6E52]">
                          {s.status}
                        </span>
                        {s.contact && (
                          <span className="text-xs text-[#9B8578] font-medium">{s.contact}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MATERIAIS */}
          {activeNav === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[#FBF8F5] p-6 rounded-3xl border border-[#E8DDD4] shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">Materiais, Mobília &amp; Enxoval</h3>
                  <p className="text-xs text-[#9B8578]">Planeje e registre as compras para o novo apartamento</p>
                </div>
                <button
                  onClick={() => setShowMatForm(!showMatForm)}
                  className="px-5 py-3 rounded-2xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={16} /> Novo Material
                </button>
              </div>

              {showMatForm && (
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-md flex flex-col gap-4">
                  <h4 className="text-sm font-bold">Cadastrar Material</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold mb-1 block">Nome do Item *</label>
                      <input
                        placeholder="Ex: Torneira Monocomando"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={matForm.name}
                        onChange={e => setMatForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Valor Unitário (R$)</label>
                      <input
                        type="number"
                        placeholder="0,00"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={matForm.value}
                        onChange={e => setMatForm(f => ({ ...f, value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Quantidade</label>
                      <input
                        type="number"
                        placeholder="1"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={matForm.quantity}
                        onChange={e => setMatForm(f => ({ ...f, quantity: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowMatForm(false)} className="px-4 py-2.5 rounded-xl border border-[#E8DDD4] text-xs font-bold">
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!matForm.name) return;
                        setMaterials(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            name: matForm.name,
                            storeContact: matForm.storeContact,
                            value: parseFloat(matForm.value) || 0,
                            quantity: parseInt(matForm.quantity) || 1,
                            model: matForm.model,
                            link: matForm.link,
                            image: matForm.image,
                            status: matForm.status,
                          },
                        ]);
                        setShowMatForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold"
                    >
                      Salvar Material
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Materials */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#FBF8F5] rounded-3xl border border-[#E8DDD4] text-[#9B8578] text-xs">
                    Nenhum material ou mobília cadastrado.
                  </div>
                ) : (
                  materials.map(m => (
                    <div key={m.id} className="bg-[#FBF8F5] border border-[#E8DDD4] p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#4A3728]">{m.name}</h4>
                          <button onClick={() => setMaterials(prev => prev.filter(item => item.id !== m.id))} className="p-1 text-[#C4A882] hover:text-[#991B1B]">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-[#9B8578] mb-3">{m.quantity}x {fmt(m.value)} cada</p>
                        <p className="text-lg font-extrabold text-[#8B6E52]">{fmt(m.value * m.quantity)} Total</p>
                      </div>

                      <div className="pt-3 border-t border-[#E8DDD4] flex items-center justify-between mt-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#F5F0EB] text-[#8B6E52]">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VISTORIA */}
          {activeNav === 4 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[#FBF8F5] p-6 rounded-3xl border border-[#E8DDD4] shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">Vistoria &amp; Entrega de Chaves</h3>
                  <p className="text-xs text-[#9B8578]">Checklist completo de inspeção do imóvel (azulejos, tomadas, pintura, portas)</p>
                </div>
                <button
                  onClick={() => setShowInspForm(!showInspForm)}
                  className="px-5 py-3 rounded-2xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={16} /> Novo Item de Vistoria
                </button>
              </div>

              {showInspForm && (
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-md flex flex-col gap-4">
                  <h4 className="text-sm font-bold">Cadastrar Item de Vistoria</h4>
                  <div>
                    <label className="text-xs font-bold mb-1 block">Descrição do Ponto a Checar *</label>
                    <input
                      placeholder="Ex: Testar vazamento da torneira da cozinha"
                      className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                      value={inspForm.description}
                      onChange={e => setInspForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowInspForm(false)} className="px-4 py-2.5 rounded-xl border border-[#E8DDD4] text-xs font-bold">
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!inspForm.description) return;
                        setInspectionItems(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            category: inspForm.category as any,
                            description: inspForm.description,
                            checked: false,
                          },
                        ]);
                        setShowInspForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold"
                    >
                      Salvar Item
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inspectionItems.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#FBF8F5] rounded-3xl border border-[#E8DDD4] text-[#9B8578] text-xs">
                    Nenhum item de vistoria cadastrado.
                  </div>
                ) : (
                  inspectionItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        item.checked ? "bg-[#F0EDE8] border-[#E8DDD4] opacity-75" : "bg-[#FBF8F5] border-[#E8DDD4]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setInspectionItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                            item.checked ? "bg-[#8B6E52] border-[#8B6E52] text-[#FBF8F5]" : "border-[#C4A882]"
                          }`}
                        >
                          {item.checked && <Check size={14} />}
                        </button>
                        <p className={`text-xs font-medium truncate ${item.checked ? "line-through text-[#9B8578]" : "text-[#4A3728]"}`}>
                          {item.description}
                        </p>
                      </div>
                      <button onClick={() => setInspectionItems(prev => prev.filter(i => i.id !== item.id))} className="p-1 text-[#C4A882] hover:text-[#991B1B]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MERCADO */}
          {activeNav === 5 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[#FBF8F5] p-6 rounded-3xl border border-[#E8DDD4] shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">Lista de Mercado</h3>
                  <p className="text-xs text-[#9B8578]">Planejamento e controle de compras de mantimentos para o lar</p>
                </div>
                <button
                  onClick={() => setShowGrocForm(!showGrocForm)}
                  className="px-5 py-3 rounded-2xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#4A3728] transition-all"
                >
                  <Plus size={16} /> Novo Produto
                </button>
              </div>

              {showGrocForm && (
                <div className="bg-[#FBF8F5] border border-[#E8DDD4] p-6 rounded-3xl shadow-md flex flex-col gap-4">
                  <h4 className="text-sm font-bold">Cadastrar Produto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold mb-1 block">Nome *</label>
                      <input
                        placeholder="Ex: Arroz 5kg"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={grocForm.name}
                        onChange={e => setGrocForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Quantidade</label>
                      <input
                        type="number"
                        placeholder="1"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={grocForm.quantity}
                        onChange={e => setGrocForm(f => ({ ...f, quantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Valor Unitário (R$)</label>
                      <input
                        type="number"
                        placeholder="0,00"
                        className="w-full p-3 rounded-xl bg-[#F5F0EB] border border-[#E8DDD4] text-xs outline-none"
                        value={grocForm.unitValue}
                        onChange={e => setGrocForm(f => ({ ...f, unitValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowGrocForm(false)} className="px-4 py-2.5 rounded-xl border border-[#E8DDD4] text-xs font-bold">
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!grocForm.name) return;
                        setGroceryItems(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            name: grocForm.name,
                            quantity: parseFloat(grocForm.quantity) || 1,
                            unitValue: parseFloat(grocForm.unitValue) || 0,
                            checked: false,
                          },
                        ]);
                        setShowGrocForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B6E52] text-[#FBF8F5] text-xs font-bold"
                    >
                      Salvar Produto
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groceryItems.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#FBF8F5] rounded-3xl border border-[#E8DDD4] text-[#9B8578] text-xs">
                    Nenhum produto cadastrado na lista de mercado.
                  </div>
                ) : (
                  groceryItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        item.checked ? "bg-[#F0EDE8] border-[#E8DDD4] opacity-75" : "bg-[#FBF8F5] border-[#E8DDD4]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setGroceryItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                            item.checked ? "bg-[#8B6E52] border-[#8B6E52] text-[#FBF8F5]" : "border-[#C4A882]"
                          }`}
                        >
                          {item.checked && <Check size={14} />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${item.checked ? "line-through text-[#9B8578]" : "text-[#4A3728]"}`}>
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#9B8578]">
                            {item.quantity}x {fmt(item.unitValue)} = <strong className="text-[#8B6E52]">{fmt(item.quantity * item.unitValue)}</strong>
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setGroceryItems(prev => prev.filter(i => i.id !== item.id))} className="p-1 text-[#C4A882] hover:text-[#991B1B]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Google Sheets Modal */}
      <GoogleSheetsModal isOpen={isSheetsModalOpen} onClose={() => setIsSheetsModalOpen(false)} />
    </div>
  );
}
