import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';

export default function MonthlyBarChart({ data }) {
    // data: [{ date: '25/04/2024', amount: 75 }]
    // We might want to format XAxis tick to just Day if dense, or DD.

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-white rounded-xl shadow-sm border border-slate-100">
                No spending data for this month
            </div>
        );
    }

    // Transform date for better display? '25/04'
    const displayData = data.map(d => ({
        ...d,
        day: d.date.split('/').slice(0, 2).join('/') // 25/04/2024 -> 25/04
    }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-500">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Spending</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                                backgroundColor: '#1e293b',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
