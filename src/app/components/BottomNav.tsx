import { Home, CreditCard, Users, Package, ClipboardCheck, ShoppingCart } from "lucide-react";

const TABS = [
  { icon: Home, label: "Início", index: 0 },
  { icon: CreditCard, label: "Financ.", index: 1 },
  { icon: Users, label: "Fornec.", index: 2 },
  { icon: Package, label: "Materiais", index: 3 },
  { icon: ClipboardCheck, label: "Vistoria", index: 4 },
  { icon: ShoppingCart, label: "Mercado", index: 5 },
];

interface Props {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 shadow-lg"
      style={{ background: "#FBF8F5", borderTop: "1px solid #E8DDD4" }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {TABS.map(({ icon: Icon, label, index }) => {
          const active = activeTab === index;
          return (
            <button
              key={index}
              onClick={() => onTabChange(index)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl flex-1 transition-all active:scale-95"
              style={{
                background: active ? "#F5F0EB" : "transparent",
              }}
            >
              <Icon size={19} color={active ? "#4A3728" : "#9B8578"} />
              <span
                className="text-[10px]"
                style={{
                  color: active ? "#4A3728" : "#9B8578",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
