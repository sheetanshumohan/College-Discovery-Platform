'use client';

import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdmissionsCalculatorProps {
  collegeName: string;
  avgGpa?: number | null;
  avgSatScore?: number | null;
  avgActScore?: number | null;
  acceptanceRate?: number | null;
}

export function AdmissionsCalculator({
  collegeName,
  avgGpa,
  avgSatScore,
  avgActScore,
  acceptanceRate,
}: AdmissionsCalculatorProps) {
  const [gpaInput, setGpaInput] = useState<string>('');
  const [testType, setTestType] = useState<'SAT' | 'ACT'>('SAT');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const parsedGpa = parseFloat(gpaInput);
  const parsedScore = parseInt(scoreInput, 10);

  const isValidGpa = !isNaN(parsedGpa) && parsedGpa >= 0.0 && parsedGpa <= 4.0;
  const isValidScore =
    !isNaN(parsedScore) &&
    (testType === 'SAT'
      ? parsedScore >= 400 && parsedScore <= 1600
      : parsedScore >= 1 && parsedScore <= 36);

  // Determine admission probability category
  const calculateChances = () => {
    if (!isValidGpa && !isValidScore) return null;

    const gpaScore = isValidGpa ? parsedGpa : (avgGpa ?? 3.5);
    const benchmarkGpa = avgGpa ?? 3.5;

    let testScorePct = 0.5; // neutral default
    if (isValidScore) {
      if (testType === 'SAT') {
        const benchmarkSat = avgSatScore ?? 1300;
        testScorePct = (parsedScore - benchmarkSat) / 200;
      } else {
        const benchmarkAct = avgActScore ?? 28;
        testScorePct = (parsedScore - benchmarkAct) / 5;
      }
    }

    const gpaDelta = gpaScore - benchmarkGpa;
    const combinedRating = gpaDelta * 2 + testScorePct;
    const selectiveness = acceptanceRate ?? 0.35;

    if (selectiveness < 0.1) {
      if (combinedRating > 0.5) return 'Target';
      return 'Reach';
    }

    if (selectiveness < 0.25) {
      if (combinedRating > 0.8) return 'Target';
      if (combinedRating > -0.3) return 'Competitive Target';
      return 'Reach';
    }

    if (combinedRating > 0.4 && selectiveness > 0.4) return 'Safety';
    if (combinedRating >= -0.3) return 'Target';
    return 'Reach';
  };

  const result = hasCalculated ? calculateChances() : null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidGpa || isValidScore) {
      setHasCalculated(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Admissions Chance Calculator</h3>
          <p className="text-[11px] text-slate-500">Estimate your fit for {collegeName}</p>
        </div>
      </div>

      {/* Form Inputs */}
      <form onSubmit={handleCalculate} className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="student-gpa" className="text-xs font-semibold text-slate-700">
              Your GPA (Unweighted)
            </label>
            {avgGpa && (
              <span className="text-[10px] text-slate-400 font-mono">
                Avg: {avgGpa.toFixed(2)}
              </span>
            )}
          </div>
          <input
            id="student-gpa"
            type="number"
            step="0.01"
            min="0"
            max="4.0"
            placeholder="e.g. 3.85"
            value={gpaInput}
            onChange={(e) => {
              setGpaInput(e.target.value);
              setHasCalculated(false);
            }}
            className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <label htmlFor="student-test-score" className="text-xs font-semibold text-slate-700">
                Standardized Score
              </label>
              <div className="inline-flex rounded-md p-0.5 bg-slate-100 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTestType('SAT');
                    setScoreInput('');
                    setHasCalculated(false);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    testType === 'SAT' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  SAT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestType('ACT');
                    setScoreInput('');
                    setHasCalculated(false);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    testType === 'ACT' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  ACT
                </button>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Avg: {testType === 'SAT' ? (avgSatScore ?? '—') : (avgActScore ?? '—')}
            </span>
          </div>
          <input
            id="student-test-score"
            type="number"
            min={testType === 'SAT' ? 400 : 1}
            max={testType === 'SAT' ? 1600 : 36}
            placeholder={testType === 'SAT' ? 'e.g. 1480' : 'e.g. 33'}
            value={scoreInput}
            onChange={(e) => {
              setScoreInput(e.target.value);
              setHasCalculated(false);
            }}
            className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!isValidGpa && !isValidScore}
          className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isValidGpa || isValidScore
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Estimate Admission Chances</span>
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Assessment Outcome
          </div>

          {/* Meter Bar */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            <div
              className={`h-2 rounded-l-full transition-all ${
                result === 'Safety'
                  ? 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1'
                  : 'bg-emerald-200/60'
              }`}
              title="Safety / High Likelihood"
            />
            <div
              className={`h-2 transition-all ${
                result.includes('Target')
                  ? 'bg-indigo-600 ring-2 ring-indigo-300 ring-offset-1'
                  : 'bg-indigo-200/60'
              }`}
              title="Target / Realistic Match"
            />
            <div
              className={`h-2 rounded-r-full transition-all ${
                result === 'Reach'
                  ? 'bg-rose-500 ring-2 ring-rose-300 ring-offset-1'
                  : 'bg-rose-200/60'
              }`}
              title="Reach / Highly Selective"
            />
          </div>

          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-3 px-0.5">
            <span className={result === 'Safety' ? 'text-emerald-700 font-bold' : ''}>Safety</span>
            <span className={result.includes('Target') ? 'text-indigo-700 font-bold' : ''}>Target</span>
            <span className={result === 'Reach' ? 'text-rose-700 font-bold' : ''}>Reach</span>
          </div>

          {/* Badge & Explanation */}
          <div
            className={`p-3 rounded-lg border text-xs leading-relaxed ${
              result === 'Safety'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : result.includes('Target')
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1">
              {result === 'Safety' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : result.includes('Target') ? (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>
                {result === 'Safety'
                  ? 'Strong Safety Prospect'
                  : result === 'Target'
                  ? 'Solid Target Match'
                  : result === 'Competitive Target'
                  ? 'Competitive Target'
                  : 'Reach School'}
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              {result === 'Safety'
                ? 'Your credentials sit comfortably above historical admissions medians. You have a favorable admission profile.'
                : result === 'Target'
                ? 'Your metrics align with the typical middle 50% admitted student range for this institution.'
                : result === 'Competitive Target'
                ? 'Your scores are competitive, but selectivity requires strong extracurriculars and essay strength.'
                : 'Due to extreme selectivity or scores below the middle 50%, this institution is a challenging reach. Apply broadly across target schools.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
