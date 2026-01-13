import { formatCurrency } from '../utils/currency';

export default function RecentExpenses({ expenses }) {
    // expenses: [{ id, memberName, description, amount, date }]

    // Sort by created or date? The API returns all for month. 
    // Let's assume we sort by createdAt desc if available, or just take the last ones.
    // The backend appends new expenses, so the last ones in the array are newest.
    // We'll reverse for display.

    const recent = [...(expenses || [])].reverse().slice(0, 5);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-500">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Expenses</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recent.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-slate-400 dark:text-slate-500">No expenses yet</td>
                            </tr>
                        ) : (
                            recent.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 text-xs">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{expense.memberName}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{expense.description}</td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-100">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
