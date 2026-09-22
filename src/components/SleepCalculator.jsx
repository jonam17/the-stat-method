import { useState, useMemo, useEffect } from 'react';
import {
  bedtimesForWake, wakeTimesForBed, sleepNeedFor, CYCLE_MINUTES, FALL_ASLEEP_MINUTES,
} from '../engine/index.js';
import { Seg, Num, Panel, BigStat, StatStrip, Method , TimePicker } from './ToolShell.jsx';
import { ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

const fmtClock = d => {
  // Format from the Date's local clock fields rather than Intl's default
  // timezone. The Date is constructed from local wall-clock inputs, so these
  // fields are identical on the server and browser during hydration.
  const h24 = d.getHours();
  const h = h24 % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} ${h24 >= 12 ? 'PM' : 'AM'}`;
};
const fmtDur = mins => `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim();

export default function SleepCalculator() {
  const [mode, setMode] = useState('wake');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [latency, setLatency] = useState(String(FALL_ASLEEP_MINUTES));
  const [age, setAge] = useState('30');
  const [useNow, setUseNow] = useState('no');
  // Avoid server/client hydration drift from reading the wall clock during render.
  const [nowMs, setNowMs] = useState(null);
  useEffect(() => setNowMs(Date.now()), []);

  const parse = (t, base = new Date()) => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const r = useMemo(() => {
    const lat = Math.max(0, Math.min(60, +latency || 0));
    if (mode === 'wake') {
      const wake = parse(wakeTime);
      // Use the captured client time only after hydration; the deterministic
      // pre-hydration render must not depend on the server/client clock.
      if (nowMs != null && wake < new Date(nowMs)) wake.setDate(wake.getDate() + 1);
      return { rows: bedtimesForWake(wake, [6, 5, 4, 3], lat), anchor: wake, lat };
    }
    const bed = useNow === 'yes'
      ? (nowMs != null ? new Date(nowMs) : parse(bedTime))
      : parse(bedTime);
    return { rows: wakeTimesForBed(bed, [6, 5, 4, 3], lat), anchor: bed, lat };
  }, [mode, wakeTime, bedTime, latency, useNow, nowMs]);

  const need = sleepNeedFor(+age || 30);
  const best = r.rows.find(x => x.cycles === 5) ?? r.rows[0];

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your schedule">
          <Seg label="I want to" value={mode} onChange={setMode}
               options={[['wake', 'Wake at a time'], ['bed', 'Go to bed at a time']]} />

          {mode === 'wake' ? (
            <TimePicker id="wt" label="Wake up at" value={wakeTime} onChange={setWakeTime} />
          ) : (
            <>
              <Seg label="Bedtime" value={useNow} onChange={setUseNow}
                   options={[['no', 'A set time'], ['yes', 'Right now']]} />
              {useNow === 'no' && (
                <TimePicker id="bt" label="Go to bed at" value={bedTime} onChange={setBedTime} />
              )}
            </>
          )}

          <div className="row2">
            <Num label="Time to fall asleep" value={latency} onChange={setLatency} tag="min"
                 hint="Fifteen minutes is typical."
                 min={0} max={180} />
            <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
          </div>

          <p className="hint">
            Guidance for your age group is <strong>{need.hours} hours</strong> per night.
            Total sleep and a consistent schedule both matter more than landing exactly on a
            cycle boundary.
          </p>
        </Panel>

        <Panel label={mode === 'wake' ? 'When to go to bed' : 'When to wake up'} dark
               notice={(() => {
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          <BigStat
            value={fmtClock(mode === 'wake' ? best.bedtime : best.wakeAt)}
            unit={mode === 'wake' ? 'suggested bedtime' : 'suggested wake time'}
            note={<>Gives <b>{fmtDur(best.sleepMinutes)}</b> of sleep across
              {' '}{best.cycles} cycles, plus {r.lat} minutes to fall asleep.</>} />

          <div className="bartop tight">
            <span className="t">All options</span>
            <span className="total-badge">
              <span className="kk">Target</span><b>{need.hours} h</b>
            </span>
          </div>

          <div className="fx-list">
            {r.rows.map(row => (
              <div className={`fx ${row.cycles === 5 ? 'on' : ''} ${row.quality === 'very short' ? 'off' : ''}`}
                   key={row.cycles}>
                <div className="fx-top">
                  <span className="fx-name">
                    {row.cycles} cycles
                    {row.cycles === 5 && <em className="fx-tag">Recommended</em>}
                    {row.quality === 'very short' && <em className="fx-tag warn-tag">Very short</em>}
                  </span>
                  <span className="fx-val">
                    {fmtClock(mode === 'wake' ? row.bedtime : row.wakeAt)}
                  </span>
                </div>
                <div className="fx-track">
                  <i style={{ width: `${(row.cycles / 6) * 100}%` }} />
                </div>
                <div className="fx-sub">{fmtDur(row.sleepMinutes)} of sleep</div>
              </div>
            ))}
          </div>

          <StatStrip items={[
            { label: 'Cycle length', value: CYCLE_MINUTES, unit: 'min' },
            { label: 'Fall asleep', value: r.lat, unit: 'min' },
            { label: 'Age guidance', value: need.hours, unit: 'h' },
            { label: 'Best option', value: fmtDur(best.sleepMinutes) },
          ]} />

          <Method>
            <p>
              The ninety-minute cycle is an <strong>average</strong>. Real cycles run
              roughly seventy to a hundred and twenty minutes, vary within a single night,
              and differ between people. Waking between cycles rather than mid-cycle tends
              to feel easier, which is what these times aim at — but the effect is a nudge,
              not a guarantee.
            </p>
            <p>
              Two things matter more than cycle timing: getting enough total sleep, and going
              to bed and waking at consistent times. A regular seven hours generally beats an
              erratic nine, and no amount of cycle math compensates for a schedule that
              moves around every night.
            </p>
            <p className="refs">
              Cycle structure per standard sleep physiology · duration guidance from the
              National Sleep Foundation consensus recommendations
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
