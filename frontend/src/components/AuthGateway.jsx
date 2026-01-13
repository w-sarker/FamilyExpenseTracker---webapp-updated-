import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Delete } from 'lucide-react';
import api from '../api/axios';

export default function AuthGateway() {
    const { login } = useAuth();
    const [pin, setPin] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, error

    useEffect(() => {
        if (pin.length === 4) {
            handleVerify();
        }
    }, [pin]);

    const handleVerify = async () => {
        setStatus('loading');
        try {
            // Attempt to verify PIN via dedicated endpoint
            const res = await api.post('/auth/verify-pin', { pin });

            if (res.data.success) {
                // If successful, log in
                login(pin);
            } else {
                throw new Error('Invalid PIN');
            }
        } catch (err) {
            console.error("Auth failed:", err);
            setStatus('error');
            setPin(''); // Clear input

            // Reset to idle after 2 seconds
            setTimeout(() => {
                setStatus('idle');
            }, 2000);
        }
    };

    const handleKeyPress = (val) => {
        if (status === 'loading' || status === 'error') return;
        if (pin.length < 4) {
            setPin(prev => prev + val);
        }
    };

    const handleDelete = () => {
        if (status === 'loading' || status === 'error') return;
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className={`bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm transition-all duration-300 ${status === 'error' ? 'animate-shake border-2 border-red-500' : 'border border-slate-100'}`}>
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl transition-colors duration-300 ${status === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
                        <Lock className={`w-8 h-8 ${status === 'error' ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Access Denied</h2>
                    <p className="text-slate-500 text-sm">Enter Family PIN to continue</p>
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center space-x-4 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i
                                ? (status === 'error' ? 'bg-red-500 border-red-500' : 'bg-blue-600 border-blue-600 scale-110')
                                : 'border-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num.toString())}
                            className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-2xl font-semibold text-slate-700 transition-colors flex items-center justify-center"
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleKeyPress('0')}
                        className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-2xl font-semibold text-slate-700 transition-colors flex items-center justify-center"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={status === 'loading' ? undefined : handleVerify}
                    disabled={status === 'loading'}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md ${status === 'error'
                        ? 'bg-red-500 text-white'
                        : (status === 'loading' ? 'bg-blue-400 text-white cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]')
                        }`}
                >
                    {status === 'loading' ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Verifying...
                        </div>
                    ) : status === 'error' ? (
                        'Access Denied'
                    ) : (
                        'Access Dashboard'
                    )}
                </button>
            </div>
        </div>
    );
}
