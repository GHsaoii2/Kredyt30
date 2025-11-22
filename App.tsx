
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { LoanParams, LoanResult, InstallmentType, LoanReportData } from './types';
import { getFinancialAdvice } from './services/geminiService';

// --- Icons ---
const Icons = {
  ChartPie: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Calculator: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22.38a2 2 0 0 0-2.73.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  TrendingDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
};

// --- Components ---

const SliderInput = ({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (val: number) => void }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <span className="text-lg font-bold text-slate-800 tabular-nums">{value.toLocaleString()} <span className="text-xs font-normal text-slate-400">{unit}</span></span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

const Markdown = ({ children }: { children: string }) => (
    <div>
        {children.split('\n').map((line, i) => (
            <p key={i} className={`mb-2 leading-relaxed ${line.startsWith('-') ? 'pl-4' : ''}`}>{line}</p>
        ))}
    </div>
);

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-4 flex justify-between items-center bg-white/50 hover:bg-white/80 transition-colors"
      >
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{title}</h3>
        <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown />
        </div>
      </button>
      <div className={`grid transition-grid ${isOpen ? 'grid-rows-1 opacity-100' : 'grid-rows-0 opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'settings'>('dashboard');
  const [apiUrl, setApiUrl] = useState<string>(() => localStorage.getItem('gas_api_url') || '');
  const [reportData, setReportData] = useState<LoanReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulator State (Initialized with defaults, updated by API if available)
  const [simAmount, setSimAmount] = useState<number>(300000);
  const [simMonths, setSimMonths] = useState<number>(300);
  const [simRate, setSimRate] = useState<number>(7.5);
  const [simType, setSimType] = useState<InstallmentType>(InstallmentType.EQUAL);
  
  // AI Advice State
  const [advice, setAdvice] = useState<string>("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!apiUrl) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const separator = apiUrl.includes('?') ? '&' : '?';
      const targetUrl = `${apiUrl}${separator}path=/api/report/json`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data: LoanReportData = await response.json();
      setReportData(data);
      
      // Sync simulator with real data
      setSimAmount(data.remainingLoan);
      setSimMonths(data.monthsRemaining);
      setSimRate(data.wibor3m + 2.09); // Assuming margin from script logic or ~2%
      
      localStorage.setItem('gas_api_url', apiUrl);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać danych. Sprawdź link do Web App.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && apiUrl && !reportData) {
      fetchData();
    }
  }, [activeTab, apiUrl]);

  // --- Simulator Calculations ---
  const simResult: LoanResult = useMemo(() => {
    const r = simRate / 100 / 12;
    let totalInterest = 0;
    let schedule = [];
    let currentPrincipal = simAmount;

    if (simType === InstallmentType.EQUAL) {
      const pmt = simAmount * r * Math.pow(1 + r, simMonths) / (Math.pow(1 + r, simMonths) - 1);
      for (let i = 1; i <= simMonths; i++) {
        const interestPart = currentPrincipal * r;
        const principalPart = pmt - interestPart;
        currentPrincipal -= principalPart;
        totalInterest += interestPart;
        schedule.push({
          month: i, interest: interestPart, principal: principalPart, balance: Math.max(0, currentPrincipal), payment: pmt
        });
      }
      return { monthlyPayment: pmt, totalInterest, totalCost: simAmount + totalInterest, schedule };
    } else {
      const principalPart = simAmount / simMonths;
      for (let i = 1; i <= simMonths; i++) {
        const interestPart = currentPrincipal * r;
        const payment = principalPart + interestPart;
        currentPrincipal -= principalPart;
        totalInterest += interestPart;
        schedule.push({
          month: i, interest: interestPart, principal: principalPart, balance: Math.max(0, currentPrincipal), payment: payment
        });
      }
      return { monthlyPayment: schedule[0].payment, totalInterest, totalCost: simAmount + totalInterest, schedule };
    }
  }, [simAmount, simMonths, simRate, simType]);

  const handleAskAI = async () => {
    setIsLoadingAdvice(true);
    const adviceText = await getFinancialAdvice({ amount: simAmount, months: simMonths, rate: simRate, type: simType }, simResult);
    setAdvice(adviceText);
    setIsLoadingAdvice(false);
  };

  // --- Helpers ---
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercent = (value: number, total: number) => {
      if (total === 0) return '0%';
      return ((value / total) * 100).toFixed(1) + '%';
  };

  const renderDashboard = () => {
    if (!apiUrl) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          <Icons.Settings />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Skonfiguruj Źródło Danych</h2>
        <p className="text-slate-500 mb-6 max-w-sm">Aby zobaczyć swój raport, podaj URL do wdrożonego Google Apps Script (Web App).</p>
        <button onClick={() => setActiveTab('settings')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
          Przejdź do Ustawień
        </button>
      </div>
    );

    if (loading && !reportData) return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="h-8 w-8 bg-indigo-600 rounded-full animate-ping mb-4"></div>
        <span className="text-slate-500 font-medium">Pobieranie danych...</span>
      </div>
    );

    if (error) return (
      <div className="p-6 text-center animate-fade-in">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 mb-4">
          {error}
        </div>
        <button onClick={fetchData} className="text-indigo-600 font-medium flex items-center justify-center gap-2 mx-auto">
          <Icons.Refresh /> Spróbuj ponownie
        </button>
      </div>
    );

    if (!reportData) return null;

    // Process Data
    const historyData = reportData.history.slice().reverse().map(item => ({
      date: item[0],
      wibor: item[1]
    }));

    const fraChartData = reportData.fraProjections.map(item => ({
      label: item[0],
      rata: item[1]
    }));

    const diff = reportData.installmentDiff;
    const totalInstallment = reportData.installmentParts.interest + reportData.installmentParts.principal;
    
    // Calculate End Date
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + reportData.monthsRemaining, 1);
    const endDateStr = endDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <div className="flex justify-between items-center px-2">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">Raport Kredytowy</h2>
             <p className="text-xs text-slate-400">Aktualizacja: {reportData.asOf}</p>
           </div>
           <button onClick={fetchData} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-indigo-600 transition-colors">
             <Icons.Refresh />
           </button>
        </div>

        {/* NEW Summary Card Design */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden border-t-4 border-indigo-500 shadow-xl shadow-indigo-50">
          
          {/* Header: WIBOR & Date */}
          <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full tracking-wide">WSKAŹNIK BAZOWY</span>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-extrabold text-slate-800">{reportData.wibor3m.toFixed(2)}%</span>
                 <span className="text-sm font-medium text-slate-400">WIBOR 3M</span>
               </div>
             </div>
             <div className="text-right">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Koniec Kredytu</div>
               <div className="text-sm font-bold text-slate-700">{endDateStr}</div>
               <div className="text-xs text-slate-400">pozostało {reportData.monthsRemaining} rat</div>
             </div>
          </div>

          {/* Main Content: Installment Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6 relative">
            {/* Vertical Divider (Visual only) */}
            <div className="absolute left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent -translate-x-1/2"></div>

            <div className="pr-2">
               <p className="text-xs font-semibold text-slate-500 mb-1">Obecna Rata</p>
               <p className="text-xl lg:text-2xl font-bold text-slate-700 tracking-tight">{formatCurrency(reportData.currentInstallment)}</p>
            </div>
            
            <div className="pl-2">
               <p className="text-xs font-semibold text-indigo-600 mb-1">Prognoza</p>
               <p className="text-xl lg:text-2xl font-bold text-indigo-600 tracking-tight">{formatCurrency(reportData.newInstallment)}</p>
            </div>
          </div>

          {/* Footer: Difference */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
             <span className="text-xs font-bold text-slate-500 uppercase">Przewidywana zmiana</span>
             <span className={`text-lg font-bold flex items-center gap-1 ${diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
             </span>
          </div>
        </div>

        {/* Collapsible: Repayment Progress */}
        <CollapsibleSection title="Postęp Spłaty" defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
               <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Start</div>
               <div className="font-bold text-slate-600 text-xs lg:text-sm truncate">{formatCurrency(reportData.initialLoan)}</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
               <div className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Spłacono</div>
               <div className="font-bold text-indigo-700 text-xs lg:text-sm truncate">{formatCurrency(reportData.capitalPaid)}</div>
            </div>
             <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
               <div className="text-[10px] text-orange-400 uppercase font-bold mb-1">Pozostało</div>
               <div className="font-bold text-orange-700 text-xs lg:text-sm truncate">{formatCurrency(reportData.remainingLoan)}</div>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex justify-between mb-2 items-end">
               <span className="text-xs font-bold text-slate-400">0%</span>
               <span className="text-2xl font-bold text-slate-800">{reportData.capitalPaidPct.toFixed(1)}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${reportData.capitalPaidPct}%` }}
              ></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Collapsible: Installment Structure */}
        <CollapsibleSection title="Struktura Raty">
           <div className="flex flex-col items-center">
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Odsetki', value: reportData.installmentParts.interest },
                          { name: 'Kapitał', value: reportData.installmentParts.principal }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        <Cell fill="#F59E0B" />
                        <Cell fill="#4F46E5" />
                      </Pie>
                      <Tooltip 
                        formatter={(value:number) => [formatCurrency(value), '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="w-full grid grid-cols-2 gap-3 mt-2">
                 {/* Interest */}
                 <div className="flex flex-col items-center p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm"></span> Odsetki
                    </div>
                    <span className="text-xl font-bold text-slate-800 tabular-nums mb-1">{formatCurrency(reportData.installmentParts.interest)}</span>
                    <span className="text-xs font-semibold text-orange-400 bg-orange-100 px-2 py-0.5 rounded-md">
                        {formatPercent(reportData.installmentParts.interest, totalInstallment)}
                    </span>
                 </div>
                 {/* Principal */}
                 <div className="flex flex-col items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm"></span> Kapitał
                    </div>
                    <span className="text-xl font-bold text-slate-800 tabular-nums mb-1">{formatCurrency(reportData.installmentParts.principal)}</span>
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-md">
                        {formatPercent(reportData.installmentParts.principal, totalInstallment)}
                    </span>
                 </div>
               </div>
            </div>
        </CollapsibleSection>

        {/* Collapsible: WIBOR History */}
        <CollapsibleSection title="Historia WIBOR 3M (30 dni)">
          {/* Chart */}
          <div className="h-48 w-full mb-8">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={historyData}>
                 <defs>
                   <linearGradient id="colorWibor" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                 <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94A3B8'}} tickMargin={10} interval="preserveStartEnd" minTickGap={30} />
                 <YAxis domain={['auto', 'auto']} hide />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   itemStyle={{ color: '#4F46E5', fontWeight: 600 }}
                 />
                 <Area type="monotone" dataKey="wibor" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorWibor)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>

          {/* Recent Readings Table */}
          <div className="overflow-hidden rounded-xl border border-slate-100">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                 <tr>
                   <th className="px-4 py-3 font-medium">Data</th>
                   <th className="px-4 py-3 font-medium text-center">WIBOR 3M (%)</th>
                   <th className="px-4 py-3 font-medium text-right">Zmiana</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {reportData.history.slice(0, 5).map((row, idx) => {
                   const change = row[2];
                   return (
                   <tr key={idx} className="hover:bg-slate-50/50">
                     <td className="px-4 py-3 font-medium text-slate-700">{row[0]}</td>
                     <td className="px-4 py-3 text-center tabular-nums font-bold text-slate-800">{row[1].toFixed(2)}%</td>
                     <td className={`px-4 py-3 text-right font-semibold tabular-nums ${change > 0 ? 'text-rose-600' : change < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                       {change > 0 ? '+' : ''}{change.toFixed(2)}
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
          </div>
        </CollapsibleSection>

        {/* Collapsible: FRA Projections */}
        <CollapsibleSection title="Prognozy FRA (Rata)">
          {/* Chart */}
          <div className="h-48 w-full mb-8">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={fraChartData}>
                 <defs>
                   <linearGradient id="colorFra" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                 <XAxis dataKey="label" tick={{fontSize: 10, fill: '#94A3B8'}} tickMargin={10} interval={0} />
                 <YAxis domain={['auto', 'auto']} hide />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   itemStyle={{ color: '#4F46E5', fontWeight: 600 }}
                   formatter={(value: number) => [formatCurrency(value), 'Rata']}
                 />
                 <Area type="monotone" dataKey="rata" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorFra)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-100">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                 <tr>
                   <th className="px-4 py-3 font-medium">Miesiąc</th>
                   <th className="px-4 py-3 font-medium text-right">Prognoza</th>
                   <th className="px-4 py-3 font-medium text-right">Zmiana</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {reportData.fraProjections.map((row, idx) => (
                   <tr key={idx} className="hover:bg-slate-50/50">
                     <td className="px-4 py-3 font-medium text-slate-700">{row[0]}</td>
                     <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-800">{formatCurrency(row[1])}</td>
                     <td className={`px-4 py-3 text-right font-semibold tabular-nums ${row[2] > 0 ? 'text-rose-600' : row[2] < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                       {row[2] > 0 ? '+' : ''}{formatCurrency(row[2])}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </CollapsibleSection>
      </div>
    );
  };

  const renderSimulator = () => {
    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 px-2">Symulator</h2>
        
        <div className="glass-card p-6 rounded-2xl space-y-6">
           <SliderInput label="Kwota Kredytu" value={simAmount} min={10000} max={2000000} step={5000} unit="zł" onChange={setSimAmount} />
           <SliderInput label="Okres Spłaty" value={simMonths} min={12} max={420} step={12} unit="m-cy" onChange={setSimMonths} />
           <div className="text-right -mt-4 text-xs font-medium text-indigo-600">{(simMonths/12).toFixed(1)} lat</div>
           <SliderInput label="Oprocentowanie" value={simRate} min={1} max={15} step={0.1} unit="%" onChange={setSimRate} />
           
           <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
             {[InstallmentType.EQUAL, InstallmentType.DECREASING].map((t) => (
               <button
                 key={t}
                 onClick={() => setSimType(t)}
                 className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${simType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
               >
                 {t === 'equal' ? 'Równe' : 'Malejące'}
               </button>
             ))}
           </div>
        </div>

        <div className="glass-card p-6 rounded-2xl bg-slate-900 text-white border-slate-800">
           <div className="text-center">
             <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Miesięczna Rata</div>
             <div className="text-4xl font-bold mb-6">{formatCurrency(simResult.monthlyPayment)}</div>
             
             <div className="grid grid-cols-2 gap-4 text-left">
               <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                 <div className="text-xs text-slate-400 mb-1">Całkowity Koszt</div>
                 <div className="font-semibold">{formatCurrency(simResult.totalCost)}</div>
               </div>
               <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                 <div className="text-xs text-slate-400 mb-1">Suma Odsetek</div>
                 <div className="font-semibold text-orange-400">{formatCurrency(simResult.totalInterest)}</div>
               </div>
             </div>
           </div>
        </div>

        {/* AI Advice */}
        <div className="glass-card p-6 rounded-2xl border-indigo-100">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white text-xs">AI</span>
             Analiza Asystenta
           </h3>
           {!advice ? (
             <button 
               onClick={handleAskAI}
               disabled={isLoadingAdvice}
               className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-medium transition-colors"
             >
               {isLoadingAdvice ? 'Analizuję...' : 'Pobierz Analizę AI'}
             </button>
           ) : (
             <div className="prose prose-sm prose-indigo text-slate-600">
               <Markdown>{advice}</Markdown>
               <button onClick={() => setAdvice("")} className="text-xs text-indigo-600 mt-4 underline">Zresetuj</button>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 px-2">Ustawienia</h2>
      <div className="glass-card p-6 rounded-2xl">
        <label className="block text-sm font-medium text-slate-700 mb-2">URL skryptu Google Apps Script</label>
        <p className="text-xs text-slate-500 mb-4">Wklej tutaj link do Web App (powinien kończyć się na /exec)</p>
        <input 
          type="text" 
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/.../exec"
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-4"
        />
        <button 
          onClick={() => {
            localStorage.setItem('gas_api_url', apiUrl);
            setActiveTab('dashboard');
          }}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium"
        >
          Zapisz i Wróć
        </button>
      </div>
      <div className="text-center text-xs text-slate-400 px-8">
        Upewnij się, że skrypt jest wdrożony jako "Web App" z dostępem "Anyone" (lub zaloguj się w tej samej przeglądarce).
      </div>
    </div>
  );

  return (
    <div className="min-h-screen safe-top safe-bottom text-slate-800">
      {/* Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6 lg:py-10">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'simulator' && renderSimulator()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Bottom Navigation (Glassmorphism) */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-3xl mx-auto glass rounded-2xl shadow-2xl shadow-indigo-900/10 p-2 flex justify-between items-center z-50 md:bottom-10">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Icons.ChartPie />
          <span className="text-[10px] font-semibold mt-1">Raport</span>
        </button>
        <button 
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${activeTab === 'simulator' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Icons.Calculator />
          <span className="text-[10px] font-semibold mt-1">Symulacja</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Icons.Settings />
          <span className="text-[10px] font-semibold mt-1">Opcje</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
