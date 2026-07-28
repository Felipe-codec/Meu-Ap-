import { useState } from "react";
import { UserSelect } from "./components/UserSelect";
import { HomeTab } from "./components/HomeTab";
import { FinancingTab } from "./components/FinancingTab";
import { SuppliersTab } from "./components/SuppliersTab";
import { MaterialsTab } from "./components/MaterialsTab";
import { InspectionTab } from "./components/InspectionTab";
import { GroceryTab } from "./components/GroceryTab";
import { BottomNav } from "./components/BottomNav";
import { useStorage } from "./components/useStorage";
import type { UserProfile } from "./components/types";
import { UserCheck, FileSpreadsheet, Home, CreditCard, Users, Package, ClipboardCheck, ShoppingCart } from "lucide-react";
import { isWebPlatform } from "./services/googleSheetsService";
import { GoogleSheetsModal } from "./components/GoogleSheetsModal";

const TAB_TITLES = [
  "Meu Apê",
  "Financiamento",
  "Fornecedores & Serviços",
  "Materiais, Mobília & Enxoval",
  "Vistoria do Imóvel",
  "Lista de Mercado",
];

const TABS = [
  { icon: Home, label: "Início", index: 0 },
  { icon: CreditCard, label: "Financiamento", index: 1 },
  { icon: Users, label: "Fornecedores", index: 2 },
  { icon: Package, label: "Materiais", index: 3 },
  { icon: ClipboardCheck, label: "Vistoria", index: 4 },
  { icon: ShoppingCart, label: "Mercado", index: 5 },
];

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [profile] = useStorage<UserProfile>(userId ? `apt_profile_${userId}` : "apt_profile_none", defaultProfile);

  if (!userId) {
    return <UserSelect onSelect={setUserId} />;
  }

  const handleLogout = () => {
    setUserId(null);
    setActiveTab(0);
  };

  return (
    <div className="min-h-screen bg-[#EFE8DF] flex justify-center items-center md:py-6 md:px-6">
      {/* Desktop & Mobile responsive container */}
      <div
        className="w-full max-w-6xl min-h-screen md:min-h-[860px] md:rounded-[32px] flex flex-col relative overflow-hidden shadow-2xl md:border border-[#E8DDD4]"
        style={{ background: "#F5F0EB" }}
      >
        {/* Top Header */}
        <div
          className="sticky top-0 z-40 px-5 md:px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between shadow-xs gap-4"
          style={{ background: "#FBF8F5", borderBottom: "1px solid #E8DDD4" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "#8B6E52" }}>
                {activeTab === 0 ? "Painel de Controle" : "Aba Ativa"}
              </span>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight leading-tight" style={{ color: "#4A3728" }}>
                {TAB_TITLES[activeTab]}
              </h2>
            </div>

            {/* Mobile-only action buttons */}
            <div className="flex items-center gap-2 md:hidden">
              {isWebPlatform() && (
                <button
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="p-2 rounded-full border shadow-xs transition-all active:scale-95 flex items-center justify-center"
                  style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#34A853" }}
                  title="Configurar Google Sheets"
                >
                  <FileSpreadsheet size={16} />
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all active:scale-95"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              >
                <UserCheck size={13} color="#8B6E52" />
                <span className="max-w-[70px] truncate">{profile.name || "Perfil"}</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs Header */}
          <div className="hidden md:flex items-center gap-1 bg-[#F5F0EB] p-1.5 rounded-2xl border border-[#E8DDD4]">
            {TABS.map(({ icon: Icon, label, index }) => {
              const active = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: active ? "#8B6E52" : "transparent",
                    color: active ? "#FBF8F5" : "#6B584C",
                  }}
                >
                  <Icon size={16} color={active ? "#FBF8F5" : "#8B6E52"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isWebPlatform() && (
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold shadow-xs transition-all active:scale-95"
                style={{ background: "#F0FDF4", borderColor: "#86EFAC", color: "#166534" }}
                title="Configurar Google Sheets (Banco de Dados Web)"
              >
                <FileSpreadsheet size={16} color="#34A853" />
                <span>Google Sheets</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border shadow-xs transition-all active:scale-95"
              style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              title="Alternar perfil de usuária"
            >
              <UserCheck size={15} color="#8B6E52" />
              <span>{profile.name || "Perfil"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-24 md:pb-8 scrollbar-thin">
          <div className="w-full max-w-5xl mx-auto">
            {activeTab === 0 && (
              <HomeTab userId={userId} onTabChange={setActiveTab} onLogout={handleLogout} />
            )}
            {activeTab === 1 && <FinancingTab userId={userId} />}
            {activeTab === 2 && <SuppliersTab userId={userId} />}
            {activeTab === 3 && <MaterialsTab userId={userId} />}
            {activeTab === 4 && <InspectionTab userId={userId} />}
            {activeTab === 5 && <GroceryTab userId={userId} />}
          </div>
        </div>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Google Sheets Config Modal */}
      <GoogleSheetsModal isOpen={isSheetsModalOpen} onClose={() => setIsSheetsModalOpen(false)} />
    </div>
  );
}
