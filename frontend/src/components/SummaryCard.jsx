import clsx from 'clsx';
import { formatCurrency } from '../utils/currency';

/**
 * @param {string} title 
 * @param {number} amount
 * @param {'red' | 'green' | 'blue'} variant
 * @param {React.ReactNode} action - Optional button/action
 */
export default function SummaryCard({ title, amount, variant = 'blue', action }) {
    const styles = {
        red: 'bg-red-500 text-white',
        green: 'bg-green-600 text-white', // Darker green for readability
        blue: 'bg-blue-600 text-white'
    };

    return (
        <div className={clsx("rounded-xl p-6 shadow-md flex flex-col justify-between transition-colors duration-500", styles[variant])}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">{title}</h3>
                    <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}
