import React, { useEffect, useState } from 'react';
import { ScanLine } from 'lucide-react';
import Modal from '../ui/Modal';

interface RedeemVerifyPanelProps {
  onRedeem: (code: string) => void;
  onScan: () => void;
  /** 变化时清空输入（例如每次打开「更多」菜单时递增） */
  panelKey?: number | string;
}

/** 道具核销：输入核销码或扫码（可嵌入其它弹窗） */
export function RedeemVerifyPanel({ onRedeem, onScan, panelKey }: RedeemVerifyPanelProps) {
  const [code, setCode] = useState('');

  useEffect(() => {
    setCode('');
  }, [panelKey]);

  const handleRedeem = () => {
    if (code.trim()) {
      onRedeem(code.trim());
      setCode('');
    }
  };

  return (
    <div className="flex flex-col py-2">
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        请输入对方提供的<strong className="text-slate-600 dark:text-slate-300">道具核销码</strong>
        ，或点击右侧按钮扫描核销二维码。
      </p>

      <div className="relative flex items-center mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="请输入核销码"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
        />
        <button
          type="button"
          onClick={onScan}
          className="absolute right-2 p-2 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          aria-label="扫码核销"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRedeem}
        disabled={!code.trim()}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        确认核销
      </button>
    </div>
  );
}

interface RedeemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => void;
  onScan: () => void;
}

export default function RedeemInputModal({ isOpen, onClose, onRedeem, onScan }: RedeemInputModalProps) {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (isOpen) {
      setNonce((n) => n + 1);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="道具核销">
      <RedeemVerifyPanel onRedeem={onRedeem} onScan={onScan} panelKey={nonce} />
    </Modal>
  );
}
