import { useState } from "react";
import { Home, KeyRound, Sparkles, UserCheck, Edit3, Lock } from "lucide-react";
import { useStorage } from "./useStorage";
import type { UserProfile } from "./types";

interface Props {
  onSelect: (userId: string) => void;
}

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

export function UserSelect({ onSelect }: Props) {
  const [profile1, setProfile1] = useStorage<UserProfile>("apt_profile_user1", defaultProfile);
  const [profile2, setProfile2] = useStorage<UserProfile>("apt_profile_user2", defaultProfile);
  const [setupMode, setSetupMode] = useState<"user1" | "user2" | null>(null);
  const [form, setForm] = useState({ name: "", apartmentNumber: "", totalFinancing: "" });

  const profiles = { user1: profile1, user2: profile2 };
  const setProfiles = { user1: setProfile1, user2: setProfile2 };

  const handleSetup = (userId: "user1" | "user2") => {
    const p = profiles[userId];
    setForm({
      name: p.name,
      apartmentNumber: p.apartmentNumber,
      totalFinancing: p.totalFinancing ? String(p.totalFinancing) : "",
    });
    setSetupMode(userId);
  };

  const handleSave = () => {
    if (!setupMode) return;
    setProfiles[setupMode]({
      name: form.name.trim(),
      apartmentNumber: form.apartmentNumber.trim(),
      totalFinancing: parseFloat(form.totalFinancing) || 0,
    });
    setSetupMode(null);
  };

  if (setupMode) {
    const label = setupMode === "user1" ? "Perfil 1" : "Perfil 2";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ background: "#F5F0EB" }}>
        <div className="w-full max-w-sm rounded-3xl p-6 border shadow-sm" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <button
            onClick={() => setSetupMode(null)}
            className="mb-4 text-xs flex items-center gap-1 font-medium px-3 py-1.5 rounded-xl"
            style={{ background: "#F5F0EB", color: "#8B6E52" }}
          >
            ← Voltar
          </button>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#4A3728" }}>Configurar {label}</h2>
          <p className="text-xs mb-6" style={{ color: "#9B8578" }}>Preencha suas informações pessoais de acesso</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Seu nome *</label>
              <input
                className="w-full rounded-2xl px-4 py-3 text-sm border outline-none transition-all focus:ring-2 focus:ring-[#8B6E52]/20"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: Maria Clara"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Nº do apartamento *</label>
              <input
                className="w-full rounded-2xl px-4 py-3 text-sm border outline-none transition-all focus:ring-2 focus:ring-[#8B6E52]/20"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: 504 - Bloco B"
                value={form.apartmentNumber}
                onChange={e => setForm(f => ({ ...f, apartmentNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "#4A3728" }}>Valor total do financiamento (R$)</label>
              <input
                className="w-full rounded-2xl px-4 py-3 text-sm border outline-none transition-all focus:ring-2 focus:ring-[#8B6E52]/20"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                placeholder="Ex: 280000"
                type="number"
                value={form.totalFinancing}
                onChange={e => setForm(f => ({ ...f, totalFinancing: e.target.value }))}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.apartmentNumber.trim()}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2 shadow-sm disabled:opacity-40 transition-all active:scale-[0.99]"
              style={{ background: "#8B6E52", color: "#FBF8F5" }}
            >
              Salvar e continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ background: "#F5F0EB" }}>
      <div className="w-full max-w-sm">
        {/* Header icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-md relative" style={{ background: "#4A3728" }}>
            <Home size={36} color="#FBF8F5" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#C4A882" }}>
              <Sparkles size={12} color="#4A3728" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#4A3728" }}>Meu Apê</h1>
          <p className="text-xs text-center mt-1 font-medium" style={{ color: "#9B8578" }}>
            Centralizador de Financiamento & Gestão
          </p>
        </div>

        <div className="rounded-3xl p-5 border shadow-sm mb-6" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-xs font-semibold text-center mb-4 uppercase tracking-wider" style={{ color: "#8B6E52" }}>
            Selecione quem vai usar
          </p>

          <div className="flex flex-col gap-3">
            {(["user1", "user2"] as const).map((uid, i) => {
              const p = profiles[uid];
              const hasProfile = !!p.name;
              return (
                <div
                  key={uid}
                  className="rounded-2xl border p-4 transition-all"
                  style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ background: hasProfile ? "#8B6E52" : "#E8DDD4" }}
                      >
                        {hasProfile ? (
                          <UserCheck size={18} color="#FBF8F5" />
                        ) : (
                          <KeyRound size={18} color="#9B8578" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#4A3728" }}>
                          {hasProfile ? p.name : `Perfil ${i + 1}`}
                        </p>
                        {hasProfile ? (
                          <p className="text-xs truncate font-medium" style={{ color: "#8B6E52" }}>
                            Apê {p.apartmentNumber}
                          </p>
                        ) : (
                          <p className="text-[11px]" style={{ color: "#9B8578" }}>
                            Não configurado
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSetup(uid)}
                        className="text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1"
                        style={{ borderColor: "#E8DDD4", background: "#FBF8F5", color: "#6B584C" }}
                      >
                        <Edit3 size={12} />
                        {hasProfile ? "Editar" : "Criar"}
                      </button>
                      {hasProfile && (
                        <button
                          onClick={() => onSelect(uid)}
                          className="text-xs px-3.5 py-1.5 rounded-xl font-semibold shadow-sm transition-transform active:scale-95"
                          style={{ background: "#4A3728", color: "#FBF8F5" }}
                        >
                          Entrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-3 border text-center" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-[11px] font-medium leading-relaxed" style={{ color: "#8B6E52" }}>
            <span className="inline-flex items-center gap-1.5"><Lock size={12} color="#8B6E52" /> <strong>Privacidade Total:</strong></span> Cada perfil mantém dados privados e independentes salvos com segurança no dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}
