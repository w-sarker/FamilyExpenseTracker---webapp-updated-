import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

export default function Layout({ children }) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Dark Mode Transition Shape */}
            <div id="shape" className="pointer-events-none" />

            {/* Header */}
            <header className="bg-slate-800 text-white shadow-md relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-1.5 mr-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <h1 className="font-semibold text-lg tracking-wide">Sarker Family Expense Tracker</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <DarkModeToggle />

                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-300" />
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {children}
            </main>
        </div>
    );
}
