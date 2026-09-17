import { useState, useMemo } from 'react';
import {
  paceFromTime, timeFromPace, speedKmh, fmtTime, riegel, riegelConfidence,
  splits, DISTANCES, SEC_PER_MILE, vo2maxCooper,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

const parseTime = str => {
  const parts = String(str).split(':').map(Number).filter(n => !Number.isNaN(n));
  if (!parts.length) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 60;
};

export default function RunningPace() {
  const [distance, setDistance] = useState('10K');
  const [custom, setCustom] = useState('');
  const [time, setTime] = useState('50:00');
  const [unitSystem, setUnitSystem] = useState('km');
  const [customUnit, setCustomUnit] = useState('km');   // custom distance unit

  const KM_PER_MILE = 1.609344;
  const km = custom !== ''
    ? (customUnit === 'mi' ? (+custom || 0) * KM_PER_MILE : +custom || 0)
    : DISTANCES.find(d => d.name === distance)?.km ?? 10;
  const seconds = parseTime(time);

  const r = useMemo(() => {
    const secPerKm = paceFromTime(seconds, km);
    const conf = DISTANCES.map(d => ({
      ...d,
      predicted: riegel(seconds, km, d.km),
      confidence: riegelConfidence(km, d.km),
    })).filter(d => Math.abs(d.km - km) > 0.01);
    return {
      secPerKm,
      secPerMile: SEC_PER_MILE(secPerKm),
      speed: speedKmh(secPerKm),
      splitRows: splits(seconds, km, km > 15 ? 5 : 1),
      predictions: conf,
    };
  }, [seconds, km]);

  const paceLabel = unitSystem === 'km'
    ? `${fmtTime(r.secPerKm)} /km`
    : `${fmtTime(r.secPerMile)} /mi`;

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your run">
          <Seg label="Pace shown in" value={unitSystem} onChange={setUnitSystem}
               options={[['km', 'Kilometres'], ['mi', 'Miles']]} />
          <Select label="Distance" value={distance}
                  onChange={v => { setDistance(v); setCustom(''); }}>
            {DISTANCES.map(d => (
              <option key={d.name} value={d.name}>{d.name} — {d.km} km</option>
            ))}
          </Select>
          <Num label="Or a custom distance" value={custom} onChange={setCustom}
               tag={customUnit} placeholder="—"
               min={0.1} max={customUnit === 'mi' ? 310 : 500} />
          <Seg label="Custom distance unit" value={customUnit} onChange={setCustomUnit}
               options={[['km', 'Kilometres'], ['mi', 'Miles']]} />
          <div className="field">
            <label htmlFor="rt">Finish time</label>
            <div className="unit">
              <input id="rt" type="text" inputMode="numeric" value={time}
                     onChange={e => setTime(e.target.value)} placeholder="mm:ss or h:mm:ss" />
            </div>
            <p className="hint">Enter as mm:ss or h:mm:ss — for example 50:00 or 1:45:30.</p>
          </div>
        </Panel>

        <Panel label="Pace & splits" dark>
          <BigStat value={paceLabel.split(' ')[0]}
                   unit={unitSystem === 'km' ? 'min / km' : 'min / mile'}
                   note={<>{km} km in <b>{fmtTime(seconds)}</b> — about
                     {' '}{r.speed.toFixed(1)} km/h.</>} />

          <div className="bartop tight">
            <span className="t">Even splits</span>
          </div>
          <div className="pcttable">
            {r.splitRows.map(s => (
              <div className="pctrow" key={s.km}>
                <span className="pp">{s.km}k</span>
                <span className="pw">{fmtTime(s.cumulative)}</span>
              </div>
            ))}
          </div>

          <div className="bartop">
            <span className="t">Predicted times at other distances</span>
          </div>
          <div className="fx-list compact">
            {r.predictions.map(p => (
              <div className={`fx ${p.confidence.level === 'poor' ? 'off' : ''}`} key={p.name}>
                <div className="fx-top">
                  <span className="fx-name">
                    {p.name}
                    {p.confidence.level === 'good' && <em className="fx-tag">Reliable</em>}
                    {p.confidence.level === 'poor' && <em className="fx-tag warn-tag">Rough</em>}
                  </span>
                  <span className="fx-val">{fmtTime(p.predicted)}</span>
                </div>
                <div className="fx-sub">
                  {fmtTime(paceFromTime(p.predicted, p.km))} /km · {p.confidence.note}
                </div>
              </div>
            ))}
          </div>

          <StatStrip items={[
            { label: 'Pace /km', value: fmtTime(r.secPerKm) },
            { label: 'Pace /mile', value: fmtTime(r.secPerMile) },
            { label: 'Speed', value: r.speed.toFixed(1), unit: 'km/h' },
            { label: 'Distance', value: km, unit: 'km' },
          ]} />

          <Method>
            <p>
              Predictions use the Riegel formula, which scales time by the distance ratio
              raised to the power 1.06. The exponent encodes the fact that pace slows as
              distance grows, and it was fitted to race data across a range of events.
            </p>
            <p>
              Its central assumption is that you have trained appropriately for the target
              distance. It cannot know whether you have done the long runs a marathon
              requires, which is why extrapolating from a 5K to a marathon is optimistic and
              flagged as rough here. Predictions between adjacent distances are considerably
              more trustworthy.
            </p>
            <p className="refs">
              Riegel PS, Athletic records and human endurance, American Scientist 1981
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
