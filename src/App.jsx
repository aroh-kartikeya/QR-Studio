import React, { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Link,
  ChevronRight,
  Palette,
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import HistoryPanel from "./components/HistoryPanel";

// Determine API endpoint, with env variable support
const API_URL = import.meta.env.VITE_API_URL || "/api/generate";

const COLOR_PRESETS = [
  { name: "Ink Black", dark: "#09090b", light: "#ffffff" },
  { name: "Vercel Blue", dark: "#0070f3", light: "#ffffff" },
  { name: "Linear Purple", dark: "#5e6ad2", light: "#ffffff" },
  { name: "Stripe Indigo", dark: "#635bff", light: "#ffffff" },
  { name: "Emerald Green", dark: "#059669", light: "#ffffff" },
];

export default function App() {
  const [inputText, setInputText] = useState("https://vercel.com");
  const [colorDark, setColorDark] = useState("#09090b");
  const [colorLight, setColorLight] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  // History state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("qr_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Save history on changes
  useEffect(() => {
    localStorage.setItem("qr_history", JSON.stringify(history));
  }, [history]);

  // Initial QR generation
  useEffect(() => {
    generateQR(true);
  }, []);

  const generateQR = async (isInitial = false) => {
    if (!inputText.trim()) {
      setError("Please enter a valid text or URL.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          colorDark,
          colorLight,
          margin: Number(margin),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setQrCodeUrl(data.qrCodeUrl);

      // Add to history (only if it's not the initial load and it's a new generation)
      if (!isInitial) {
        const newItem = {
          id: Date.now().toString(),
          text: inputText,
          qrCodeUrl: data.qrCodeUrl,
          colorDark,
          colorLight,
          margin,
          timestamp: new Date().toISOString(),
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50
        setActiveHistoryId(newItem.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    const safeName =
      inputText
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()
        .substring(0, 30) || "qr_code";
    link.download = `qr_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Quick copy notification style flash
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 2000);
  };

  const copyInputText = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleSelectHistoryItem = (item) => {
    setInputText(item.text);
    setColorDark(item.colorDark || "#09090b");
    setColorLight(item.colorLight || "#ffffff");
    setMargin(item.margin !== undefined ? item.margin : 4);
    setQrCodeUrl(item.qrCodeUrl);
    setActiveHistoryId(item.id);
    setError("");
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      setActiveHistoryId(null);
    }
  };

  const applyPreset = (preset) => {
    setColorDark(preset.dark);
    setColorLight(preset.light);
  };

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-300 dark:bg-zinc-950 bg-zinc-50 grid-bg-light dark:grid-bg-dark">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm">
              <QrCode className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              QR Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/aroh-kartikeya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium hidden sm:inline-block focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none rounded-md px-1.5 py-0.5"
            >
              Source Code ↗
            </a>
            <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:inline-block"></span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col justify-center">
        {/* Intro */}
        <div className="max-w-3xl mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-xs mb-3 font-mono font-medium">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Built by Aroh Kartikeya</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Generate QR codes instantly.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Create, customize, and download QR codes directly in your browser.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left / Generator controls (Col Span 2 on desktop) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-2xl p-6 space-y-6 premium-glow-light dark:premium-glow-dark">
              {/* Form Input */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Enter URL or Text Data</span>
                  <span className="font-mono text-[10px] text-zinc-400 lowercase">
                    Supports raw text/HTTP protocols
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <Link className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="https://your-domain.com or text..."
                    className="w-full pl-10 pr-12 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-mono text-sm"
                  />
                  <button
                    onClick={copyInputText}
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    title="Copy input text"
                  >
                    {copiedInput ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Advanced Customizations */}
              <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2 text-xs font-semibold uppercase tracking-wider text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    <span>Advanced Customization</span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showAdvanced ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showAdvanced
                      ? "max-h-[500px] opacity-100 mt-5 space-y-6"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Custom Color Settings */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                      Preset Colors
                    </span>

                    {/* Preset Colors */}
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => {
                        const isSelected =
                          colorDark === preset.dark &&
                          colorLight === preset.light;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100"
                                : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10"
                              style={{ backgroundColor: preset.dark }}
                            />
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
                      <div className="flex items-center gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-500 dark:focus-within:ring-zinc-400">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="color"
                            value={colorDark}
                            onChange={(e) => setColorDark(e.target.value)}
                            aria-label="Choose custom dark module color"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150 focus:outline-none"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: colorDark }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">
                            Dark Modules
                          </p>
                          <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate uppercase">
                            {colorDark}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-zinc-500 dark:focus-within:ring-zinc-400">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="color"
                            value={colorLight}
                            onChange={(e) => setColorLight(e.target.value)}
                            aria-label="Choose custom background color"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150 focus:outline-none"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: colorLight }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">
                            Background
                          </p>
                          <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate uppercase">
                            {colorLight}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid Layout settings */}
                  <div className="space-y-2">
                    <label htmlFor="margin-select" className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                      Border Padding (Margin)
                    </label>
                    <select
                      id="margin-select"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      aria-label="Select QR code margin padding"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-zinc-950 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
                    >
                      <option value={0}>No Border (0)</option>
                      <option value={2}>Compact (2)</option>
                      <option value={4}>Standard (4)</option>
                      <option value={6}>Wide (6)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => generateQR(false)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      <span>Generate QR Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-650 dark:text-red-400 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Subtle Vercel style disclaimer */}
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5 px-1 py-2 sm:py-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>
                All generations are executed securely on the backend server.
                Download images locally.
              </span>
            </div>
          </div>

          {/* Right Preview and Sidebar controls */}
          <div className="flex flex-col gap-6">
            {/* QR Preview Panel */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-2xl p-6 flex flex-col items-center justify-center premium-glow-light dark:premium-glow-dark h-[300px] sm:h-[320px] lg:h-[350px] relative">
              {loading ? (
                /* Shimmer loading skeleton */
                <div className="w-48 h-48 sm:w-52 sm:h-52 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl flex flex-col items-center justify-center gap-3 animate-pulse border border-zinc-250/20 dark:border-zinc-700/20">
                  <QrCode className="h-8 w-8 text-zinc-300 dark:text-zinc-700 animate-spin" />
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-650 uppercase tracking-widest">
                    Rendering
                  </span>
                </div>
              ) : qrCodeUrl ? (
                /* Main Image output */
                <div className="flex flex-col items-center justify-between h-full w-full">
                  <div className="text-center">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                      Output Preview
                    </span>
                  </div>

                  <div className="relative group w-44 h-44 sm:w-48 sm:h-48 border border-zinc-200/60 dark:border-zinc-800 bg-white rounded-xl p-2.5 flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <button
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold transition-colors focus:outline-none"
                  >
                    {copiedQr ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Saved to local files</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download PNG</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Empty placeholder state */
                <div className="text-center space-y-3 py-10">
                  <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-center mx-auto text-zinc-450 dark:text-zinc-500">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-widest">
                      Awaiting Input
                    </h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs font-mono">
                      Fill out the parameters and generate your code
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local History Sidebar (Flexible height on desktop) */}
            <div className="flex-1 min-h-[300px]">
              <HistoryPanel
                history={history}
                onSelect={handleSelectHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onClear={handleClearHistory}
                activeId={activeHistoryId}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-6 mt-12 bg-white/40 dark:bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            Built by Aroh Kartikeya
          </p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              React + Vite + Tailwind v4
            </span>
            <span className="h-3 w-px bg-zinc-250 dark:bg-zinc-800"></span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
              Vercel Serverless
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
