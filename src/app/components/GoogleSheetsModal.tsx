import { useState, useEffect } from "react";
import { Database, Check, Copy, AlertCircle, RefreshCw, X, FileSpreadsheet, ExternalLink } from "lucide-react";
import {
  getGoogleSheetsUrl,
  setGoogleSheetsUrl,
  fetchAllFromGoogleSheets,
  GOOGLE_APPS_SCRIPT_CODE,
  isWebPlatform,
} from "../services/googleSheetsService";
import { notifyStorageChange } from "./useStorage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleSheetsModal({ isOpen, onClose }: Props) {
  const [url, setUrlInput] = useState("");
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getGoogleSheetsUrl());
      setStatus("idle");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    if (!url.trim()) {
      setGoogleSheetsUrl("");
      setStatus("success");
      setTimeout(() => onClose(), 1000);
      return;
    }

    setStatus("testing");
    setErrorMessage("");
    setGoogleSheetsUrl(url);

    const data = await fetchAllFromGoogleSheets();
    if (data !== null) {
      // Sync fetched data into localStorage
      Object.entries(data).forEach(([k, v]) => {
        try {
          const jsonVal = typeof v === "string" ? v : JSON.stringify(v);
          localStorage.setItem(k, jsonVal);
          notifyStorageChange(k, typeof v === "string" ? JSON.parse(v) : v);
        } catch {
          localStorage.setItem(k, String(v));
        }
      });

      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage("Não foi possível conectar com o Google Sheets. Verifique a URL e as permissões do Web App.");
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 border shadow-2xl relative flex flex-col gap-4"
        style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full transition-colors hover:bg-black/5"
          style={{ color: "#4A3728" }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs" style={{ background: "#34A853", color: "#FFF" }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold" style={{ color: "#4A3728" }}>
              Google Sheets como Banco de Dados (Web)
            </h3>
            <p className="text-xs" style={{ color: "#8B6E52" }}>
              Sincronize todos os dados do seu app diretamente na sua planilha
            </p>
          </div>
        </div>

        {/* Platform Notice */}
        {!isWebPlatform() ? (
          <div className="p-3.5 rounded-2xl border text-xs" style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}>
            <strong>Nota:</strong> No aplicativo Android nativo, seus dados são armazenados localmente e de forma rápida no dispositivo.
          </div>
        ) : (
          <>
            {/* Input URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#4A3728" }}>
                URL do Web App do Google Apps Script
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={url}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono transition-all focus:ring-2 focus:ring-[#34A853]/30"
                style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
              />
            </div>

            {/* Status Feedback */}
            {status === "error" && (
              <div className="p-3 rounded-xl border flex items-start gap-2 text-xs" style={{ background: "#FDF2F2", borderColor: "#F87171", color: "#991B1B" }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {status === "success" && (
              <div className="p-3 rounded-xl border flex items-center gap-2 text-xs" style={{ background: "#F0FDF4", borderColor: "#4ADE80", color: "#166534" }}>
                <Check size={16} className="shrink-0" />
                <span>Conectado e dados sincronizados com sucesso!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndSync}
                disabled={status === "testing"}
                className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: "#34A853", color: "#FFF" }}
              >
                {status === "testing" ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    <span>Salvar & Sincronizar Dados</span>
                  </>
                )}
              </button>
            </div>

            {/* Accordion Instructions */}
            <div className="border-t pt-4" style={{ borderColor: "#E8DDD4" }}>
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="w-full text-xs font-semibold flex items-center justify-between py-1"
                style={{ color: "#8B6E52" }}
              >
                <span>📖 Passo a passo: Como conectar sua Planilha Google</span>
                <span>{showTutorial ? "▲" : "▼"}</span>
              </button>

              {showTutorial && (
                <div className="mt-3 flex flex-col gap-3 text-xs leading-relaxed" style={{ color: "#4A3728" }}>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Crie uma nova planilha vazia no <strong>Google Sheets</strong>.</li>
                    <li>No menu superior, acesse <strong>Extensões &gt; Apps Script</strong>.</li>
                    <li>
                      Apague todo o código que estiver lá e cole o código abaixo:
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={copyScript}
                          className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5"
                          style={{ background: "#F5F0EB", borderColor: "#E8DDD4", color: "#4A3728" }}
                        >
                          {copiedScript ? <Check size={12} color="#34A853" /> : <Copy size={12} />}
                          <span>{copiedScript ? "Código Copiado!" : "Copiar Código do Script"}</span>
                        </button>
                      </div>
                    </li>
                    <li>Clique em <strong>Implantar &gt; Nova implantação</strong>.</li>
                    <li>No ícone engrenagem ⚙️, escolha <strong>App da Web</strong>.</li>
                    <li>Altere <em>"Quem pode acessar"</em> para <strong>Qualquer pessoa (Anyone)</strong>.</li>
                    <li>Clique em <strong>Implantar</strong>, autorize as permissões e copie a <strong>URL do App da Web</strong> gerada.</li>
                    <li>Cole a URL no campo acima e clique em <strong>Salvar &amp; Sincronizar</strong>!</li>
                  </ol>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
