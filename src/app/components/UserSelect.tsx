import { useState } from "react";
import { Home, KeyRound, Sparkles, UserCheck, Edit3, Lock, FileSpreadsheet } from "lucide-react";
import { useStorage } from "./useStorage";
import type { UserProfile } from "./types";
import { isWebPlatform } from "../services/googleSheetsService";
import { GoogleSheetsModal } from "./GoogleSheetsModal";

interface Props {
  onSelect: (userId: string) => void;
}

const defaultProfile: UserProfile = { name: "", apartmentNumber: "", totalFinancing: 0 };

export function UserSelect({ onSelect }: Props) {
  const [profile1, setProfile1] = useStorage<UserProfile>("apt_profile_user1", defaultProfile);
  const [profile2, setProfile2] = useStorage<UserProfile>("apt_profile_user2", defaultProfile);
  const [setupMode, setSetupMode] = useState<"user1" | "user2" | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
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
        <div className="w-full max-w-md rounded-3xl p-8 border shadow-lg" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <button
            onClick={() => setSetupMode(null)}
            className="mb-6 text-xs flex items-center gap-1 font-medium px-3.5 py-2 rounded-xl border transition-all active:scale-95"
            style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#8B6E52" }}
          >
            ← Voltar
          </button>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#4A3728" }}>Configurar {label}</h2>
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
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2 shadow-md disabled:opacity-40 transition-all active:scale-[0.99]"
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "#F5F0EB" }}>
      <div className="w-full max-w-2xl">
        {/* Header icon */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-md relative" style={{ background: "#4A3728" }}>
            <Home size={38} color="#FBF8F5" />
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-xs" style={{ background: "#C4A882" }}>
              <Sparkles size={14} color="#4A3728" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#4A3728" }}>Meu Apê</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: "#9B8578" }}>
            Centralizador de Financiamento &amp; Gestão Residencial
          </p>
        </div>

        <div className="rounded-3xl p-6 md:p-8 border shadow-lg mb-6" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-xs font-extrabold text-center mb-6 uppercase tracking-wider" style={{ color: "#8B6E52" }}>
            Selecione ou configure quem vai usar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["user1", "user2"] as const).map((uid, i) => {
              const p = profiles[uid];
              const hasProfile = !!p.name;
              return (
                <div
                  key={uid}
                  className="rounded-2xl border p-5 transition-all flex flex-col justify-between"
                  style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: hasProfile ? "#8B6E52" : "#E8DDD4" }}
                    >
                      {hasProfile ? (
                        <UserCheck size={22} color="#FBF8F5" />
                      ) : (
                        <KeyRound size={22} color="#9B8578" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold truncate" style={{ color: "#4A3728" }}>
                        {hasProfile ? p.name : `Perfil ${i + 1}`}
                      </p>
                      {hasProfile ? (
                        <p className="text-xs truncate font-semibold" style={{ color: "#8B6E52" }}>
                          Apê {p.apartmentNumber}
                        </p>
                      ) : (
                        <p className="text-xs" style={{ color: "#9B8578" }}>
                          Não configurado
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8DDD4]/60">
                    <button
                      onClick={() => handleSetup(uid)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      style={{ borderColor: "#E8DDD4", background: "#FBF8F5", color: "#6B584C" }}
                    >
                      <Edit3 size={13} />
                      <span>{hasProfile ? "Editar" : "Criar Perfil"}</span>
                    </button>
                    {hasProfile && (
                      <button
                        onClick={() => onSelect(uid)}
                        className="flex-1 text-xs px-4 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 text-center"
                        style={{ background: "#4A3728", color: "#FBF8F5" }}
                      >
                        Entrar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Web Google Sheets Button Banner */}
        {isWebPlatform() && (
          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="w-full mb-6 p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-all active:scale-[0.99]"
            style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs" style={{ background: "#34A853", color: "#FFF" }}>
                <FileSpreadsheet size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "#166534" }}>Conectar Google Sheets</p>
                <p className="text-xs" style={{ color: "#15803D" }}>Sincronização em nuvem para navegação Web / Desktop</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs" style={{ background: "#DCFCE7", color: "#166534" }}>Configurar</span>
          </button>
        )}

        <div className="rounded-2xl p-4 border text-center shadow-xs" style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}>
          <p className="text-xs font-medium leading-relaxed" style={{ color: "#8B6E52" }}>
            <span className="inline-flex items-center gap-1.5"><Lock size={13} color="#8B6E52" /> <strong>Privacidade &amp; Flexibilidade:</strong></span> Cada perfil mantém dados privados e independentes salvos com segurança.
          </p>
        </div>
      </div>

      <GoogleSheetsModal isOpen={isSheetsModalOpen} onClose={() => setIsSheetsModalOpen(false)} />
    </div>
  );
}
