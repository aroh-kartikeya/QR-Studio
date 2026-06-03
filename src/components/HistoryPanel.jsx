import React from "react";
import { Trash2, Download, Calendar, Copy, Check } from "lucide-react";

export default function HistoryPanel({ history, onSelect, onDelete, onClear, activeId }) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (e, qrCodeUrl, text) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    const safeName = text.replace(/[^a-z0-9]/gi, "_").toLowerCase().substring(0, 30) || "qr_code";
    link.download = `qr_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[480px] lg:h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl overflow-hidden premium-glow-light dark:premium-glow-dark">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <span>Generation History</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-medium">
            {history.length}
          </span>
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">History is empty</p>
          </div>
        ) : (
          history.map((item) => {
            const isActive = item.id === activeId;
            
            const handleKeyDown = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(item);
              }
            };

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label={`Select generated QR code for ${item.text}`}
                className={`group flex items-center gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none ${
                  isActive
                    ? "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-400 dark:border-zinc-700"
                    : "bg-transparent border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 hover:border-zinc-250 dark:hover:border-zinc-800"
                }`}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-9 h-9 border border-zinc-200 dark:border-zinc-700 bg-white rounded p-0.5 flex items-center justify-center overflow-hidden">
                  <img src={item.qrCodeUrl} alt="" className="w-full h-full object-contain" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-250 truncate">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-450 dark:text-zinc-500 font-mono">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Hover Action Buttons */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopy(e, item.text, item.id)}
                    className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
                    title="Copy QR Data"
                    aria-label="Copy QR code text data"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, item.qrCodeUrl, item.text)}
                    className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
                    title="Download PNG"
                    aria-label="Download QR code image as PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus-visible:ring-1 focus-visible:ring-red-400 focus:outline-none"
                    title="Delete item"
                    aria-label="Delete QR code from history"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
