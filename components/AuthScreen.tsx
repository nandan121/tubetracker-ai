
import React, { useState, useEffect } from 'react';
import { Lock, Youtube, Key, ShieldCheck, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { appConfig } from '../config';

interface AuthScreenProps {
  onAuthenticated: (apiKey?: string) => void;
}

const PIN_STORAGE_KEY = 'tubetracker_auth_pin';
const API_KEY_STORAGE = 'tubetracker_api_key_pref';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'setup' | 'login'>('login');
  const [showPin, setShowPin] = useState(false);
  const [hasConfigKey, setHasConfigKey] = useState(false);
  const [isHardcodedPin, setIsHardcodedPin] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const storedKey = localStorage.getItem(API_KEY_STORAGE);
    
    // 1. Check if we have a hardcoded key
    if (appConfig.apiKey && appConfig.apiKey.length > 10) {
      setHasConfigKey(true);
    } else if (storedKey) {
      setApiKey(storedKey);
      setRememberKey(true);
    }
    
    // 2. Check if we have a hardcoded PIN
    if (appConfig.authPin && appConfig.authPin.length > 0) {
      setIsHardcodedPin(true);
      setMode('login'); // Always force login mode if pin is hardcoded
    } else {
      // Fallback to local storage logic
      if (!storedPin) {
        setMode('setup');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If using Hardcoded PIN from Config
    if (isHardcodedPin) {
       if (pin === appConfig.authPin) {
         handleSuccess();
       } else {
         setError("Incorrect Config PIN.");
         setPin('');
       }
       return;
    }

    // Standard Local Storage Logic
    if (mode === 'setup') {
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits.");
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match.");
        return;
      }
      localStorage.setItem(PIN_STORAGE_KEY, pin);
      handleSuccess();
    } else {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
      if (pin === storedPin) {
        handleSuccess();
      } else {
        setError("Incorrect PIN.");
        setPin('');
      }
    }
  };

  const handleSuccess = () => {
    // Priority: Config Key > User Input Key
    const finalKey = hasConfigKey ? appConfig.apiKey : apiKey;

    if (!hasConfigKey) {
      if (rememberKey && apiKey) {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    }
    
    onAuthenticated(finalKey);
  };

  const handleReset = () => {
    // If PIN is hardcoded in config, you can't reset it via UI
    if (isHardcodedPin) {
      alert("PIN is managed in config.ts. Please update the file to change it.");
      return;
    }

    if (window.confirm("This will reset your PIN and clear all stored keys. Continue?")) {
      localStorage.removeItem(PIN_STORAGE_KEY);
      localStorage.removeItem(API_KEY_STORAGE);
      setMode('setup');
      setPin('');
      setConfirmPin('');
      setApiKey('');
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-600 p-4 rounded-full mb-4 shadow-lg shadow-red-900/50">
             <Youtube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TubeTracker AI</h1>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'setup' ? 'Create your secure access PIN' : 'Enter PIN to access dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {mode === 'setup' ? 'Create PIN' : 'Access PIN'}
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                maxLength={20}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-center text-xl tracking-widest text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-700"
                placeholder={mode === 'setup' ? "Set PIN" : "Enter PIN"}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* CONFIRM PIN (Setup only) */}
          {mode === 'setup' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={20}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-center text-xl tracking-widest text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Repeat PIN"
                  required
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="border-t border-gray-700 pt-6">
            {hasConfigKey ? (
              <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-200 text-sm">
                <Key className="w-4 h-4" />
                <span>API Key loaded from config file</span>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Data API Key
                </label>
                <div className="relative mb-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm"
                    placeholder="AIzaSy..."
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                
                <div className="flex items-center justify-between text-xs mt-3">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300">
                    <input 
                      type="checkbox" 
                      checked={rememberKey}
                      onChange={(e) => setRememberKey(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                    Remember my API key
                  </label>
                  
                  <a 
                    href="https://console.cloud.google.com/apis/dashboard" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    Check Quota <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
          >
            {mode === 'setup' ? 'Set PIN & Enter' : 'Unlock Dashboard'}
          </button>
        </form>
        
        {mode === 'login' && !isHardcodedPin && (
          <button 
            onClick={handleReset}
            className="w-full mt-4 text-xs text-gray-600 hover:text-gray-400 text-center underline"
          >
            Forgot PIN / Reset App
          </button>
        )}
      </div>
    </div>
  );
};
