import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ApkGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(44, 34, 25, 0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh] shadow-2xl border"
        style={{ background: "#FBF8F5", borderColor: "#E8DDD4" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#8B6E52" }}>
              <Smartphone size={20} color="#FBF8F5" />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "#4A3728" }}>Usar no Celular Android</h3>
              <p className="text-xs" style={{ color: "#9B8578" }}>Instalação gratuita & APK</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F5F0EB" }}>
            <X size={16} color="#4A3728" />
          </button>
        </div>

        {/* Option 1: PWA */}
        <div className="rounded-2xl p-4 border" style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} color="#8B6E52" />
            <p className="text-sm font-semibold" style={{ color: "#4A3728" }}>Método 1: Instalação PWA (Instantâneo e Grátis)</p>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#4A3728" }}>
            Você não precisa compilar arquivos pesados. No Chrome do seu Android:
          </p>
          <ol className="text-xs space-y-1.5 list-decimal pl-4" style={{ color: "#6B584C" }}>
            <li>Abra o link do aplicativo no navegador Google Chrome ou Edge do seu celular.</li>
            <li>Toque no menu de 3 pontinhos <strong>(⋮)</strong> no canto superior direito.</li>
            <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.</li>
            <li>Pronto! O app funcionará na tela inicial como um app nativo, com ícone próprio e sem barra do navegador.</li>
          </ol>
        </div>

        {/* Option 2: Build Native APK */}
        <div className="rounded-2xl p-4 border" style={{ background: "#F5F0EB", borderColor: "#E8DDD4" }}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={18} color="#4A3728" />
            <p className="text-sm font-semibold" style={{ color: "#4A3728" }}>Método 2: Gerar APK Nativo (.apk)</p>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#4A3728" }}>
            O projeto já vem pronto com as configurações do Capacitor (`capacitor.config.json`). Para compilar o arquivo APK nativo no seu computador:
          </p>
          <div className="rounded-xl p-3 text-xs font-mono mb-3 overflow-x-auto space-y-1" style={{ background: "#4A3728", color: "#FBF8F5" }}>
            <p># 1. Gerar os arquivos estáticos</p>
            <p className="text-amber-200">npm run build</p>
            <p className="mt-1"># 2. Adicionar plataforma Android</p>
            <p className="text-amber-200">npx cap add android</p>
            <p className="mt-1"># 3. Sincronizar com o projeto Android</p>
            <p className="text-amber-200">npx cap sync</p>
            <p className="mt-1"># 4. Abrir no Android Studio para compilar o APK</p>
            <p className="text-amber-200">npx cap open android</p>
          </div>
          <p className="text-xs text-center" style={{ color: "#9B8578" }}>
            No Android Studio, basta clicar em <em>Build &gt; Build APK(s)</em> para exportar o arquivo instalado no seu celular!
          </p>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs" style={{ color: "#8B6E52" }}>
          <ShieldCheck size={16} />
          <span>100% Gratuito, sem propagandas e com dados salvos no próprio aparelho.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-medium mt-1"
          style={{ background: "#8B6E52", color: "#FBF8F5" }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
