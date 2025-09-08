
'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { appointmentAPI } from '@/lib/api-services';
import { CalendarDays, Clock, PlusCircle, Trash2, Save, ChevronLeft, ChevronRight, Settings2, Info, CheckCircle2, XCircle } from 'lucide-react';

type TimeRange = { from: string; to: string };
type WeeklySchedule = Record<number, TimeRange[]>; // 0=Sun..6=Sat
type OverrideItem = { date: string; type: 'unavailable' | 'custom'; ranges?: TimeRange[] };

function pad(n: number) { return n.toString().padStart(2, '0'); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function dayOfWeek(dateStr: string) { const d = new Date(dateStr + 'T00:00:00'); return d.getDay(); }
function validRange(r: TimeRange) { return r.from < r.to; }

const weekdayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DoctorSchedulePage() {
  const [doctorUsername, setDoctorUsername] = React.useState<string | null>(null);
  const [appointments, setAppointments] = React.useState<Array<{ appointmentId: string; appointmentTime: string }>>([]);

  // Load doctor username from global auth broadcast
  React.useEffect(() => {
    const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { username?: string } } };
    const candidate = w.__HOSPILINK_AUTH__?.user?.username;
    if (candidate) setDoctorUsername(String(candidate));
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user?: { username?: string } } | undefined;
      if (detail?.user?.username) setDoctorUsername(String(detail.user.username));
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  // Fetch appointments for calendar overlay
  React.useEffect(() => {
    if (!doctorUsername) return;
    (async () => {
      try {
        const list = await appointmentAPI.getDoctorAppointments(doctorUsername);
        setAppointments(list.map(a => ({ appointmentId: a.appointmentId, appointmentTime: a.appointmentTime })));
      } catch { setAppointments([]); }
    })();
  }, [doctorUsername]);

  // Local persistence key
  const storageKey = React.useMemo(() => doctorUsername ? `doctorSchedule:${doctorUsername}` : null, [doctorUsername]);

  // State: weekly schedule + overrides
  const [weekly, setWeekly] = React.useState<WeeklySchedule>(() => ({ 0: [],1: [],2: [],3: [],4: [],5: [],6: [] }));
  const [overrides, setOverrides] = React.useState<OverrideItem[]>([]);
  const [saveState, setSaveState] = React.useState<'idle'|'saving'|'saved'|'error'>('idle');

  // Load from storage when key is ready
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw) as { weekly: WeeklySchedule; overrides: OverrideItem[] };
        setWeekly({ 0: data.weekly[0]||[],1: data.weekly[1]||[],2: data.weekly[2]||[],3: data.weekly[3]||[],4: data.weekly[4]||[],5: data.weekly[5]||[],6: data.weekly[6]||[] });
        setOverrides(Array.isArray(data.overrides) ? data.overrides : []);
      }
    } catch {}
  }, [storageKey]);

  const saveToStorage = React.useCallback(() => {
    if (!storageKey) return;
    try {
      setSaveState('saving');
      localStorage.setItem(storageKey, JSON.stringify({ weekly, overrides }));
      setTimeout(() => setSaveState('saved'), 300);
      setTimeout(() => setSaveState('idle'), 1500);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 1500);
    }
  }, [storageKey, weekly, overrides]);

  // Availability preview for a selected date
  const [previewDate, setPreviewDate] = React.useState<string>(() => ymd(new Date()));
  const previewAvailability = React.useMemo(() => {
    const ov = overrides.find(o => o.date === previewDate);
    if (ov) {
      if (ov.type === 'unavailable') return [] as TimeRange[];
      return (ov.ranges || []).filter(validRange);
    }
    const dow = dayOfWeek(previewDate);
    return (weekly[dow] || []).filter(validRange);
  }, [previewDate, overrides, weekly]);

  // Calendar month view
  const [month, setMonth] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const monthLabel = month.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const daysGrid = React.useMemo(() => {
    const firstDayIdx = month.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
    const grid: Array<{ dateStr: string | null }> = [];
    for (let i=0;i<firstDayIdx;i++) grid.push({ dateStr: null });
    for (let d=1; d<=daysInMonth; d++) grid.push({ dateStr: ymd(new Date(month.getFullYear(), month.getMonth(), d)) });
    while (grid.length % 7 !== 0) grid.push({ dateStr: null });
    return grid;
  }, [month]);

  // Appointment counts per day
  const apptCountByDate = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      const ds = a.appointmentTime.replace(' ', 'T');
      const d = new Date(ds);
      if (isNaN(d.getTime())) continue;
      const key = ymd(d);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [appointments]);

  const addRange = (day: number) => setWeekly(w => ({ ...w, [day]: [...(w[day]||[]), { from: '09:00', to: '17:00' }] }));
  const updateRange = (day: number, idx: number, key: 'from'|'to', value: string) => setWeekly(w => ({ ...w, [day]: w[day].map((r,i) => i===idx ? { ...r, [key]: value } : r) }));
  const removeRange = (day: number, idx: number) => setWeekly(w => ({ ...w, [day]: w[day].filter((_,i) => i!==idx) }));

  const addOverride = () => setOverrides(list => [...list, { date: ymd(new Date()), type: 'unavailable' }]);
  const updateOverride = (idx: number, patch: Partial<OverrideItem>) => setOverrides(list => list.map((o,i) => i===idx ? { ...o, ...patch } : o));
  const ensureOverrideRange = (idx: number) => setOverrides(list => list.map((o,i) => i===idx ? { ...o, ranges: o.ranges && o.ranges.length ? o.ranges : [{ from: '09:00', to: '17:00' }] } : o));
  const updateOverrideRange = (idx: number, rIdx: number, key: 'from'|'to', value: string) => setOverrides(list => list.map((o,i) => i===idx ? { ...o, ranges: (o.ranges||[]).map((r,j)=> j===rIdx ? { ...r, [key]: value } : r) } : o));
  const addOverrideRange = (idx: number) => setOverrides(list => list.map((o,i) => i===idx ? { ...o, ranges: [ ...(o.ranges||[]), { from: '09:00', to: '17:00' } ] } : o));
  const removeOverrideRange = (idx: number, rIdx: number) => setOverrides(list => list.map((o,i) => i===idx ? { ...o, ranges: (o.ranges||[]).filter((_,j)=> j!==rIdx) } : o));
  const removeOverride = (idx: number) => setOverrides(list => list.filter((_,i) => i!==idx));

  // Tabs
  type TabKey = 'weekly'|'overrides'|'calendar';
  const [tab, setTab] = React.useState<TabKey>('weekly');
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'weekly', label: 'Weekly Schedule' },
    { key: 'overrides', label: 'Date Overrides' },
    { key: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-sm text-gray-600">Set your availability and manage time slots</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={saveToStorage} className="inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Save
          </Button>
          {saveState === 'saving' && <span className="text-sm text-gray-500">Saving…</span>}
          {saveState === 'saved' && <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" />Saved</span>}
          {saveState === 'error' && <span className="inline-flex items-center gap-1 text-red-600 text-sm"><XCircle className="w-4 h-4" />Failed</span>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2 inline-flex gap-1">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-md text-sm ${tab===t.key?'bg-blue-600 text-white':'text-gray-700 hover:bg-gray-50'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'weekly' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekdayLabels.map((label, dayIdx) => (
              <div key={dayIdx} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-2 text-gray-900 font-semibold"><Clock className="w-4 h-4" /> {label}</div>
                  <Button size="sm" variant="ghost" onClick={() => addRange(dayIdx)} className="inline-flex items-center gap-1"><PlusCircle className="w-4 h-4" />Add</Button>
                </div>
                {(weekly[dayIdx] || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No availability</p>
                ) : (
                  <div className="space-y-2">
                    {weekly[dayIdx].map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="time" value={r.from} onChange={(e) => updateRange(dayIdx, idx, 'from', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <span className="text-gray-500">to</span>
                        <input type="time" value={r.to} onChange={(e) => updateRange(dayIdx, idx, 'to', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <button onClick={() => removeRange(dayIdx, idx)} className="ml-auto inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"><Trash2 className="w-4 h-4" />Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Times are in your local timezone.</div>
        </div>
      )}

      {tab === 'overrides' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-gray-900 font-semibold"><Settings2 className="w-4 h-4" /> Date Overrides</div>
            <Button size="sm" onClick={addOverride} className="inline-flex items-center gap-1"><PlusCircle className="w-4 h-4" />Add Date</Button>
          </div>
          {overrides.length === 0 ? (
            <p className="text-sm text-gray-500">No overrides yet. Add a date to block off or customize availability.</p>
          ) : (
            <div className="space-y-3">
              {overrides.map((o, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Date</label>
                      <input type="date" value={o.date} onChange={(e)=>updateOverride(idx,{ date: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Type</label>
                      <select
                        value={o.type}
                        onChange={(e)=>{ const v = e.target.value as OverrideItem['type']; updateOverride(idx,{ type: v }); if (v==='custom') ensureOverrideRange(idx); }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="unavailable">Unavailable (block entire day)</option>
                        <option value="custom">Custom availability</option>
                      </select>
                    </div>
                    <button onClick={()=>removeOverride(idx)} className="md:ml-auto inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"><Trash2 className="w-4 h-4" />Remove</button>
                  </div>
          {o.type === 'custom' && (
                    <div className="mt-3 space-y-2">
            {((o.ranges && o.ranges.length ? o.ranges : [{ from: '09:00', to: '17:00' }]) as TimeRange[]).map((r, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-2">
                          <input type="time" value={r.from} onChange={(e)=>updateOverrideRange(idx, rIdx, 'from', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                          <span className="text-gray-500">to</span>
                          <input type="time" value={r.to} onChange={(e)=>updateOverrideRange(idx, rIdx, 'to', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                          <button onClick={()=>removeOverrideRange(idx, rIdx)} className="ml-auto inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"><Trash2 className="w-4 h-4" />Remove</button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={()=>addOverrideRange(idx)} className="inline-flex items-center gap-1"><PlusCircle className="w-4 h-4" />Add window</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 font-semibold text-gray-900"><CalendarDays className="w-5 h-5" /> {monthLabel}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={()=> setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={()=> setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {weekdayLabels.map((w) => (
              <div key={w} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-600">{w}</div>
            ))}
            {daysGrid.map((cell, i) => {
              const isEmpty = !cell.dateStr;
              const count = cell.dateStr ? (apptCountByDate.get(cell.dateStr) || 0) : 0;
              const ov = cell.dateStr ? overrides.find(o => o.date === cell.dateStr) : undefined;
              const dow = cell.dateStr ? dayOfWeek(cell.dateStr) : 0;
              const hasWeekly = cell.dateStr ? (weekly[dow] || []).length > 0 : false;
              return (
                <div key={i} className={`min-h-[84px] bg-white p-2 ${isEmpty ? 'opacity-50' : ''}`}>
                  {!isEmpty && (
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium text-gray-900">{cell.dateStr!.split('-')[2]}</div>
                      {ov ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ov.type==='unavailable'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                          {ov.type==='unavailable' ? 'Blocked' : 'Custom'}
                        </span>
                      ) : hasWeekly ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Weekly</span>
                      ) : null}
                    </div>
                  )}
                  {!isEmpty && count > 0 && (
                    <div className="mt-3 text-[11px] text-gray-600">{count} appointment{count>1?'s':''}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Preview date</label>
                <input type="date" value={previewDate} onChange={(e)=> setPreviewDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
              <div className="text-sm text-gray-600">
                Availability: {previewAvailability.length === 0 ? (
                  <span className="text-red-600 font-medium">Unavailable</span>
                ) : (
                  <span className="inline-flex flex-wrap gap-2">
                    {previewAvailability.map((r,i)=>(<span key={i} className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">{r.from} - {r.to}</span>))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 inline-flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Stored locally for now. Provide backend endpoints to persist.</div>
    </div>
  );
}
