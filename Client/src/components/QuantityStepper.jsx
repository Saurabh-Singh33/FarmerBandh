import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantityStepper = ({
  value = 1,
  min = 1,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  unit = 'Quintal'
}) => {
  const handleDecrement = () => {
    if (value > min) {
      const nextVal = Math.max(min, Number((value - step).toFixed(2)));
      onChange(nextVal);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      const nextVal = Math.min(max, Number((value + step).toFixed(2)));
      onChange(nextVal);
    }
  };

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      if (val >= min && val <= max) {
        onChange(val);
      }
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-l-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="flex items-center px-3 border-x border-slate-100">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-12 text-center text-sm font-semibold text-slate-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-slate-500 font-medium ml-1">{unit}</span>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-r-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
export default QuantityStepper;
