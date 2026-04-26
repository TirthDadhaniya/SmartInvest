/**
 * PageSkeletons.jsx
 * ─────────────────
 * Reusable skeleton loading placeholders for every page in SmartInvest.
 * Each skeleton mirrors the exact layout of its real page so the user
 * sees a smooth shimmer transition while data loads.
 *
 * Usage:
 *   import { DashboardSkeleton, InvestmentsSkeleton, ... } from "../components/PageSkeletons";
 *   if (loading) return <DashboardSkeleton />;
 */
import React from 'react';

/* ── Shared building-block components ──────────────────────────────────────── */

/** A single animated rectangular placeholder bar. */
const Bar = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${className}`} />
);

/** A card-shaped skeleton with optional height. */
const CardSkeleton = ({ className = '', children }) => (
  <div className={`bg-surface border border-border rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

/* ── Dashboard Skeleton ───────────────────────────────────────────────────── */
/** Matches: 4 stat cards → allocation chart + goals → stress + expense → transactions */
export const DashboardSkeleton = () => (
  <div className="p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full animate-pulse">
    {/* 4 summary cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <CardSkeleton key={i} className="p-6 space-y-3">
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-36" />
          <Bar className="h-2 w-20" />
        </CardSkeleton>
      ))}
    </div>

    {/* Allocation chart + Goals row */}
    <div className="grid grid-cols-12 gap-6">
      <CardSkeleton className="col-span-12 xl:col-span-8 p-6 space-y-4">
        <Bar className="h-4 w-32" />
        <div className="flex items-center gap-8">
          {/* Pie placeholder */}
          <div className="size-48 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-slate-300" />
                <Bar className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </CardSkeleton>
      <CardSkeleton className="col-span-12 xl:col-span-4 p-6 space-y-4">
        <Bar className="h-3 w-28" />
        {[1, 2, 3].map(i => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
            <Bar className="h-3 w-28" />
            <Bar className="h-2 w-40" />
          </div>
        ))}
      </CardSkeleton>
    </div>

    {/* Stress + Silent Fee row */}
    <div className="grid grid-cols-12 gap-6">
      <CardSkeleton className="col-span-12 lg:col-span-8 p-6 space-y-4">
        <Bar className="h-3 w-36" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-28 bg-slate-100 rounded-lg" />
          <div className="h-28 bg-slate-100 rounded-lg" />
        </div>
      </CardSkeleton>
      <CardSkeleton className="col-span-12 lg:col-span-4 p-6 space-y-4">
        <Bar className="h-3 w-28" />
        <div className="h-12 bg-slate-100 rounded-full w-12" />
        <Bar className="h-6 w-28" />
        <div className="h-20 bg-slate-50 rounded-lg" />
      </CardSkeleton>
    </div>

    {/* Transactions + What-If row */}
    <div className="grid grid-cols-12 gap-6">
      <CardSkeleton className="col-span-12 lg:col-span-8 p-0">
        <div className="p-6 border-b border-border flex justify-between">
          <Bar className="h-3 w-32" />
          <Bar className="h-3 w-16" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="px-6 py-4 flex justify-between border-b border-slate-50">
            <Bar className="h-3 w-20" />
            <Bar className="h-3 w-32" />
            <Bar className="h-3 w-12" />
            <Bar className="h-3 w-16" />
          </div>
        ))}
      </CardSkeleton>
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <CardSkeleton className="p-6 space-y-3">
          <Bar className="h-3 w-20" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-3/4" />
          <Bar className="h-10 w-full rounded-lg" />
        </CardSkeleton>
        <CardSkeleton className="p-6 space-y-3">
          <Bar className="h-3 w-24" />
          {[1, 2].map(i => (
            <div key={i} className="flex items-start gap-2">
              <div className="size-2 rounded-full bg-slate-300 mt-1 shrink-0" />
              <Bar className="h-3 w-full" />
            </div>
          ))}
        </CardSkeleton>
      </div>
    </div>
  </div>
);

/* ── Investments (My Portfolio) Skeleton ───────────────────────────────────── */
/** Matches: header + filter bar + list of fund cards */
export const InvestmentsSkeleton = () => (
  <div className="flex-1 p-4 md:p-8 space-y-6 max-w-350 mx-auto w-full animate-pulse">
    {/* Page header */}
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Bar className="h-8 w-48" />
        <Bar className="h-3 w-64" />
      </div>
      <div className="flex gap-3">
        <Bar className="h-10 w-24 rounded-lg" />
        <Bar className="h-10 w-32 rounded-lg" />
      </div>
    </div>

    {/* Filter bar */}
    <CardSkeleton className="p-4 flex gap-4 items-center">
      <Bar className="h-10 flex-1 max-w-[320px] rounded-lg" />
      <Bar className="h-10 w-28 rounded-lg" />
      <Bar className="h-10 w-40 rounded-lg" />
    </CardSkeleton>

    {/* Tracking count */}
    <Bar className="h-3 w-32" />

    {/* Fund cards */}
    {[1, 2, 3, 4].map(i => (
      <CardSkeleton key={i} className="p-5 flex items-center gap-6">
        <div className={newFunction()}>
          <Bar className="h-4 w-48" />
          <Bar className="h-3 w-24" />
        </div>
        <div className="grid grid-cols-5 gap-6 flex-1">
          {[1, 2, 3, 4, 5].map(j => (
            <div key={j} className="space-y-2">
              <Bar className="h-2 w-14" />
              <Bar className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    ))}
  </div>
);

/* ── Manage Funds Skeleton ────────────────────────────────────────────────── */
/** Matches: header + tab bar + fund search form + holdings table */
export const ManageFundsSkeleton = () => (
  <div className="flex-1 p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full animate-pulse">
    {/* Page header */}
    <div className="space-y-2">
      <Bar className="h-8 w-48" />
      <Bar className="h-3 w-72" />
    </div>

    {/* Tab bar */}
    <div className="flex gap-8 border-b border-border pb-2">
      <Bar className="h-4 w-24" />
      <Bar className="h-4 w-16" />
    </div>

    {/* Form area */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Search + form */}
      <CardSkeleton className="p-6 space-y-5">
        <Bar className="h-4 w-28" />
        <Bar className="h-10 w-full rounded-lg" />
        <div className="flex gap-4">
          <Bar className="h-10 flex-1 rounded-lg" />
          <Bar className="h-10 w-28 rounded-lg" />
        </div>
        <Bar className="h-10 w-full rounded-lg" />
        <div className="flex justify-between items-center">
          <Bar className="h-3 w-24" />
          <Bar className="h-5 w-28" />
        </div>
        <Bar className="h-12 w-full rounded-lg" />
      </CardSkeleton>

      {/* Preview */}
      <CardSkeleton className="p-6 space-y-4">
        <Bar className="h-4 w-32" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between">
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-20" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </div>

    {/* Holdings table */}
    <div className="space-y-3">
      <Bar className="h-3 w-40" />
      {[1, 2, 3].map(i => (
        <CardSkeleton key={i} className="p-4 flex items-center gap-4">
          <Bar className="h-4 w-48 flex-1" />
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-20" />
          <Bar className="h-8 w-20 rounded-lg" />
          <Bar className="h-8 w-16 rounded-lg" />
        </CardSkeleton>
      ))}
    </div>
  </div>
);

/* ── Transactions Skeleton ────────────────────────────────────────────────── */
/** Matches: header + filter bar + table with rows */
export const TransactionsSkeleton = () => (
  <div className="flex-1 p-8 space-y-6 max-w-350 mx-auto w-full animate-pulse">
    {/* Header */}
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Bar className="h-8 w-56" />
        <Bar className="h-3 w-72" />
      </div>
      <Bar className="h-10 w-36 rounded-lg" />
    </div>

    {/* Filter bar */}
    <CardSkeleton className="p-4 flex flex-wrap gap-3 items-center">
      <Bar className="h-10 flex-1 min-w-65 rounded-lg" />
      <Bar className="h-10 w-36 rounded-lg" />
      <Bar className="h-10 w-36 rounded-lg" />
      <Bar className="h-10 w-28 rounded-lg" />
      <Bar className="h-10 w-28 rounded-lg" />
    </CardSkeleton>

    {/* Record count */}
    <Bar className="h-3 w-28" />

    {/* Table */}
    <CardSkeleton className="overflow-hidden min-h-125">
      {/* Table header */}
      <div className="bg-slate-50 px-6 py-4 flex gap-6 border-b border-border">
        {['w-16', 'w-40', 'w-12', 'w-20', 'w-20', 'w-20'].map((w, i) => (
          <Bar key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {/* Table rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="px-6 py-4 flex gap-6 border-b border-slate-50">
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-40" />
          <Bar className="h-4 w-14" />
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-20" />
        </div>
      ))}
    </CardSkeleton>
  </div>
);

/* ── Profile Skeleton ─────────────────────────────────────────────────────── */
/** Matches: header + 3-column grid (user + tax | goals + report card) */
export const ProfileSkeleton = () => (
  <div className="flex-1 p-4 md:p-8 space-y-8 max-w-350 mx-auto w-full animate-pulse">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Bar className="h-8 w-36" />
        <Bar className="h-3 w-64" />
      </div>
      <Bar className="h-4 w-24" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left column: User + Tax */}
      <div className="lg:col-span-1 space-y-8">
        <CardSkeleton className="p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-14 h-14 bg-slate-200 rounded-full" />
            <div className="space-y-2">
              <Bar className="h-5 w-32" />
              <Bar className="h-3 w-44" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Bar className="h-2 w-16" />
              <Bar className="h-6 w-24 rounded-md" />
            </div>
            <Bar className="h-8 w-28 rounded-lg" />
          </div>
        </CardSkeleton>

        <CardSkeleton className="p-6 space-y-4">
          <Bar className="h-4 w-36" />
          <Bar className="h-3 w-full" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between border-b border-border pb-2">
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-20" />
            </div>
          ))}
          <Bar className="h-10 w-full rounded-lg" />
        </CardSkeleton>
      </div>

      {/* Right column: Goals + Report Card */}
      <div className="lg:col-span-2 space-y-8">
        <CardSkeleton className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Bar className="h-5 w-32" />
            <Bar className="h-8 w-24 rounded-lg" />
          </div>
          {[1, 2].map(i => (
            <div key={i} className="border border-border rounded-xl p-5 space-y-3">
              <div className="flex justify-between">
                <Bar className="h-5 w-36" />
                <Bar className="h-5 w-24" />
              </div>
              <Bar className="h-1 w-full rounded-full" />
              <div className="flex gap-4">
                <Bar className="h-3 w-28" />
                <Bar className="h-3 w-28" />
              </div>
            </div>
          ))}
        </CardSkeleton>

        <CardSkeleton className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Bar className="h-5 w-40" />
            <Bar className="h-10 w-12 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-200 rounded-full mx-auto" />
                <Bar className="h-3 w-16 mx-auto" />
                <Bar className="h-2 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardSkeleton>
      </div>
    </div>
  </div>
);

/* ── Fund Detail Skeleton ─────────────────────────────────────────────────── */
/** Matches: back button + fund header + chart + metrics grid */
export const FundDetailSkeleton = () => (
  <div className="flex-1 p-4 md:p-8 space-y-6 max-w-350 mx-auto w-full animate-pulse">
    {/* Back button */}
    <Bar className="h-4 w-28" />

    {/* Fund header */}
    <CardSkeleton className="p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-3">
        <Bar className="h-6 w-64" />
        <Bar className="h-3 w-40" />
        <div className="flex gap-3 mt-2">
          <Bar className="h-6 w-20 rounded-md" />
          <Bar className="h-6 w-24 rounded-md" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Bar className="h-8 w-28 ml-auto" />
        <Bar className="h-4 w-20 ml-auto" />
      </div>
    </CardSkeleton>

    {/* Chart */}
    <CardSkeleton className="p-6 space-y-4">
      <div className="flex justify-between">
        <Bar className="h-4 w-28" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Bar key={i} className="h-7 w-12 rounded" />
          ))}
        </div>
      </div>
      <div className="h-64 bg-slate-100 rounded-lg" />
    </CardSkeleton>

    {/* Metrics grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <CardSkeleton key={i} className="p-4 space-y-2">
          <Bar className="h-2 w-20" />
          <Bar className="h-5 w-28" />
        </CardSkeleton>
      ))}
    </div>
  </div>
);
function newFunction() {
  return 'flex-1 space-y-2 min-w-[180px]';
}
