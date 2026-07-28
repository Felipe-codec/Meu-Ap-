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
import { UserCheck } from "lucide-react";

const TAB_TITLES = [
  "Meu Apê",
  "Financiamento",
  "Fornecedores & Serviços",
  "Materiais, Mobília & Enxoval",
  "Vistoria do Imóvel",
  "Lista de Mercado",
];

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [profile] = useStorage<UserProfile>(userId ? `apt_profile_${userId}` : "apt_profile_none", defaultProfile);

  if (!userId) {
    return <UserSelect onSelect={setUserId} />;
  }

  const handleLogout = () => {
    setUserId(null);
    setActiveTab(0);
  };

  return (
    <div className="min-h-screen bg-[#EFE8DF] flex justify-center items-center">
      {/* Mobile viewport container */}
      <div
        className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:h-[844px] sm:rounded-[36px] flex flex-col relative overflow-hidden shadow-2xl sm:border border-[#E8DDD4]"
        style={{ background: "#F5F0EB" }}
      >
        {/* Top Header */}
        <div
          className="sticky top-0 z-40 px-5 pt-8 pb-3 flex items-center justify-between shadow-xs"
          style={{ background: "#FBF8F5", borderBottom: "1px solid #E8DDD4" }}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "#8B6E52" }}>
              {activeTab === 0 ? "Painel de Controle" : "Aba Ativa"}
            </span>
            <h2 className="text-lg font-extrabold tracking-tight leading-tight" style={{ color: "#4A3728" }}>
              {TAB_TITLES[activeTab]}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all active:scale-95"
            style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
            title="Alternar perfil de usuária"
          >
            <UserCheck size={13} color="#8B6E52" />
            <span className="max-w-[70px] truncate">{profile.name || "Perfil"}</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 scrollbar-thin">
          {activeTab === 0 && (
            <HomeTab userId={userId} onTabChange={setActiveTab} onLogout={handleLogout} />
          )}
          {activeTab === 1 && <FinancingTab userId={userId} />}
          {activeTab === 2 && <SuppliersTab userId={userId} />}
          {activeTab === 3 && <MaterialsTab userId={userId} />}
          {activeTab === 4 && <InspectionTab userId={userId} />}
          {activeTab === 5 && <GroceryTab userId={userId} />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
