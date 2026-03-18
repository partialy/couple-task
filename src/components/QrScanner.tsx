import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Success callback
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (errorMessage) => {
        // Error callback (optional, can be noisy)
        // console.warn(errorMessage);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="absolute top-12 right-6 z-10">
        <button 
          onClick={onClose}
          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
        <div id="qr-reader" className="w-full h-full"></div>
        
        {/* Decorative scanning line animation */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-[scan_2s_linear_infinite] pointer-events-none"></div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-bold text-white mb-2">扫一扫</h3>
        <p className="text-slate-400 text-sm">将二维码放入框内即可自动扫描</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        #qr-reader {
          border: none !important;
        }
        #qr-reader__dashboard {
          padding: 20px !important;
          background: transparent !important;
          color: white !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__camera_selection {
          background: #1e293b !important;
          color: white !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          margin-bottom: 10px !important;
        }
        #qr-reader__dashboard_section_csr button {
          background: #06b6d4 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: bold !important;
          cursor: pointer !important;
        }
      `}} />
    </motion.div>
  );
}
