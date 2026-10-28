import { useState, useMemo } from 'react';
import { lbToKg, kgToLb, fmt, OPL_DATA } from '../engine/index.js';
import { powerliftingResult } from '../engine/results.js';
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

  const r = useMemo(
    () => powerliftingResult({ totalKg, bodyweightKg: bwKg, sex, equipment, event }),
    [totalKg, bwKg, sex, equipment, event]);

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
                 min={units === 'lb' ? 55 : 25} max={units === 'lb' ? 705 : 320} />

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
                       note="The IPF scores on GL Points instead, shown below." />

              {r.dots.clamped && (
                <p className="foot-note">
                  DOTS is defined from {r.dots.min} to {r.dots.max} kg for {sex === 'female' ? 'women' : 'men'}.{' '}
                  {r.dots.clamped === 'above' ? 'Above' : 'Below'} that it is scored as if you weighed{' '}
                  {r.dots.bwUsed} kg — which is how OpenPowerlifting scores every such lifter.
                </p>
              )}

              <ScorePosition pos={r.position} dots={r.primary.value}
                             gl={r.scores.find(s => s.key === 'ipfgl')?.value} sex={sex}
                             equipment={equipment} event={event} />

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
                    <div className="fx-sub">{s.note}</div>
                  </div>
                ))}
              </div>

              <StatStrip items={[
                { label: 'Total', value: fmt(units === 'lb' ? kgToLb(totalKg) : totalKg), unit: units },
                { label: 'Bodyweight', value: bw, unit: units },
                { label: '× bodyweight', value: r.ratio.toFixed(2) },
                { label: 'Category', value: equipment === 'classic' ? 'Classic' : 'Equipped',
                  unit: event === 'bench' ? 'bench' : 'full' },
              ]} />

              {r.dots.denom > 0 && (
                <p className="foot-note score-worked">
                  <b>How it's calculated</b> (in kg): DOTS = total × 500 ÷ (A·bw⁴ + B·bw³ + C·bw² + D·bw + E).
                  At {fmt1(r.dots.bwUsed)} kg the bracket is {r.dots.denom.toFixed(2)}, so {fmt1(totalKg)} × 500 ÷{' '}
                  {r.dots.denom.toFixed(2)} = {r.primary.value.toFixed(1)}.
                  {r.gl && r.gl.value && <>{' '}IPF GL = total × 100 ÷ (A − B·e<sup>−C·bw</sup>) = {fmt1(totalKg)} × 100 ÷{' '}
                    ({r.gl.A} − {r.gl.B} × e<sup>−{r.gl.C} × {fmt1(bwKg)}</sup>) = {fmt1(totalKg)} × 100 ÷{' '}
                    {r.gl.denom.toFixed(2)} = {r.gl.value.toFixed(1)}.</>}
                  {' '}Figures are rounded for display.
                </p>
              )}

              <p className="foot-note">
                Note that IPF GL points are on a different scale entirely — roughly 100
                represents an elite result, where DOTS and Wilks both run in the hundreds.
                Compare each system only against itself.
              </p>

              <Method>
                <p>
                  <strong>DOTS</strong> was created in 2019 by Tim Konertz of the BVDK: an updated,
                  simpler polynomial in the same form as Wilks, built on results from drug-tested
                  raw lifters. USA Powerlifting's rulebook uses it to break ties in team placings at
                  national championships, and keeps it until a better formula is approved. Outside
                  40–210 kg (men) or 40–150 kg (women), bodyweight is set to the nearest limit, as
                  OpenPowerlifting does.
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
                <p>
                  <strong>Percentiles</strong> come from OpenPowerlifting's public meet results:
                  full-power meets in the five years to {longDate(OPL_DATA.window.to)}, classic (raw) or
                  equipped (single-ply), placed lifters only, each lifter counted once at their best.
                  Results from drug-tested categories alone differ little, except for equipped women
                  (see the chart below).
                </p>
                <p className="refs">
                  IPF GL coefficients, International Powerlifting Federation (2020) · DOTS: Konertz T,
                  BVDK (2019), coefficients as given in the IPF's 2020 formula evaluation · USA Powerlifting
                  Rulebook v2026.2, §1.9.5 · OpenPowerlifting bulk data (public domain), file of
                  {' '}{OPL_DATA.file.split('/')[0].replace('openpowerlifting-', '')} · Wilks R (1994)
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

const fmt1 = v => (Math.round(v * 10) / 10).toString();
const ORD = p => `${p}th`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
export const longDate = iso => { const [y, m, d] = iso.split('-'); return `${+d} ${MONTHS[+m - 1]} ${y}`; };

function where(pos, top) {
  if (pos.at) return <>at the <b>{ORD(pos.at.p)} percentile</b></>;
  if (!pos.lower) return <><b>below the 5th percentile</b> ({pos.upper.value.toFixed(1)})</>;
  if (!pos.upper) return <><b>above the {ORD(top)} percentile</b> ({pos.lower.value.toFixed(1)})</>;
  return <>between the <b>{ORD(pos.lower.p)} and {ORD(pos.upper.p)} percentiles</b>{' '}
    ({pos.lower.value.toFixed(1)}–{pos.upper.value.toFixed(1)})</>;
}

/** Where the scores sit among competition lifters of the same sex and equipment. */
function ScorePosition({ pos, dots, gl, sex, equipment, event }) {
  if (event !== 'full') {
    return <p className="score-pos-line">Percentiles cover full-power meets only, so none are shown for bench-only.</p>;
  }
  if (!pos.dots) return null;
  const who = sex === 'female' ? 'women' : 'men';
  return (
    <p className="score-pos-line">
      Among {who} who competed in {equipment === 'equipped' ? 'equipped' : 'classic'} full-power meets
      in the five years to {longDate(OPL_DATA.window.to)} ({pos.dots.lifters.toLocaleString('en-US')} lifters
      on OpenPowerlifting, each counted once at their best), a DOTS of {dots.toFixed(1)} is{' '}
      {where(pos.dots, 99)}{pos.gl && gl ? <>, and an IPF GL of {gl.toFixed(1)} is {where(pos.gl, 99)}</> : null}.
      Everyone here entered a meet, so this compares you with competitors, not with everyone who lifts.
    </p>
  );
}
