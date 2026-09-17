import { useState, useMemo, useEffect } from 'react';
import {
  simulate, daysToTarget, intakeForTargetByDate,
  ACTIVITY, MIN_INTAKE, MAX_WEEKLY_LOSS_PCT,
  lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import {
  ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY, ageAccuracyNote, checkWeightTarget,
  LIFE_STAGE, effectiveFloor, checkOlderAdultWeight,
} from '../engine/safety.js';

const DAY_MS = 86400000;

/**
 * The flagship tool. Models weight change dynamically — expenditure falls as
 * weight falls, so the curve flattens instead of dropping linearly forever.
 */
export default function DeficitPlanner() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('35');
  const [weight, setWeight] = useState('90');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [bodyfat, setBodyfat] = useState('25');
  const [lifeStage, setLifeStage] = useState('none');
  const [activity, setActivity] = useState('moderate');
  const [target, setTarget] = useState('80');
  const [mode, setMode] = useState('date');       // 'date' = solve intake, 'intake' = solve date
  const [weeks, setWeeks] = useState('24');
  const [intake, setIntake] = useState('2000');
  // Capture time only after hydration so server/client markup stays identical.
  const [nowMs, setNowMs] = useState(null);
  useEffect(() => setNowMs(Date.now()), []);

  const toKg = v => (units === 'imperial' ? lbToKg(+v || 0) : +v || 0);
  const fromKg = v => (units === 'imperial' ? kgToLb(v) : v);
  const wTag = units === 'imperial' ? 'lb' : 'kg';

  const kg = toKg(weight);
  const targetKg = toKg(target);
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));

  const switchUnits = to => {
    if (to === units) return;
    const c = v => String(Math.round(to === 'imperial' ? kgToLb(+v || 0) : lbToKg(+v || 0)));
    if (to === 'imperial') {
      const { ft, in: i } = cmToFtIn(+height || 0);
      setFeet(String(ft)); setInches(String(i));
    } else {
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
    }
    setWeight(c(weight)); setTarget(c(target));
    setUnits(to);
  };

  // Checked BEFORE any projection is computed. A plan that exists has already
  // done the harm, whatever warning sits next to it (audit: weight-target rail).
  const targetCheck = checkWeightTarget({ currentKg: kg, targetKg, cm });
  const stage = LIFE_STAGE[lifeStage] ?? LIFE_STAGE.none;
  const floorNow = effectiveFloor(sex, lifeStage);
  const olderAdult = checkOlderAdultWeight({ age, currentKg: kg, targetKg, cm });

  const r = useMemo(() => {
    if (stage.blocks) return { blocked: true, reason: 'pregnant' };
    if (!targetCheck.ok) return { blocked: true, reason: targetCheck.reason };
    // A blank or cleared target is missing input, not an impossible goal. Without
    // this the solver is asked to reach 0 kg, returns "unreachable", and the panel
    // replaces the calculator with a failure state while the user is mid-edit.
    if (!(targetKg > 0)) return { incomplete: true };
    const base = {
      kg, cm, age: +age || 0, sex, bodyFatPct: bf,
      activityFactor: ACTIVITY[activity].factor,
    };
    const days = Math.max(7, (+weeks || 1) * 7);
    let dailyIntake, reachedDay, unreachable = false;
    let infeasibleReason = null, achievableKg = null;

    if (mode === 'date') {
      // F-002/F-003: solver is floor-bounded and reports feasibility.
      const solved = intakeForTargetByDate({ ...base, targetKg, days });
      dailyIntake = solved.intake;
      reachedDay = days;
      if (!solved.feasible) {
        unreachable = true;
        infeasibleReason = solved.reason;
        achievableKg = solved.achievableKg;
      }
    } else {
      dailyIntake = +intake || 2000;
      reachedDay = daysToTarget({ ...base, intakeKcal: dailyIntake, targetKg });
      if (reachedDay == null) unreachable = true;
    }

    const horizon = Math.min(1095, Math.max(days, (reachedDay ?? days) + 56));
    const sim = simulate({ ...base, intakeKcal: dailyIntake, days: horizon });

    // Static "3,500 kcal per pound" curve, for comparison
    const staticSeries = sim.series.map(p => ({
      day: p.day,
      kg: kg + ((dailyIntake - sim.startTdee) * p.day) / 7716,
    }));

    const weeklyRate = sim.series.length > 1
      ? (sim.series[0].kg - sim.series[1].kg) : 0;
    const weeklyPct = kg ? (weeklyRate / kg) * 100 : 0;
    const floor = floorNow;   // life-stage aware (breastfeeding raises it)

    return {
      sim, staticSeries, dailyIntake, reachedDay, unreachable,
      infeasibleReason, achievableKg,
      deficit: sim.startTdee - dailyIntake,
      weeklyRate, weeklyPct,
      tooLow: dailyIntake < floor,
      tooFast: weeklyPct > MAX_WEEKLY_LOSS_PCT,
      floor,
      etaDate: reachedDay != null && nowMs != null
        ? new Date(nowMs + reachedDay * DAY_MS)
        : null,
    };
  }, [kg, cm, age, sex, bf, activity, targetKg, mode, weeks, intake, nowMs,
      targetCheck.ok, stage.blocks, floorNow]);

  // ---- chart geometry ----
  const chart = useMemo(() => {
    if (r.blocked || r.incomplete || !r.sim?.series) return null;   // no plan computed — see targetCheck
    const pts = r.sim.series;
    if (pts.length < 2) return null;
    const W = 520, H = 190, PL = 6, PR = 6, PT = 10, PB = 20;
    const maxDay = pts[pts.length - 1].day || 1;
    const allKg = [...pts.map(p => p.kg), ...r.staticSeries.map(p => p.kg), targetKg];
    const lo = Math.min(...allKg) - 1, hi = Math.max(...allKg) + 1;
    const x = d => PL + (d / maxDay) * (W - PL - PR);
    const y = v => PT + (1 - (v - lo) / (hi - lo || 1)) * (H - PT - PB);
    const path = ps => ps.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
    const area = `${path(pts)} L${x(maxDay).toFixed(1)},${(H - PB).toFixed(1)} L${x(0).toFixed(1)},${(H - PB).toFixed(1)} Z`;
    return {
      W, H, PB, x, y, maxDay,
      dynamic: path(pts),
      static: path(r.staticSeries),
      area,
      targetY: y(targetKg),
      ticks: [0, 0.25, 0.5, 0.75, 1].map(f => ({
        x: x(maxDay * f), label: `${Math.round((maxDay * f) / 7)}w`,
      })),
    };
  }, [r, targetKg]);

  const losing = targetKg < kg;

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your plan">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <Seg label="Sex" value={sex} onChange={setSex}
               options={[['male', 'Male'], ['female', 'Female']]} />

          <Select label="Any of these apply?" value={lifeStage} onChange={setLifeStage}
                  hint="Changes what a safe intake looks like — or whether we plan at all.">
            {Object.entries(LIFE_STAGE).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>
          <div className="row2">
            <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
            <Num label="Body fat" value={bodyfat} onChange={setBodyfat} tag="%"
                 placeholder="—"
                 min={1} max={70} />
          </div>
          <div className="row2">
            <Num label="Current weight" value={weight} onChange={setWeight} tag={wTag}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
            <Num label="Target weight" value={target} onChange={setTarget} tag={wTag}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
          </div>
          {units === 'imperial' ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <div className="unit">
                  <input type="number" inputMode="decimal" min={3} max={8} step="1" value={feet} aria-label="Feet"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setFeet(e.target.value)} />
                  <span className="tag">ft</span>
                </div>
                <div className="unit">
                  <input type="number" inputMode="decimal" min={0} max={11} step="1" value={inches} aria-label="Inches"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setInches(e.target.value)} />
                  <span className="tag">in</span>
                </div>
              </div>
            </div>
          ) : (
            <Num label="Height" value={height} onChange={setHeight} tag="cm"
                 min={120} max={230} />
          )}
          <Select label="Activity level" value={activity} onChange={setActivity}>
            {Object.entries(ACTIVITY).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>

          <div className="subhead">Plan by <span>choose one</span></div>
          <Seg value={mode} onChange={setMode}
               options={[['date', 'Target date'], ['intake', 'Daily calories']]} />
          {mode === 'date'
            ? <Num label="Timeline" value={weeks} onChange={setWeeks} tag="weeks"
                   hint="We'll work out the daily calories required."
                 min={1} max={260} />
            : <Num label="Daily calories" value={intake} onChange={setIntake} tag="kcal"
                   hint="We'll work out how long it takes."
                 min={800} max={8000} />}
        </Panel>

        <Panel label={losing ? 'Your projection' : 'Your projection'} dark
               incomplete={!(kg > 0 && cm > 0 && targetKg > 0)}
               incompleteNote={
                 !(kg > 0 && cm > 0)
                   ? 'Enter your current weight and height to see a projection.'
                   : 'Enter a target weight to see a projection.'
               }
               notice={(() => {
                 if (stage.blocks) return RAIL_COPY.pregnancy;
                 if (!targetCheck.ok) {
                   return targetCheck.reason === 'currentUnderweight'
                     ? RAIL_COPY.currentBelowHealthy
                     : RAIL_COPY.targetBelowHealthy;
                 }
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          {/* Nothing below is evaluated when a plan was refused — children are
              built before Panel decides what to show, so the guard is here. */}
          {r.blocked || r.incomplete ? null : r.unreachable ? (
            <>
              <BigStat value="—" unit="not reachable"
                       note={<>At {fmt(r.dailyIntake)} kcal you plateau around{' '}
                         <b>{fmt(fromKg(r.sim.plateauKg))} {wTag}</b> before reaching your target.</>} />
              <div className="warnbar">
                This is exactly what the dynamic model is for: as you lose weight your
                expenditure falls, so a fixed intake eventually becomes maintenance.
                Lower the intake or extend the timeline.
              </div>
            </>
          ) : (
            <BigStat
              value={mode === 'date' ? fmt(r.dailyIntake) : `${Math.round(r.reachedDay / 7)}`}
              unit={mode === 'date' ? 'kcal / day' : 'weeks'}
              note={mode === 'date'
                ? <>To reach <b>{target} {wTag}</b> in {weeks} weeks — a {fmt(r.deficit)} kcal daily deficit.</>
                : <>To reach <b>{target} {wTag}</b> at {fmt(r.dailyIntake)} kcal/day
                   {r.etaDate && <> · around {r.etaDate.toLocaleDateString('en-US',
                     { month: 'short', year: 'numeric' })}</>}.</>} />
          )}

          {!r.blocked && !r.incomplete && r.unreachable && r.infeasibleReason === 'floor' && (
            <div className="warnbar">
              This target can't be reached by that date without dropping below{' '}
              {r.floor} kcal. At the fastest safe pace you'd reach about{' '}
              <b>{r.achievableKg?.toFixed(1)} kg</b> by then — extend the timeline
              to reach your target safely.
            </div>
          )}

          {!r.blocked && ageAccuracyNote(age) && (
            <p className="cat-caveat">{ageAccuracyNote(age)}</p>
          )}

          {olderAdult && !r.blocked && (
            <p className="cat-caveat">{RAIL_COPY.olderAdultLowBmi}</p>
          )}

          {lifeStage === 'breastfeeding' && !r.blocked && (
            <div className="goaltag">{RAIL_COPY.breastfeeding(floorNow)}</div>
          )}

          {!r.blocked && !r.incomplete && (r.tooLow || r.tooFast) && (
            <div className="warnbar">
              {r.tooLow && <>That intake is below {r.floor} kcal, the common lower bound for
                unsupervised dieting. Extend the timeline or raise activity instead. </>}
              {r.tooFast && <>Losing {r.weeklyPct.toFixed(1)}% of bodyweight per week is faster
                than the ~1% ceiling most guidance suggests, which risks lean-mass loss.</>}
            </div>
          )}

          {chart && (
            <>
              <div className="bartop tight">
                <span className="t">Projected weight</span>
                <span className="chart-key">
                  <span className="k dyn">Dynamic model</span>
                  <span className="k stat">3,500 kcal rule</span>
                </span>
              </div>
              <svg className="wchart" viewBox={`0 0 ${chart.W} ${chart.H}`}
                   role="img" aria-label="Projected weight over time">
                <line x1="0" y1={chart.targetY} x2={chart.W} y2={chart.targetY}
                      className="w-target" />
                <path d={chart.area} className="w-area" />
                <path d={chart.static} className="w-static" />
                <path d={chart.dynamic} className="w-dyn" />
                {chart.ticks.map(t => (
                  <text key={t.label} x={t.x} y={chart.H - 4} className="w-tick"
                        textAnchor="middle">{t.label}</text>
                ))}
                <text x={chart.W - 6} y={chart.targetY - 5} className="w-tlabel"
                      textAnchor="end">target {target} {wTag}</text>
              </svg>
              <p className="foot-note">
                The gap between the two lines is the error in the static rule. It predicts{' '}
                <b>{fmt(Math.abs(fromKg(r.sim.staticPrediction - r.sim.finalKg)))} {wTag}</b>{' '}
                more loss than is realistic over this period.
              </p>
            </>
          )}

          {!r.blocked && !r.incomplete && <>
          <StatStrip items={[
            { label: 'Start TDEE', value: fmt(r.sim.startTdee), unit: 'kcal' },
            { label: 'End TDEE', value: fmt(r.sim.finalTdee), unit: 'kcal' },
            { label: 'Weekly rate', value: r.weeklyRate.toFixed(2), unit: wTag },
            { label: 'Maintain after', value: fmt(r.sim.maintenanceAtGoal), unit: 'kcal' },
          ]} />

          <p className="foot-note">
            When you reach your goal, maintenance will be about{' '}
            <b>{fmt(r.sim.maintenanceAtGoal)} kcal</b> — roughly{' '}
            {fmt(r.sim.startTdee - r.sim.finalTdee)} kcal below what it is today. Planning
            for that number is what stops the weight coming back.
          </p>
          </>}

          <Method>
            <p>
              This is a simplified dynamic simulation in the spirit of Hall et al.
              (<em>Lancet</em>, 2011), the model behind the NIH Body Weight Planner. It
              recomputes your expenditure daily against your current weight, applies
              adaptive thermogenesis, and splits weight change between fat and lean tissue
              using the Forbes relationship. It is <strong>not</strong> the full NIH model,
              which solves a coupled system of differential equations.
            </p>
            <p>
              Known limitations: the NIH model itself tracked closely against the two-year
              CALERIE trial (mean bias about −0.5 kg) but has been shown to overestimate
              weight for people on very-low-calorie diets, most pronounced in men. Treat
              any projection beyond about six months as a direction of travel rather than
              a forecast.
            </p>
            <p className="refs">
              Hall KD et al., Lancet 2011 · Forbes GB 1987 · Trexler ET et al.,
              J Int Soc Sports Nutr 2014 · Guo J, Brager DC, Hall KD, Am J Clin Nutr 2018
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
