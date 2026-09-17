import { useState, useMemo } from 'react';
import { plateLoad, percentageTable, lbToKg, kgToLb, fmt } from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

const PLATE_SETS = {
  kg: { standard: [25, 20, 15, 10, 5, 2.5, 1.25], competition: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25] },
  lb: { standard: [45, 35, 25, 10, 5, 2.5], competition: [45, 35, 25, 10, 5, 2.5, 1.25] },
};
const BARS = { kg: [20, 15, 10, 25], lb: [45, 35, 25, 55] };
const PLATE_COLOR = {
  25: '#DB4C40', 20: '#5B6CB0', 15: '#E3A017', 10: '#4E8C79', 5: '#D0D0CA',
  45: '#DB4C40', 35: '#5B6CB0', 55: '#4E8C79',
};

export default function PlateLoader() {
  const [units, setUnits] = useState('kg');
  const [target, setTarget] = useState('100');
  const [bar, setBar] = useState('20');
  const [set, setSet] = useState('standard');

  const plates = PLATE_SETS[units][set];
  const barW = +bar || 0;
  const tgt = +target || 0;

  const switchUnits = to => {
    if (to === units) return;
    setTarget(String(Math.round(to === 'lb' ? kgToLb(+target || 0) : lbToKg(+target || 0))));
    setBar(String(BARS[to][0]));
    setUnits(to);
  };

  const r = useMemo(() => plateLoad(tgt, barW, plates), [tgt, barW, plates]);
  const warmups = useMemo(
    () => [0.4, 0.55, 0.7, 0.85, 1].map(pct => {
      const w = tgt * pct;
      const rounded = Math.round(w / (units === 'kg' ? 2.5 : 5)) * (units === 'kg' ? 2.5 : 5);
      return { pct: Math.round(pct * 100), weight: Math.max(barW, rounded),
               reps: pct < 0.5 ? 8 : pct < 0.7 ? 5 : pct < 0.85 ? 3 : pct < 1 ? 2 : 1 };
    }), [tgt, barW, units]);

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your bar">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['kg', 'Kilograms'], ['lb', 'Pounds']]} />
          <Num label="Target weight" value={target} onChange={setTarget} tag={units}
                 min={units === 'lb' ? 2 : 1} max={units === 'lb' ? 1400 : 600} />
          <div className="row2">
            <Select label="Bar weight" value={bar} onChange={setBar}>
              {BARS[units].map(b => <option key={b} value={b}>{b} {units}</option>)}
            </Select>
            <Select label="Plate set" value={set} onChange={setSet}>
              <option value="standard">Standard gym</option>
              <option value="competition">Competition (with fractionals)</option>
            </Select>
          </div>
          <p className="hint">
            Plates are shown per side. Heaviest go on first, closest to the collar.
          </p>
        </Panel>

        <Panel label="Load per side" dark>
          {!r.possible ? (
            <BigStat value="—" unit="below bar weight"
                     note={<>Your target is lighter than the bar alone ({barW} {units}).</>} />
          ) : (
            <>
              <BigStat value={fmt(r.achieved)} unit={units}
                       note={r.remainder > 0.001
                         ? <>Closest achievable — <b>{r.remainder.toFixed(2)} {units}</b> short
                           of {tgt} with these plates.</>
                         : <>Exact match with the plates available.</>} />

              <div className="platebar" aria-hidden="true">
                <span className="pb-sleeve" />
                {r.perSide.flatMap(p =>
                  Array.from({ length: p.count }, (_, i) => (
                    <span key={`${p.plate}-${i}`} className="pb-plate"
                          style={{
                            background: PLATE_COLOR[p.plate] ?? '#82827C',
                            height: `${Math.max(28, Math.min(72, p.plate * 2.6))}px`,
                          }}>
                      <em>{p.plate}</em>
                    </span>
                  )))}
                <span className="pb-bar" />
              </div>

              <div className="fx-list compact">
                {r.perSide.map(p => (
                  <div className="fx" key={p.plate}>
                    <div className="fx-top">
                      <span className="fx-name">
                        <span className="dot" style={{ background: PLATE_COLOR[p.plate] ?? '#82827C' }} />
                        {p.plate} {units}
                      </span>
                      <span className="fx-val">×{p.count}<small>per side</small></span>
                    </div>
                  </div>
                ))}
                {r.perSide.length === 0 && (
                  <div className="fx"><div className="fx-sub">Empty bar.</div></div>
                )}
              </div>

              <div className="bartop">
                <span className="t">Warm-up ramp</span>
              </div>
              <div className="pcttable">
                {warmups.map(w => (
                  <div className="pctrow" key={w.pct}>
                    <span className="pp">{w.pct}%</span>
                    <span className="pw">{fmt(w.weight)}<small>{units}</small></span>
                    <span className="pr">×{w.reps}</span>
                  </div>
                ))}
              </div>

              <StatStrip items={[
                { label: 'Target', value: fmt(tgt), unit: units },
                { label: 'Achieved', value: fmt(r.achieved), unit: units },
                { label: 'Per side', value: fmt((r.achieved - barW) / 2), unit: units },
                { label: 'Plates', value: r.perSide.reduce((a, p) => a + p.count, 0) },
              ]} />
            </>
          )}

          <Method>
            <p>
              Plates are allocated greedily from heaviest to lightest, which is how they are
              loaded in practice. Where the target cannot be made exactly with the available
              plates, the closest achievable load is shown along with the shortfall rather
              than silently rounding.
            </p>
            <p>
              The warm-up ramp is a common general-purpose progression. Adjust it to the
              lift and to how you feel — heavier compound movements usually justify more
              steps than isolation work.
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
