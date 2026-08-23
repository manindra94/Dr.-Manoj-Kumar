import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Cpu,
  Database,
  Flame,
  Eye,
  ShieldCheck,
  Edit3,
  Save,
  Check,
  FileSpreadsheet,
  Download,
  Terminal,
  Calculator,
  Send,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';

export const AnalyticsDashboard: React.FC = () => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const { user, isAdmin } = useAuth();

  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [hIndex, setHIndex] = useState(24);
  const [paperViews, setPaperViews] = useState('18.4K');
  const [activeProjects, setActiveProjects] = useState(8);
  const [grantFunding, setGrantFunding] = useState('₹ 4.2 Cr');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Researcher Citation Simulation Tool
  const [simPapers, setSimPapers] = useState(5);
  const [simAvgCitations, setSimAvgCitations] = useState(35);

  // Collaboration Proposal Tool
  const [collabTitle, setCollabTitle] = useState('');
  const [collabScope, setCollabScope] = useState('');
  const [collabSuccess, setCollabSuccess] = useState(false);

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  const totalCitations = dbState.publications.reduce((acc, p) => acc + (p.citations || 0), 0);
  const totalPapers = dbState.publications.length;

  const dynamicCitationTrends = [
    { year: '2020', citations: 120, papers: 4 },
    { year: '2021', citations: 240, papers: 6 },
    { year: '2022', citations: 480, papers: 8 },
    { year: '2023', citations: 850, papers: 11 },
    { year: '2024', citations: 1210, papers: 15 },
    { year: '2025', citations: Math.max(1420, totalCitations), papers: totalPapers }
  ];

  const LAB_THERMAL_LOAD = [
    { time: '08:00', meltTemp: 1420, laserKw: 2.1, powderRate: 12 },
    { time: '10:00', meltTemp: 1550, laserKw: 2.4, powderRate: 15 },
    { time: '12:00', meltTemp: 1680, laserKw: 2.8, powderRate: 18 },
    { time: '14:00', meltTemp: 1620, laserKw: 2.5, powderRate: 16 },
    { time: '16:00', meltTemp: 1490, laserKw: 2.2, powderRate: 14 },
    { time: '18:00', meltTemp: 1380, laserKw: 1.8, powderRate: 10 }
  ];

  const DOMAIN_DISTRIBUTION = [
    { name: 'Metal 3D Printing (DED/SLM)', value: 45, color: '#ffc640' },
    { name: 'Coating Tech (Plasma/HVOF)', value: 30, color: '#2fd9f4' },
    { name: 'Microstructure & Metallurgy', value: 15, color: '#a78bfa' },
    { name: 'Failure Analysis', value: 10, color: '#34d399' }
  ];

  const handleSaveMetrics = () => {
    localDB.addTelemetry(`Admin updated research analytics metrics in CMS.`, 'analytics', 'success');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditingMetrics(false);
    }, 800);
  };

  const handleExportCSV = () => {
    const csvContent = [
      'Category,Value,Notes',
      `h-Index,${hIndex},Calculated via Google Scholar & Scopus`,
      `Total Publications,${totalPapers},Live Publication Count`,
      `Total Citations,${totalCitations},Peer-reviewed journals`,
      `Global Paper Views,${paperViews},ResearchGate & Institutional repo`,
      `Active Sponsored Projects,${activeProjects},CSIR & DST-SERB funded`,
      `Total Grant Outlay,${grantFunding},Research Infrastructure Grants`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CSIR_IMMT_Analytics_Report_2025.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCollabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabTitle || !collabScope) return;

    localDB.addMessage({
      name: user?.displayName || 'Visiting Researcher',
      email: user?.email || 'researcher@academic.edu',
      subject: `[Collaboration Proposal] ${collabTitle}`,
      message: `Scope & Objectives: ${collabScope}\nSubmitted via Researcher Analytics Portal.`
    });

    setCollabSuccess(true);
    setTimeout(() => {
      setCollabSuccess(false);
      setCollabTitle('');
      setCollabScope('');
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#122131] border border-[#ffc640]/30 text-[#ffc640] font-mono text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            RESEARCH ANALYTICS & TELEMETRY
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#051424] hover:bg-[#122131] text-[#2fd9f4] border border-[#273647] font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                className="px-3 py-1.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingMetrics ? 'CANCEL EDIT' : 'MANAGE METRICS'}</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
          Research <span className="text-[#ffc640]">Analytics & Telemetry</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
          Live laboratory metrics tracking publication impact, CSIR-IMMT laser melt pool telemetry, database sync throughput, and research outputs.
        </p>
      </section>

      {/* Admin Editable Metrics Drawer */}
      {isEditingMetrics && (
        <section className="p-5 rounded-2xl bg-[#122131] border border-[#ffc640]/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#273647] pb-3">
            <h3 className="text-sm font-bold font-serif text-[#ffc640] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Analytics Management</span>
            </h3>
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved & Synced!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div>
              <label className="block text-[#c6c6cd] mb-1">H-INDEX</label>
              <input
                type="number"
                value={hIndex}
                onChange={(e) => setHIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#273647] text-[#ffc640] font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[#c6c6cd] mb-1">PAPER VIEWS</label>
              <input
                type="text"
                value={paperViews}
                onChange={(e) => setPaperViews(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#273647] text-[#2fd9f4] font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[#c6c6cd] mb-1">ACTIVE PROJECTS</label>
              <input
                type="number"
                value={activeProjects}
                onChange={(e) => setActiveProjects(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#273647] text-[#d4e4fa] font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[#c6c6cd] mb-1">GRANT OUTLAY</label>
              <input
                type="text"
                value={grantFunding}
                onChange={(e) => setGrantFunding(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#273647] text-[#ffc640] font-bold outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveMetrics}
            className="px-5 py-2 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE METRICS</span>
          </button>
        </section>
      )}

      {/* KPI Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-1 shadow-md">
          <div className="text-xs text-[#c6c6cd] uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>h-Index Impact</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#ffc640]">{hIndex}</div>
          <div className="text-[10px] text-emerald-400">+18% YoY Growth</div>
        </div>

        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-1 shadow-md">
          <div className="text-xs text-[#c6c6cd] uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#2fd9f4]" />
            <span>Melt Pool Temp</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#2fd9f4]">1,680 °C</div>
          <div className="text-[10px] text-[#2fd9f4]">Inconel 718 DED</div>
        </div>

        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-1 shadow-md">
          <div className="text-xs text-[#c6c6cd] uppercase flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#ffc640]" />
            <span>System Status</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#d4e4fa]">
            {dbState.isOnline ? 'Active' : 'Offline'}
          </div>
          <div className="text-[10px] text-emerald-400">
            {dbState.isOnline ? 'Connected' : 'Local Storage Cache'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-1 shadow-md">
          <div className="text-xs text-[#c6c6cd] uppercase flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Paper Views</span>
          </div>
          <div className="text-2xl font-bold font-serif text-purple-400">{paperViews}</div>
          <div className="text-[10px] text-purple-400">Global Readership</div>
        </div>
      </section>

      {/* Chart 1: Citation Growth Trajectory */}
      <section className="p-5 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-3 shadow-xl">
        <h2 className="text-base font-bold font-serif text-[#d4e4fa] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#ffc640]" />
          <span>Citation Trajectory & Output Growth</span>
        </h2>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicCitationTrends}>
              <defs>
                <linearGradient id="citationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc640" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ffc640" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2b3c" />
              <XAxis dataKey="year" stroke="#c6c6cd" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="#c6c6cd" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{ backgroundColor: '#051424', borderColor: '#273647', color: '#d4e4fa', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <Area type="monotone" dataKey="citations" stroke="#ffc640" strokeWidth={2} fillOpacity={1} fill="url(#citationGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chart 2 & 3: Laser Thermal Load & Domain Distribution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-3 shadow-xl">
          <h2 className="text-base font-bold font-serif text-[#d4e4fa] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#2fd9f4]" />
            <span>Laser Melt Pool Temperature (°C)</span>
          </h2>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LAB_THERMAL_LOAD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2b3c" />
                <XAxis dataKey="time" stroke="#c6c6cd" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#c6c6cd" fontSize={11} fontFamily="JetBrains Mono" domain={[1200, 1800]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#051424', borderColor: '#273647', color: '#d4e4fa', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="meltTemp" stroke="#2fd9f4" strokeWidth={2.5} dot={{ fill: '#2fd9f4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Domain Distribution */}
        <div className="p-5 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-3 shadow-xl">
          <h2 className="text-base font-bold font-serif text-[#d4e4fa]">Research Focus Distribution</h2>

          <div className="h-56 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DOMAIN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DOMAIN_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#051424', borderColor: '#273647', color: '#d4e4fa', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {DOMAIN_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[#c6c6cd]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Researcher Interactive Citation Projection Simulator & Collaboration Form */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Simulator */}
        <div className="p-5 rounded-2xl bg-[#122131] border border-[#273647] space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-[#ffc640] font-bold">
            <Calculator className="w-4 h-4" />
            <span>RESEARCHER CITATION & IMPACT SIMULATOR</span>
          </div>
          <p className="text-[#c6c6cd] text-[11px]">
            Model projected scholarly impact based on forthcoming publications and target journal citation velocity.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#c6c6cd]">Upcoming Planned Papers:</span>
                <span className="text-[#ffc640] font-bold">{simPapers} Papers</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={simPapers}
                onChange={(e) => setSimPapers(Number(e.target.value))}
                className="w-full accent-[#ffc640]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#c6c6cd]">Expected Avg Citations / Paper:</span>
                <span className="text-[#2fd9f4] font-bold">{simAvgCitations} Citations</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={simAvgCitations}
                onChange={(e) => setSimAvgCitations(Number(e.target.value))}
                className="w-full accent-[#2fd9f4]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#051424] border border-[#273647] flex justify-between items-center">
              <div>
                <div className="text-[10px] text-[#c6c6cd] uppercase">Projected Net Impact</div>
                <div className="text-xl font-bold font-serif text-[#ffc640]">
                  +{simPapers * simAvgCitations} Citations
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#c6c6cd] uppercase">Simulated Total</div>
                <div className="text-xl font-bold font-serif text-[#2fd9f4]">
                  {totalCitations + simPapers * simAvgCitations}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Research Collaboration Proposal */}
        <div className="p-5 rounded-2xl bg-[#122131] border border-[#273647] space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-[#2fd9f4] font-bold">
            <UserCheck className="w-4 h-4" />
            <span>SUBMIT RESEARCH COLLABORATION PROPOSAL</span>
          </div>
          <p className="text-[#c6c6cd] text-[11px]">
            Propose joint sponsored investigations, beamline experiments, or alloy development projects.
          </p>

          {collabSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-center space-y-1">
              <Check className="w-5 h-5 mx-auto text-emerald-400" />
              <div className="font-bold">Proposal Submitted!</div>
              <p className="text-[10px] text-emerald-400">Dr. Manoj Kumar and CSIR-IMMT team will review your proposal.</p>
            </div>
          ) : (
            <form onSubmit={handleCollabSubmit} className="space-y-2.5">
              <div>
                <input
                  type="text"
                  required
                  value={collabTitle}
                  onChange={(e) => setCollabTitle(e.target.value)}
                  placeholder="Project Title (e.g. SLM Inconel 718 Creep Behavior)"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  value={collabScope}
                  onChange={(e) => setCollabScope(e.target.value)}
                  placeholder="Collaborative scope, required equipment (SEM, EBSD, SLM), and timeline..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Collaboration Proposal</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Live Telemetry Activity Logs Streamer */}
      <section className="p-5 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-3 shadow-xl font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#d4e4fa] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ffc640]" />
            <span>System & Telemetry Audit Stream</span>
          </h2>
          <span className="text-[11px] text-[#2fd9f4]">{dbState.telemetryLogs.length} Events</span>
        </div>

        <div className="p-3 rounded-xl bg-[#051424] border border-[#273647] max-h-48 overflow-y-auto space-y-2 text-xs">
          {dbState.telemetryLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-2">No telemetry events logged yet.</div>
          ) : (
            dbState.telemetryLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-[#2fd9f4] shrink-0">[{log.timestamp}]</span>
                <span className="text-[#ffc640] uppercase shrink-0">[{log.category}]</span>
                <span className="text-[#d4e4fa]">{log.action}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
