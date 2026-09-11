import React from 'react';
import { TrendingUp, Award, DollarSign, CheckCircle2 } from 'lucide-react';

interface PlacementRoiBarProps {
  annualTuition: number;
  averagePackage: number; // in thousands (e.g. 128.5) or dollars
  highestPackage: number; // in thousands (e.g. 260.0) or dollars
  placementRate: number;
  year: number;
}

export function PlacementRoiBar({
  annualTuition,
  averagePackage,
  highestPackage,
  placementRate,
  year,
}: PlacementRoiBarProps) {
  // Convert thousands to dollars if needed
  const avgSalary = averagePackage < 1000 ? averagePackage * 1000 : averagePackage;
  const maxSalary = highestPackage < 1000 ? highestPackage * 1000 : highestPackage;
  const tuition = annualTuition || 0;

  const maxScale = Math.max(maxSalary, avgSalary, tuition) * 1.05;

  const tuitionWidth = Math.min(100, Math.max(8, (tuition / maxScale) * 100));
  const avgSalaryWidth = Math.min(100, Math.max(8, (avgSalary / maxScale) * 100));
  const maxSalaryWidth = Math.min(100, Math.max(8, (maxSalary / maxScale) * 100));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  // Return on Investment ratio: Year 1 Avg Starting Salary / Annual Tuition
  const roiMultiplier = tuition > 0 ? (avgSalary / tuition).toFixed(2) : 'N/A';
  const breakevenYears = tuition > 0 ? ((tuition * 4) / Math.max(avgSalary, 1)).toFixed(1) : 'N/A';

  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 space-y-5">
      {/* Header with Year and ROI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Placement & Return on Investment (ROI) Benchmark
          </h3>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{roiMultiplier}x Annual Tuition 1st-Year Return</span>
        </div>
      </div>

      {/* Comparative Progress Bars */}
      <div className="space-y-3.5 text-xs">
        {/* Annual Tuition */}
        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-slate-600 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Annual Tuition (Investment)
            </span>
            <span className="font-mono text-slate-900 font-bold">{formatCurrency(tuition)}/yr</span>
          </div>
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-500"
              style={{ width: `${tuitionWidth}%` }}
            />
          </div>
        </div>

        {/* Average Starting Salary */}
        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-indigo-700 flex items-center gap-1 font-bold">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Average Starting Package (Class of {year})
            </span>
            <span className="font-mono text-indigo-600 font-bold">{formatCurrency(avgSalary)}</span>
          </div>
          <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${avgSalaryWidth}%` }}
            />
          </div>
        </div>

        {/* Highest CTC Package */}
        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Highest Career Compensation (Peak CTC)
            </span>
            <span className="font-mono text-emerald-600 font-bold">{formatCurrency(maxSalary)}</span>
          </div>
          <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${maxSalaryWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Metrics Callout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-center">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200/60">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Placement Rate
          </span>
          <span className="block text-sm font-extrabold font-mono text-emerald-600 mt-0.5">
            {placementRate}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200/60">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Salary to Fee Ratio
          </span>
          <span className="block text-sm font-extrabold font-mono text-indigo-600 mt-0.5">
            {roiMultiplier}x
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 col-span-2 sm:col-span-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Est. Degree Breakeven
          </span>
          <span className="block text-sm font-extrabold font-mono text-slate-900 mt-0.5">
            ~{breakevenYears} Years
          </span>
        </div>
      </div>
    </div>
  );
}
