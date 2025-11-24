
import React, { useState, useEffect } from 'react';
import { Lock, Youtube, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const PIN_STORAGE_KEY = 'tubetracker_auth_pin';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    // If a PIN is already stored, we try to use it immediately.
    // However, in this server-side auth model, we don't know if it's correct 
    // until we make a request. But for UX, we populate it.
    if (storedPin) {
      setPin(storedPin);
      // Optional: Auto-submit could go here, but safer to let user click to confirm intent
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 1) return;
    
    // Save PIN to local storage so the Service can grab it for headers
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    
    // We assume it's valid for now. If the first API call fails with 401, 
    // the main App will handle the error.
    onAuthenticated();
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
            Enter PIN to access secure dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-center text-xl tracking-widest text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-700"
                placeholder="Enter PIN"
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

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
          >
            Unlock Dashboard
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure Connection • Server-Side Validation</p>
        </div>
      </div>
    </div>
  );
};
