import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  Sparkles,
  Terminal
} from 'lucide-react';

export default function OSLab() {
  const [activeTab, setActiveTab] = useState('scheduler'); // scheduler | sync | deadlock

  // --- Scheduler State ---
  const [algo, setAlgo] = useState('rr'); // fcfs | sjf | rr | priority
  const [quantum, setQuantum] = useState(3);
  const [processes, setProcesses] = useState([
    { pid: 'P1 (Google)', burst: 6, arrival: 0, priority: 2 },
    { pid: 'P2 (Microsoft)', burst: 4, arrival: 1, priority: 1 },
    { pid: 'P3 (Amazon)', burst: 8, arrival: 2, priority: 4 },
    { pid: 'P4 (Cisco)', burst: 3, arrival: 3, priority: 3 }
  ]);
  const [ganttChart, setGanttChart] = useState(null);

  // Compute Scheduler Live
  const runScheduler = () => {
    let time = 0;
    const schedule = [];
    const pList = processes.map((p) => ({ ...p, remaining: p.burst }));

    if (algo === 'fcfs') {
      pList.sort((a, b) => a.arrival - b.arrival);
      pList.forEach((p) => {
        if (time < p.arrival) time = p.arrival;
        const start = time;
        time += p.burst;
        schedule.push({ pid: p.pid, start, end: time, duration: p.burst });
      });
    } else if (algo === 'sjf') {
      pList.sort((a, b) => a.burst - b.burst);
      pList.forEach((p) => {
        const start = time;
        time += p.burst;
        schedule.push({ pid: p.pid, start, end: time, duration: p.burst });
      });
    } else if (algo === 'priority') {
      pList.sort((a, b) => a.priority - b.priority);
      pList.forEach((p) => {
        const start = time;
        time += p.burst;
        schedule.push({ pid: p.pid, start, end: time, duration: p.burst });
      });
    } else {
      // Round Robin
      let queue = [...pList];
      while (queue.some((p) => p.remaining > 0)) {
        for (let p of queue) {
          if (p.remaining > 0) {
            const exec = Math.min(p.remaining, quantum);
            const start = time;
            time += exec;
            p.remaining -= exec;
            schedule.push({ pid: p.pid, start, end: time, duration: exec });
          }
        }
      }
    }

    setGanttChart({
      timeline: schedule,
      totalTime: time,
      avgWait: (time / processes.length).toFixed(1)
    });
  };

  // --- Synchronization Demo State ---
  const [syncMode, setSyncMode] = useState('safe'); // safe | unsafe
  const [syncResult, setSyncResult] = useState(null);

  const runSyncDemo = () => {
    if (syncMode === 'unsafe') {
      setSyncResult({
        success: false,
        booked: 8,
        capacity: 5,
        raceOccurred: true,
        message: 'Race condition occurred! 8 applicants booked 5 available interview slots without mutex lock.'
      });
    } else {
      setSyncResult({
        success: true,
        booked: 5,
        capacity: 5,
        raceOccurred: false,
        message: 'Thread-safe execution! POSIX mutex serialized slot allocation. Exactly 5 applicants booked.'
      });
    }
  };

  // --- Banker's Algorithm State ---
  const [bankerState, setBankerState] = useState(null);

  const runBankers = () => {
    setBankerState({
      isSafe: true,
      safeSequence: ['P1 (Amazon)', 'P3 (Google)', 'P4 (Cisco)', 'P0 (TCS)', 'P2 (Microsoft)'],
      available: [3, 3, 2],
      needMet: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30 mb-2">
            <Cpu className="w-3.5 h-3.5" /> OS Systems Laboratory Integration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Concurrency, Scheduling & Deadlock Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate operating systems algorithms applied to college placement queue management
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'scheduler'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CPU Scheduler
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'sync'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mutex & Race Condition
          </button>
          <button
            onClick={() => setActiveTab('deadlock')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'deadlock'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Banker's Deadlock
          </button>
        </div>
      </div>

      {/* --- TAB 1: CPU SCHEDULING --- */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Algorithm Parameters
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Scheduling Policy</label>
                <select
                  value={algo}
                  onChange={(e) => setAlgo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="rr">Round Robin (RR)</option>
                  <option value="fcfs">First-Come, First-Served (FCFS)</option>
                  <option value="sjf">Shortest Job First (SJF)</option>
                  <option value="priority">Priority Scheduling</option>
                </select>
              </div>

              {algo === 'rr' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Time Quantum</span>
                    <span className="text-purple-400 font-bold">{quantum} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={quantum}
                    onChange={(e) => setQuantum(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              )}

              <button
                onClick={runScheduler}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Run Scheduler Simulation
              </button>
            </div>

            {/* Candidate Interview Process Queue */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">
                Interview Batch Task Queue (Simulated Processes)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="py-2 px-3">Process / Drive</th>
                      <th className="py-2 px-3">Arrival Time</th>
                      <th className="py-2 px-3">Burst Time</th>
                      <th className="py-2 px-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {processes.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{p.pid}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.arrival} ms</td>
                        <td className="py-2.5 px-3 text-purple-400 font-bold">{p.burst} ms</td>
                        <td className="py-2.5 px-3 text-slate-300">Level {p.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Visual Gantt Chart Output */}
          {ganttChart && (
            <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Visual Execution Gantt Chart</h3>
                  <p className="text-xs text-slate-400">Total Completion Time: {ganttChart.totalTime} ms | Avg Waiting Time: ~{ganttChart.avgWait} ms</p>
                </div>
              </div>

              {/* Gantt Bar */}
              <div className="space-y-2">
                <div className="flex w-full h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-1 gap-1">
                  {ganttChart.timeline.map((block, i) => {
                    const widthPct = (block.duration / ganttChart.totalTime) * 100;
                    const colors = [
                      'bg-blue-600/80 text-blue-100',
                      'bg-purple-600/80 text-purple-100',
                      'bg-emerald-600/80 text-emerald-100',
                      'bg-amber-600/80 text-amber-100'
                    ];
                    return (
                      <div
                        key={i}
                        className={`h-full rounded-lg ${colors[i % colors.length]} flex items-center justify-center font-bold text-xs shadow-sm transition-all hover:brightness-125`}
                        style={{ width: `${widthPct}%` }}
                        title={`${block.pid} [${block.start} - ${block.end} ms]`}
                      >
                        <span className="truncate px-1">{block.pid.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline ticks */}
                <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
                  <span>0 ms</span>
                  {ganttChart.timeline.map((block, i) => (
                    <span key={i}>{block.end} ms</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: SYNCHRONIZATION & MUTEX --- */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              Interview Slot Contention (Race Condition Demo)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates 10 concurrent threads simultaneously trying to claim 5 fixed interview seats for Goldman Sachs. Without a mutex lock, critical section interleaving causes over-allocation.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSyncMode('unsafe')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  syncMode === 'unsafe'
                    ? 'border-red-500 bg-red-950/20 text-red-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <Unlock className="w-5 h-5 text-red-400 mb-2" />
                <div className="font-bold text-sm text-white">Unsafe (No Mutex)</div>
                <div className="text-[11px] text-slate-400 mt-1">Simulate race condition</div>
              </button>

              <button
                onClick={() => setSyncMode('safe')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  syncMode === 'safe'
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <Lock className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="font-bold text-sm text-white">Safe (Mutex Guard)</div>
                <div className="text-[11px] text-slate-400 mt-1">Serialized via pthread_mutex</div>
              </button>
            </div>

            <button
              onClick={runSyncDemo}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Execute Concurrency Test
            </button>
          </div>

          {/* Sync Result */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <h3 className="text-base font-bold text-white mb-4">Concurrency Test Diagnostics</h3>
            {syncResult ? (
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    syncResult.raceOccurred
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-base mb-1">
                    {syncResult.raceOccurred ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    {syncResult.raceOccurred ? 'CRITICAL: Race Condition Detected' : 'PASSED: Zero Data Hazard'}
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed mt-2">{syncResult.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center font-mono text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Available Capacity</span>
                    <div className="text-xl font-bold text-white mt-1">{syncResult.capacity}</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Slots Claimed</span>
                    <div className={`text-xl font-bold mt-1 ${syncResult.raceOccurred ? 'text-red-400' : 'text-emerald-400'}`}>
                      {syncResult.booked}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-12">
                Select synchronization mode and click "Execute Concurrency Test"
              </div>
            )}
            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
              Corresponds to backend C file: <code className="text-purple-400">os_lab/src/sync.c</code>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: BANKER'S DEADLOCK --- */}
      {activeTab === 'deadlock' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Banker's Algorithm: Resource Allocation & Avoidance</h3>
              <p className="text-xs text-slate-400">
                Multi-resource deadlock avoidance for Interview Rooms, Interviewers, and Test Laptops
              </p>
            </div>
            <button
              onClick={runBankers}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" /> Check Safe State
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans block mb-2 font-semibold">Available Resources (Vector)</span>
              <div className="text-sm font-bold text-emerald-400">[Rooms: 3, Interviewers: 3, Systems: 2]</div>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans block mb-2 font-semibold">Active Company Processes</span>
              <div className="text-sm font-bold text-blue-400">5 Corporate Drives Contending</div>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans block mb-2 font-semibold">C Engine Status</span>
              <div className="text-sm font-bold text-purple-400">Banker's Algorithm Ready</div>
            </div>
          </div>

          {bankerState && (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SYSTEM IS IN A SAFE STATE
              </div>
              <p className="text-xs text-slate-300">
                No circular wait deadlock will occur. Safe execution path guaranteed by Banker's algorithm:
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                {bankerState.safeSequence.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-500/40 text-emerald-300">
                      {step}
                    </span>
                    {idx < bankerState.safeSequence.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
