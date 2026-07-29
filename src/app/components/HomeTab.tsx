import { useState } from "react";
import { Home as HomeIcon, CreditCard, Users, Package, ClipboardCheck, ShoppingCart, LogOut, Building2, Smartphone, ChevronRight } from "lucide-react";
import { useStorage } from "./useStorage";
import type { UserProfile, Installment } from "./types";
import { ApkGuideModal } from "./ApkGuideModal";

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

const tabInfo = [
  { icon: CreditCard, label: "Financiamento", tab: 1, color: "#8B6E52" },
  { icon: Users, label: "Fornecedores", tab: 2, color: "#4A3728" },
  { icon: Package, label: "Materiais", tab: 3, color: "#A0856A" },
  { icon: ClipboardCheck, label: "Vistoria", tab: 4, color: "#6B4F3A" },
  { icon: ShoppingCart, label: "Mercado", tab: 5, color: "#C4A882" },
];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  userId: string;
  onTabChange: (tab: number) => void;
  onLogout: () => void;
}

export function HomeTab({ userId, onTabChange, onLogout }: Props) {
  const [profile] = useStorage<UserProfile>(`apt_profile_${userId}`, defaultProfile);
  const [installments] = useStorage<Installment[]>(`apt_installments_${userId}`, []);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  const totalPaid = installments.filter(i => i.paid).reduce((acc, i) => acc + i.value, 0);
  const totalFinancing = profile.totalFinancing || 0;
  const remaining = Math.max(0, totalFinancing - totalPaid);
  const paidPercent = totalFinancing > 0 ? Math.min(100, (totalPaid / totalFinancing) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Top Section Grid for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Header card with Apartment Badge */}
        <div className="rounded-3xl p-6 relative overflow-hidden shadow-md flex flex-col justify-between" style={{ background: "#4A3728" }}>
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full opacity-10" style={{ background: "#C4A882", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#C4A882", transform: "translate(-30%, 30%)" }} />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "#C4A882" }}>
                <Building2 size={24} color="#4A3728" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#C4A882" }}>
                  Meu Apartamento
                </p>
                <h3 className="text-lg font-bold" style={{ color: "#FBF8F5" }}>
                  {profile.name || "Morador(a)"}
                </h3>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Alternar Perfil"
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
            >
              <LogOut size={16} color="#C4A882" />
            </button>
          </div>

          <div className="relative z-10">
            <p className="text-xs mb-0.5" style={{ color: "#C4A882" }}>Apartamento Nº</p>
            <p className="text-3xl font-extrabold mb-4 tracking-tight" style={{ color: "#FBF8F5" }}>
              {profile.apartmentNumber ? `Apto ${profile.apartmentNumber}` : "Não informado"}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3.5 border backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-[11px] mb-1" style={{ color: "#C4A882" }}>Total pago</p>
                <p className="text-base font-bold" style={{ color: "#FBF8F5" }}>{fmt(totalPaid)}</p>
              </div>
              <div className="rounded-2xl p-3.5 border backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-[11px] mb-1" style={{ color: "#C4A882" }}>Falta pagar</p>
                <p className="text-base font-bold" style={{ color: "#FBF8F5" }}>{fmt(remaining)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card & APK Banner */}
        <div className="flex flex-col gap-5 justify-between">
          <div className="rounded-3xl p-6 border shadow-sm flex-1 flex flex-col justify-between" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold" style={{ color: "#4A3728" }}>Resumo do Financiamento</p>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#F5F0EB", color: "#8B6E52" }}>
                  {paidPercent.toFixed(1)}% Quitado
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full mb-4 overflow-hidden" style={{ background: "#E8DDD4" }}>
                <div
                  className="h-3.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${paidPercent}%`, background: "#8B6E52" }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E8DDD4]">
              <div>
                <p className="text-[11px]" style={{ color: "#9B8578" }}>Valor total financiado</p>
                <p className="font-extrabold text-base" style={{ color: "#4A3728" }}>{fmt(totalFinancing)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ color: "#9B8578" }}>Parcelas quitadas</p>
                <p className="font-extrabold text-base" style={{ color: "#8B6E52" }}>
                  {installments.filter(i => i.paid).length} <span className="font-normal text-xs" style={{ color: "#9B8578" }}>de {installments.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* APK Banner */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="w-full rounded-2xl p-4 border flex items-center justify-between transition-all active:scale-[0.99] shadow-xs"
            style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs" style={{ background: "#8B6E52" }}>
                <Smartphone size={20} color="#FBF8F5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold" style={{ color: "#4A3728" }}>Usar no Celular / Gerar APK</p>
                <p className="text-[11px]" style={{ color: "#9B8578" }}>Aprenda a instalar no Android de graça</p>
              </div>
            </div>
            <ChevronRight size={18} color="#8B6E52" />
          </button>
        </div>
      </div>

      {/* Quick Access Icons */}
      <div className="pt-2">
        <p className="text-xs font-extrabold uppercase tracking-wider mb-4 px-1" style={{ color: "#8B6E52" }}>
          Menu Principal de Navegação
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {tabInfo.map(({ icon: Icon, label, tab, color }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs" style={{ background: "#F5F0EB" }}>
                <Icon size={22} color={color} />
              </div>
              <p className="text-xs font-bold text-center leading-tight" style={{ color: "#4A3728" }}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* APK Guide Modal */}
      <ApkGuideModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
    </div>
  );
}
