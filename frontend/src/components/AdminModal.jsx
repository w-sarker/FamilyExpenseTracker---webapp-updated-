import { useState } from 'react';
import { X, Save, Lock } from 'lucide-react';
import api from '../api/axios';

export default function AdminModal({ isOpen, onClose, currentMonth, onSuccess }) {
    const [adminPin, setAdminPin] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/budget', {
                month: currentMonth,
                totalBudget: Number(budget)
            }, {
                headers: {
                    'X-ADMIN-PIN': adminPin
                }
            });
            onSuccess();
            onClose();
            setAdminPin('');
            setBudget('');
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative border dark:border-slate-800 transition-colors duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Update Monthly Budget</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Month</label>
                        <input
                            type="text"
                            value={currentMonth}
                            disabled
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Budget Amount (৳)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 ring-offset-0 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g. 50000"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin PIN</label>
                        <input
                            type="password"
                            required
                            value={adminPin}
                            onChange={e => setAdminPin(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 ring-offset-0 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="••••"
                            maxLength={4}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            <Save className="w-4 h-4" />
                            <span>{loading ? 'Saving...' : 'Save Budget'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
