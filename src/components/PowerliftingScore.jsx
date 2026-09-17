import { useState, useMemo } from 'react';
import { allScores, dotsBand, lbToKg, kgToLb, fmt } from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

export default function PowerliftingScore() {
  const [units, setUnits] = useState('kg');
  const [sex, setSex] = useState('male');
  const [equipment, setEquipment] = useState('classic');
  const [event, setEvent] = useState('full');
  const [bw, setBw] = useState('82.5');
  const [squat, setSquat] = useState('180');
  const [bench, setBench] = useState('120');
  const [dead, setDead] = useState('220');
  const [benchOnly, setBenchOnly] = useState('120');

  const toKg = v => (units === 'lb' ? lbToKg(+v || 0) : +v || 0);
  const bwKg = toKg(bw);
  const totalKg = event === 'bench'
    ? toKg(benchOnly)
    : toKg(squat) + toKg(bench) + toKg(dead);

  const switchUnits = to => {
    if (to === units) return;
    const c = v => String(Math.round((to === 'lb' ? kgToLb(+v || 0) : lbToKg(+v || 0)) * 10) / 10);
    setBw(c(bw)); setSquat(c(squat)); setBench(c(bench));
    setDead(c(dead)); setBenchOnly(c(benchOnly));
    setUnits(to);
  };

  const r = useMemo(() => {
    const scores = allScores({ totalKg, bodyweightKg: bwKg, sex, equipment, event });
    const primary = scores.find(s => s.key === 'dots');
    return { scores, primary, ratio: bwKg ? totalKg / bwKg : 0 };
  }, [totalKg, bwKg, sex, equipment, event]);

  const max = Math.max(...r.scores.map(s => s.value));

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your lifts">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['kg', 'Kilograms'], ['lb', 'Pounds']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />
          <div className="row2">
            <Select label="Equipment" value={equipment} onChange={setEquipment}>
              <option value="classic">Classic (raw)</option>
              <option value="equipped">Equipped</option>
            </Select>
            <Select label="Event" value={event} onChange={setEvent}>
              <option value="full">Full power</option>
              <option value="bench">Bench only</option>
            </Select>
          </div>
          <Num label="Bodyweight" value={bw} onChange={setBw} tag={units}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />

          <div className="subhead">Competition lifts <span>best successful attempt</span></div>
          {event === 'bench' ? (
            <Num label="Bench press" value={benchOnly} onChange={setBenchOnly} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
          ) : (
            <>
              <Num label="Squat" value={squat} onChange={setSquat} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
              <Num label="Bench press" value={bench} onChange={setBench} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
              <Num label="Deadlift" value={dead} onChange={setDead} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
              <div className="prescribe">
                <span className="pl">Total</span>
                <b>{fmt(units === 'lb' ? kgToLb(totalKg) : totalKg)} {units}</b>
                <span className="ps">{r.ratio.toFixed(2)}× bodyweight</span>
              </div>
            </>
          )}
        </Panel>

        <Panel label="Relative strength score" dark>
          {r.primary ? (
            <>
              <BigStat value={r.primary.value.toFixed(1)} unit="DOTS"
                       note={<><b>{dotsBand(r.primary.value)}</b> range — DOTS is the current
                         standard for most federations outside the IPF.</>} />

              <div className="bartop tight">
                <span className="t">All three systems</span>
              </div>
              <div className="fx-list">
                {r.scores.map(s => (
                  <div className={`fx ${s.key === 'dots' ? 'on' : ''} ${s.status === 'legacy' ? 'legacy' : ''}`}
                       key={s.key}>
                    <div className="fx-top">
                      <span className="fx-name">
                        {s.name}
                        {s.key === 'dots' && <em className="fx-tag">Default</em>}
                        {s.status === 'legacy' && <em className="fx-tag warn-tag">Legacy</em>}
                      </span>
                      <span className="fx-val">{s.value.toFixed(1)}</span>
                    </div>
                    <div className="fx-track">
                      <i style={{ width: `${Math.min(100, (s.value / max) * 100)}%` }} />
                    </div>
                    <div className="fx-sub">{s.note}</div>
                  </div>
                ))}
              </div>

              <StatStrip items={[
                { label: 'Total', value: fmt(units === 'lb' ? kgToLb(totalKg) : totalKg), unit: units },
                { label: 'Bodyweight', value: bw, unit: units },
                { label: '× bodyweight', value: r.ratio.toFixed(2) },
                { label: 'Band', value: dotsBand(r.primary.value) },
              ]} />

              <p className="foot-note">
                Note that IPF GL points are on a different scale entirely — roughly 100
                represents an elite result, where DOTS and Wilks both run in the hundreds.
                Compare each system only against itself.
              </p>

              <Method>
                <p>
                  <strong>DOTS</strong> (Konertz, 2019) was built on modern competition data
                  to correct known biases in Wilks at very light and very heavy bodyweights.
                  USPA, WRPF and others adopted it from 2020.
                </p>
                <p>
                  <strong>IPF GL Points</strong> became the IPF's official system on
                  1 May 2020, replacing IPF Points. It uses separate coefficients for each
                  combination of sex, equipment and event.
                </p>
                <p>
                  <strong>Wilks</strong> was the global standard for roughly 25 years and is
                  shown here as legacy, because many older records and personal benchmarks
                  are still expressed in it. If your federation has not specified a system,
                  DOTS is the safer modern default.
                </p>
                <p className="refs">
                  IPF GL coefficients, International Powerlifting Federation (2020) ·
                  Konertz T, DOTS (2019) · Wilks R (1994)
                </p>
              </Method>
            </>
          ) : (
            <p className="goaltag">Enter a bodyweight and your lifts to begin.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
