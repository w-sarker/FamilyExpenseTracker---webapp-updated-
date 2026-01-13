import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/currency';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function ExpenseDonutChart({ data }) {
    // data: { "Food": 400, "Transport": 200 } object

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-white rounded-xl shadow-sm border border-slate-100">
                No category data
            </div>
        );
    }

    // Transform object to array
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-500">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Expense Breakdown</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
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
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ color: '#64748b' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
