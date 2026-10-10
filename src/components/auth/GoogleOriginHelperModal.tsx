import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Sparkles, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

interface GoogleOriginHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickLogin: (role: 'faculty' | 'student' | 'admin') => void;
}

export const GoogleOriginHelperModal: React.FC<GoogleOriginHelperModalProps> = ({
  isOpen,
  onClose,
  onQuickLogin,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Google OAuth Origin Guide</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Error 400 Fix
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Fixing "Error 400: origin_mismatch" or Bypass with Instant Sign-In
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-600">
          {/* Instant Developer Sign-In Option */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-teal-950 flex items-center gap-1.5">
                <Sparkles size={16} className="text-teal-600" />
                <span>Instant Developer Sign-In (No Wait)</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-teal-800 mb-3">
              Directly authenticate as <strong>Abi Siva (abisiva1822007@gmail.com)</strong> without waiting for Google Cloud Console origin validation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickLogin('faculty');
                }}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <UserCheck size={14} />
                <span>As Faculty (Radar)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickLogin('student');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <UserCheck size={14} />
                <span>As Student (App)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickLogin('admin');
                }}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <UserCheck size={14} />
                <span>As Admin</span>
              </button>
            </div>
          </div>

          {/* Why Error 400 Happens */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Why "Error 400: origin_mismatch" Occurs:
            </h3>
            <p className="leading-relaxed">
              Google Cloud Console strictly verifies the exact browser origin (protocol + host + port). If your current origin is not in the Authorized JavaScript Origins list of Client ID <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">652946018589-...</code>, Google blocks the login.
            </p>
            {currentOrigin.includes('192.168.') || currentOrigin.includes('10.') || currentOrigin.includes('172.') ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <strong>LAN IP Detected ({currentOrigin}):</strong> Google strictly prohibits raw IP addresses for OAuth popups. When on mobile or LAN IP, use the Instant Sign-In above or access via <strong>http://localhost:5173</strong>.
              </div>
            ) : null}
          </div>

          {/* Step-by-Step Fix in Google Cloud Console */}
          <div className="space-y-2.5">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Permanent Fix in Google Cloud Console:
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>
                Open the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-700 underline inline-flex items-center gap-1 hover:text-teal-900"
                >
                  <span>Google Cloud Credentials Console</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>Select your project & click on the Web OAuth 2.0 Client ID.</li>
              <li>
                Under <strong>Authorized JavaScript origins</strong>, click <strong>+ ADD URI</strong> and paste:
              </li>
            </ol>

            {/* Copyable Origins */}
            <div className="space-y-1.5 pt-1">
              {[currentOrigin, 'http://localhost:5173', 'http://localhost'].map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="font-mono text-xs text-slate-700 select-all">{url}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(url)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copiedUrl === url ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              After saving in Google Cloud Console, Google takes 2–5 minutes to update its servers globally.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Account: <strong>abisiva1822007@gmail.com</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
