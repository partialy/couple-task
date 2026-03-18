import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import Modal from '../ui/Modal';

interface RedeemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => void;
  onScan: () => void;
}

export default function RedeemInputModal({ isOpen, onClose, onRedeem, onScan }: RedeemInputModalProps) {
  const [code, setCode] = useState('');

  const handleRedeem = () => {
    if (code.trim()) {
      onRedeem(code.trim());
      setCode('');
    }
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="道具核销">
      <div className="flex flex-col py-2">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          请输入对方提供的兑换码，或点击右侧按钮扫描二维码进行核销。
        </p>

        <div className="relative flex items-center mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="请输入兑换码"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
          />
          <button
            onClick={onScan}
            className="absolute right-2 p-2 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleRedeem}
          disabled={!code.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          确认核销
        </button>
      </div>
    </Modal>
  );
}
