import { formatCurrency } from '../utils/currency';

export default function MemberSummary({ data }) {
    // data: { "John": 320, "Alice": 450 }

    const members = Object.entries(data || {})
        .sort(([, a], [, b]) => b - a); // Sort by highest spenders

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full transition-colors duration-500">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 text-center sm:text-left">Member Spending</h3>
            <div className="space-y-4">
                {members.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-center">No data</p>
                ) : members.map(([name, amount]) => (
                    <div key={name} className="flex justify-between items-center py-2 bg-slate-50 dark:bg-slate-800 px-4 rounded-lg">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
