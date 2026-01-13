import { useState, useEffect } from "react";
import { Calendar, ChevronUp, ChevronDown } from "lucide-react";
import api from "../api/axios";
import { format } from "date-fns";

const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Shopping",
  "Other",
];

const FAMILY_MEMBERS = ["Mukul", "Nuri", "Zaara", "Waafi"];

export default function ExpenseForm({ onSuccess, currentMonth }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"), // Default to today
    memberName: FAMILY_MEMBERS[0],
    category: "Food",
    description: "",
    amount: "",
  });

  // Update date when current month changes (if current date is not in the new month)
  useEffect(() => {
    if (!currentMonth) return;

    const [year, month] = currentMonth.split("-").map(Number);
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;

    // If today is in the currentMonth, keep today's date.
    // Otherwise, set to the 1st of the currentMonth.
    if (year === todayYear && month === todayMonth) {
      setFormData((prev) => ({ ...prev, date: format(today, "yyyy-MM-dd") }));
    } else {
      const firstOfMonth = `${currentMonth}-01`;
      setFormData((prev) => ({ ...prev, date: firstOfMonth }));
    }
  }, [currentMonth]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const adjustAmount = (delta) => {
    const currentValue = parseFloat(formData.amount) || 0;
    const newValue = Math.max(0.01, currentValue + delta);
    setFormData((prev) => ({ ...prev, amount: newValue.toString() }));
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      adjustAmount(10);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      adjustAmount(-10);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Transform date from yyyy-MM-dd to DD/MM/YYYY for API
      const [y, m, d] = formData.date.split("-");
      const apiDate = `${d}/${m}/${y}`;

      await api.post("/expenses", {
        ...formData,
        date: apiDate,
        amount: Number(formData.amount),
      });

      // Reset form (keep name maybe? user might add multiple. Specs don't say. Let's reset critical fields)
      setFormData((prev) => ({
        ...prev,
        description: "",
        amount: "",
        category: "Food",
      }));

      if (onSuccess) onSuccess();
    } catch (error) {
      alert(
        "Error adding expense: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-500">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-800 pb-2">
        Expense Input
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full pl-3 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Member Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
            </label>
            <select
              name="memberName"
              value={formData.memberName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {FAMILY_MEMBERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                (optional)
              </span>
            </label>
            <input
              type="text"
              name="description"
              placeholder="e.g. Lunch"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Amount & Button Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (৳)
            </label>
            <div className="relative group">
              <input
                type="number"
                name="amount"
                required
                min="0.01"
                step="any"
                placeholder="0"
                value={formData.amount}
                onChange={handleChange}
                onKeyDown={handleAmountKeyDown}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
              />
              <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => adjustAmount(10)}
                  className="flex-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-tr-md text-slate-400 hover:text-blue-500 transition-colors flex items-center justify-center border-b border-slate-100 dark:border-slate-700"
                  title="Increase by 10 (or ArrowUp)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustAmount(-10)}
                  className="flex-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-br-md text-slate-400 hover:text-blue-500 transition-colors flex items-center justify-center"
                  title="Decrease by 10 (or ArrowDown)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
