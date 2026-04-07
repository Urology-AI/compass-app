import { useState, useMemo, useEffect, useRef } from 'react'

// ── COHORT DATA ────────────────────────────────────────
// Indices: [6wk, 3mo, 6mo, 12mo(ref), 12mo(main), 18mo, 24mo]
const POT = {
  BL_G1:       [45, 62, 87, 87, 90, 94, 98],
  UL_G1_CL_G2: [35, 56, 81, 81, 86, 92, 95],
  BL_G2:       [26, 47, 69, 72, 77, 86, 87],
  G3_PLUS:     [18, 32, 48, 55, 62, 70, 75],
  VERY_HIGH:   [10, 20, 32, 38, 45, 52, 58],
}
const CONT = {
  BL_G1:       [60, 77, 92, 95, 96, 96, 98],
  UL_G1_CL_G2: [57, 79, 92, 94, 96, 97, 98],
  BL_G2:       [47, 76, 92, 92, 93, 95, 95],
  G3_PLUS:     [49, 72, 87, 91, 93, 95, 95],
  VERY_HIGH:   [40, 62, 78, 84, 88, 91, 93],
}

const NS_LABELS  = { 1: 'Grade 1 — Intrafascial', 2: 'Grade 2 — Interfascial', 3: 'Grade 3 — Wide excision' }
const NS_G_CLASS = { 1: 'g1', 2: 'g2', 3: 'g3' }
const TL_LABELS  = ['6wk', '3mo', '6mo', '12mo', '18mo']

// ── HELPERS ────────────────────────────────────────────
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const blend  = (a, b, w)   => a.map((v, i) => Math.round(v * (1 - w) + b[i] * w))
const fmtAdj = (n) => (n >= 0 ? '+' : '') + n + '%'

function getCohortData(nsL, nsR) {
  const w = Math.max(nsL, nsR), b = Math.min(nsL, nsR)
  if (w === 1)            return [POT.BL_G1,       CONT.BL_G1]
  if (w === 2 && b === 1) return [POT.UL_G1_CL_G2, CONT.UL_G1_CL_G2]
  if (w === 2)            return [POT.BL_G2,        CONT.BL_G2]
  if (w === 3 && b === 1) return [blend(POT.BL_G2, POT.G3_PLUS, 0.5), blend(CONT.BL_G2, CONT.G3_PLUS, 0.5)]
  if (w === 3 && b === 2) return [POT.G3_PLUS,      CONT.G3_PLUS]
  return [POT.VERY_HIGH, CONT.VERY_HIGH]
}

// ── ANIMATED NUMBER HOOK ───────────────────────────────
function useAnimatedNumber(target) {
  const [display, setDisplay] = useState(target)
  const rafRef  = useRef(null)
  const prevRef = useRef(target)

  useEffect(() => {
    if (prevRef.current === target) return
    const from = prevRef.current
    prevRef.current = target
    const start = performance.now()
    const duration = 380

    cancelAnimationFrame(rafRef.current)
    const tick = (now) => {
      const p    = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (target - from) * ease))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  return display
}

// ── SLIDER FIELD ────────────────────────────────────────
function SliderInput({ label, id, min, max, step = 1, value, unit = '', onChange, tip }) {
  const pct = ((value - min) / (max - min)) * 100
  const trackStyle = {
    background: `linear-gradient(90deg, var(--teal) ${pct}%, var(--border-hi) ${pct}%)`,
  }
  const displayVal = unit === 'bmi' ? value.toFixed(1) : value
  const unitLabel  = unit === 'yrs' ? ' yrs' : unit === 'bmi' ? ' kg/m²' : ''

  return (
    <div className="slider-field">
      <div className="sf-header">
        <span className="sf-label">
          {label}
          {tip && <span className="tip" data-tip={tip}>?</span>}
        </span>
        <span className="sf-value">{displayVal}{unitLabel}</span>
      </div>
      <input
        type="range" id={id}
        min={min} max={max} step={step} value={value}
        style={trackStyle}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="sf-bounds">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}

// ── SETTING ROW (compact label + inline pills) ──────────
function SettingRow({ label, options, value, onChange, tip }) {
  return (
    <div className="setting-row">
      <span className="setting-lbl">
        {label}
        {tip && <span className="tip" data-tip={tip}>?</span>}
      </span>
      <div className="compact-pills">
        {options.map(({ label: lbl, val }) => (
          <button
            key={val}
            className={`compact-pill${value === val ? ' on' : ''}`}
            onClick={() => onChange(val)}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── NS GRADE BUTTON ─────────────────────────────────────
function NSGradeBtn({ grade, label, desc, active, onClick }) {
  return (
    <button
      className={`ns-grade-btn g${grade}${active ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className="ns-grade-name">{label}</div>
      <div className="ns-grade-desc">{desc}</div>
    </button>
  )
}

// ── HERO CARD ────────────────────────────────────────────
function HeroCard({ label, value, sub, adj, isCont, unavailable }) {
  const animated = useAnimatedNumber(unavailable ? 0 : value)

  return (
    <div className={`hero-card${isCont ? ' cont' : ''}`}>
      <div className="hero-label">{label}</div>
      <div className="hero-body">
        <div className="hero-num">
          {unavailable ? 'N/A' : `${animated}%`}
        </div>
        {!unavailable && (
          <div className="hero-meta">
            <div className={`hero-badge ${adj > 0 ? 'pos' : adj < 0 ? 'neg' : 'neu'}`}>
              {fmtAdj(adj)} adj
            </div>
            <div className="hero-range">
              {Math.max(value - 3, 0)}–{Math.min(value + 3, 100)}%
            </div>
          </div>
        )}
      </div>
      <div className="hero-sub">{sub}</div>
    </div>
  )
}

// ── TIMELINE CHART ──────────────────────────────────────
function TimelineChart({ points, isCont }) {
  return (
    <div className="tl-chart">
      {TL_LABELS.map((lbl, i) => {
        const val = points ? points[i] : null
        return (
          <div className="tl-col" key={lbl}>
            <div className="tl-bar-wrap">
              <div
                className={`tl-bar${isCont ? ' cont' : ''}`}
                style={{ height: val !== null ? val + '%' : '3%' }}
              />
            </div>
            <div className={`tl-val${isCont ? ' cont' : ''}`}>
              {val !== null ? val + '%' : 'N/A'}
            </div>
            <div className="tl-lbl">{lbl}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── MAIN APP ────────────────────────────────────────────
export default function App() {
  // ── Input state
  const [nsL, setNsL] = useState(1)
  const [nsR, setNsR] = useState(1)
  const [age,      setAge]      = useState(64)
  const [shim,     setShim]     = useState(21)
  const [ipss,     setIpss]     = useState(8)
  const [bmi,      setBmi]      = useState(27)
  const [pfmt,     setPfmt]     = useState('basic')
  const [exercise, setExercise] = useState('moderate')
  const [smoking,  setSmoking]  = useState('never')
  const [pde5,     setPde5]     = useState('prn')
  const [alcohol,  setAlcohol]  = useState('moderate')
  const [dm,  setDm]  = useState(false)
  const [htn, setHtn] = useState(false)
  const [cad, setCad] = useState(false)

  // ── Mobile tab state ('configure' | 'results')
  const [mobileTab, setMobileTab] = useState('configure')

  // ── Calculations ──────────────────────────────────────
  const results = useMemo(() => {
    const [potData, contData] = getCohortData(nsL, nsR)

    // Age adjustment (continuous)
    let ageAdj
    if      (age <= 50) ageAdj = 1.10
    else if (age <= 55) ageAdj = 1.10 - (age - 50) * 0.01
    else if (age <= 60) ageAdj = 1.05 - (age - 55) * 0.01
    else if (age <= 65) ageAdj = 1.00 - (age - 60) * 0.01
    else if (age <= 70) ageAdj = 0.95 - (age - 65) * 0.02
    else                ageAdj = 0.85

    // SHIM adjustment
    let shimAdj
    if      (shim >= 21) shimAdj = 1.0
    else if (shim >= 17) shimAdj = 0.92 + (shim - 17) * 0.02
    else if (shim >= 12) shimAdj = 0.85 + (shim - 12) * 0.014
    else                 shimAdj = 0.70

    // IPSS adjustment (continence)
    const ipssAdj = ipss <= 7 ? 0 : ipss <= 14 ? -3 : ipss <= 19 ? -6 : -10

    // Modifiable factor tables
    const pfmtPot  = { none: 0, basic: 2, moderate: 4, intensive: 6 }
    const pfmtCont = { none: 0, basic: 3, moderate: 6, intensive: 10 }
    const exPot    = { sedentary: -3, light: 0, moderate: 2, active: 4 }
    const exCont   = { sedentary: -2, light: 0, moderate: 2, active: 3 }
    const pde5Pot  = { none: 0, prn: 4, daily: 8 }
    const smokPot  = { never: 0, former: -2, current: -8 }
    const smokCont = { never: 0, former: 0, current: -2 }
    const alcPot   = { none: 2, moderate: 0, heavy: -10 }
    const alcCont  = { none: 0, moderate: 0, heavy: -2 }

    let potAdj = 0, contAdj = 0
    const bmiPot  = bmi < 25 ? 0 : bmi < 30 ? -3 : -8
    const bmiCont = bmi < 25 ? 0 : bmi < 30 ? -2 : -5
    potAdj  += bmiPot;           contAdj += bmiCont
    potAdj  += pfmtPot[pfmt];    contAdj += pfmtCont[pfmt]
    potAdj  += exPot[exercise];  contAdj += exCont[exercise]
    potAdj  += pde5Pot[pde5]
    potAdj  += smokPot[smoking]; contAdj += smokCont[smoking]
    potAdj  += alcPot[alcohol];  contAdj += alcCont[alcohol]
    if (dm)  { potAdj += -8; contAdj += -3 }
    if (htn) { potAdj += -3; contAdj += -1 }
    if (cad) { potAdj += -5; contAdj += -1 }

    const potBase  = Math.round(potData[4] * ageAdj * shimAdj)
    const contBase = Math.round(contData[4] * (age >= 70 ? 0.95 : 1.0))
    const potFinal  = clamp(potBase  + potAdj,  15, 98)
    const contFinal = clamp(contBase + contAdj + ipssAdj, 40, 99)
    const shimOk = shim >= 12

    // Timeline
    const potTimeline = shimOk ? [
      clamp(Math.round(potData[0] * ageAdj * shimAdj) + Math.round(potAdj * 0.5), 10, 90),
      clamp(Math.round(potData[1] * ageAdj * shimAdj) + Math.round(potAdj * 0.7), 15, 92),
      clamp(Math.round(potData[2] * ageAdj * shimAdj) + Math.round(potAdj * 0.9), 20, 95),
      potFinal,
      clamp(Math.round(potData[5] * ageAdj * shimAdj) + potAdj, 20, 99),
    ] : null

    const contTimeline = [
      clamp(Math.round(contData[0]) + Math.round(contAdj * 0.5), 30, 85),
      clamp(Math.round(contData[1]) + Math.round(contAdj * 0.7), 50, 92),
      clamp(Math.round(contData[2]) + Math.round(contAdj * 0.9), 70, 97),
      contFinal,
      clamp(Math.round(contData[5]) + contAdj, 80, 99),
    ]

    // Mod factor display
    const bmiRange  = bmi < 25 ? '±2%' : bmi < 30 ? '-2 to -5%' : '-5 to -12%'
    const bmiCls    = bmi < 25 ? 'neu' : 'neg'
    const pfmtRange = { none: '±0%', basic: '+0–3%', moderate: '+2–5%', intensive: '+4–8%' }
    const exRange   = { sedentary: '-2 to -5%', light: '±0%', moderate: '+1–3%', active: '+2–5%' }
    const pde5Range = { none: '±0%', prn: '+3–5%', daily: '+5–10%' }
    const smokRange = { never: '±0%', former: '-1 to -3%', current: '-5 to -10%' }
    const alcRange  = { none: '+1–3%', moderate: '±0%', heavy: '-8 to -12%' }
    const cc = (dm ? 1 : 0) + (htn ? 1 : 0) + (cad ? 1 : 0)

    const modFactors = [
      { name: `BMI (${bmi.toFixed(1)})`,   val: bmiRange,           cls: bmiCls },
      { name: 'Pelvic Floor (PFMT)',         val: pfmtRange[pfmt],    cls: pfmt === 'none' ? 'neu' : 'pos' },
      { name: 'Exercise Level',             val: exRange[exercise],  cls: exercise === 'sedentary' ? 'neg' : exercise === 'light' ? 'neu' : 'pos' },
      { name: 'PDE5 Inhibitors',            val: pde5Range[pde5],    cls: pde5 === 'none' ? 'neu' : 'pos' },
      { name: 'Smoking Status',             val: smokRange[smoking], cls: smoking !== 'never' ? 'neg' : 'neu' },
      { name: 'Alcohol Usage',              val: alcRange[alcohol],  cls: alcohol === 'heavy' ? 'neg' : alcohol === 'none' ? 'pos' : 'neu' },
      { name: 'Comorbidities',              val: cc === 0 ? '±0%' : `-${cc * 3} to -${cc * 8}%`, cls: cc === 0 ? 'neu' : 'neg' },
    ]

    return { potFinal, contFinal, potAdj, contAdj, potTimeline, contTimeline, shimOk, modFactors }
  }, [nsL, nsR, age, shim, ipss, bmi, pfmt, exercise, smoking, pde5, alcohol, dm, htn, cad])

  const { potFinal, contFinal, potAdj, contAdj, potTimeline, contTimeline, shimOk, modFactors } = results

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="app">

      {/* ── HEADER ──────────────────────────────────── */}
      <header className="app-header">
        <div className="logo">COMPASS</div>
        <div className="logo-tagline">
          Functional Outcomes · Post-Radical Prostatectomy
        </div>
      </header>

      {/* ── MAIN BODY ───────────────────────────────── */}
      <div className="app-body">

        {/* ── CONFIGURE PANEL ─────────────────────── */}
        <div className={`configure-panel${mobileTab === 'configure' ? ' active' : ''}`}>

          {/* Nerve-Sparing Grade */}
          <div className="card">
            <div className="card-header">Nerve-Sparing Grade</div>
            <div className="card-body">
              <div className="ns-sides">
                {[['left', nsL, setNsL], ['right', nsR, setNsR]].map(([side, val, setter]) => (
                  <div key={side}>
                    <div className="ns-side-lbl">{side === 'left' ? 'Left Side' : 'Right Side'}</div>
                    <div className="ns-stack">
                      {[1, 2, 3].map((g) => (
                        <NSGradeBtn
                          key={g} grade={g}
                          label={`Grade ${g}`}
                          desc={g === 1 ? 'Intrafascial' : g === 2 ? 'Interfascial' : 'Wide excision'}
                          active={val === g}
                          onClick={() => setter(g)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Factors */}
          <div className="card">
            <div className="card-header">Patient Factors</div>
            <div className="card-body">
              <SliderInput
                label="Age" id="inp_age" min={40} max={85} value={age} unit="yrs"
                tip="Potency recovery declines gradually with age. Modeled as a continuous adjustment."
                onChange={setAge}
              />
              <SliderInput
                label="Baseline SHIM" id="inp_shim" min={1} max={25} value={shim}
                tip="Erectile function score (1–25). Potency prediction requires SHIM ≥12. Higher = better baseline."
                onChange={setShim}
              />
              {shim < 12 && (
                <div className="shim-warn">
                  SHIM &lt;12 — potency prediction unavailable
                </div>
              )}
              <SliderInput
                label="Baseline IPSS" id="inp_ipss" min={0} max={35} value={ipss}
                tip="Urinary symptom score (0–35). Higher = worse baseline, predicts delayed continence recovery."
                onChange={setIpss}
              />
            </div>
          </div>

          {/* Modifiable Lifestyle Factors */}
          <div className="card">
            <div className="card-header">Modifiable Factors</div>
            <div className="card-body">
              <SliderInput
                label="BMI" id="inp_bmi" min={18} max={45} step={0.5} value={bmi} unit="bmi"
                onChange={setBmi}
              />

              <SettingRow
                label="Pelvic Floor (PFMT)"
                value={pfmt} onChange={setPfmt}
                options={[
                  { label: 'None', val: 'none' },
                  { label: 'Basic', val: 'basic' },
                  { label: 'Mod', val: 'moderate' },
                  { label: 'Intensive', val: 'intensive' },
                ]}
              />

              <SettingRow
                label="Exercise Level"
                value={exercise} onChange={setExercise}
                options={[
                  { label: 'Sedentary', val: 'sedentary' },
                  { label: 'Light', val: 'light' },
                  { label: 'Mod', val: 'moderate' },
                  { label: 'Active', val: 'active' },
                ]}
              />

              <SettingRow
                label="PDE5 Inhibitor Plan"
                tip="Daily low-dose promotes nerve healing and is most effective for potency recovery."
                value={pde5} onChange={setPde5}
                options={[
                  { label: 'None', val: 'none' },
                  { label: 'PRN', val: 'prn' },
                  { label: 'Daily', val: 'daily' },
                ]}
              />

              <SettingRow
                label="Smoking Status"
                value={smoking} onChange={setSmoking}
                options={[
                  { label: 'Never', val: 'never' },
                  { label: 'Former', val: 'former' },
                  { label: 'Current', val: 'current' },
                ]}
              />

              <SettingRow
                label="Alcohol Usage"
                value={alcohol} onChange={setAlcohol}
                options={[
                  { label: 'None', val: 'none' },
                  { label: 'Moderate', val: 'moderate' },
                  { label: 'Heavy', val: 'heavy' },
                ]}
              />
            </div>
          </div>

          {/* Comorbidities */}
          <div className="card">
            <div className="card-header">Comorbidities</div>
            <div className="card-body">
              <div className="toggle-label">Active conditions</div>
              <div className="toggle-row">
                {[['dm', 'Diabetes', dm, setDm], ['htn', 'HTN', htn, setHtn], ['cad', 'CAD', cad, setCad]].map(
                  ([key, label, val, setter]) => (
                    <button
                      key={key}
                      className={`toggle-btn${val ? ' on' : ''}`}
                      onClick={() => setter(v => !v)}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

        </div>{/* end configure-panel */}

        {/* ── RESULTS PANEL ───────────────────────── */}
        <div className={`results-panel${mobileTab === 'results' ? ' active' : ''}`}>

          {/* NS Summary chips */}
          <div className="ns-chips">
            {[['left', nsL], ['right', nsR]].map(([side, grade]) => (
              <div key={side} className={`ns-chip ${NS_G_CLASS[grade]}`}>
                <div className="chip-dot" />
                {side === 'left' ? 'Left: ' : 'Right: '}{NS_LABELS[grade]}
              </div>
            ))}
          </div>

          {/* Hero numbers */}
          <div className="hero-row">
            <HeroCard
              label="Potency Recovery — 12 months"
              value={potFinal}
              sub="of patients with similar profile achieve SHIM ≥12"
              adj={potAdj}
              isCont={false}
              unavailable={!shimOk}
            />
            <HeroCard
              label="Continence Recovery — 12 months"
              value={contFinal}
              sub="achieve 0–1 pad usage at 12 months"
              adj={contAdj}
              isCont={true}
              unavailable={false}
            />
          </div>

          {/* Recovery timelines */}
          <div className="timeline-row">
            <div className="tl-card tl-pot">
              <div className="tl-card-title">
                <div className="tl-dot" />
                Potency Recovery Trajectory
              </div>
              <TimelineChart points={potTimeline} isCont={false} />
            </div>
            <div className="tl-card tl-cont">
              <div className="tl-card-title">
                <div className="tl-dot" />
                Continence Recovery Trajectory
              </div>
              <TimelineChart points={contTimeline} isCont={true} />
            </div>
          </div>

          {/* Modifiable factors */}
          <div className="mod-card">
            <div className="mod-card-header">
              Modifiable Factor Adjustments
            </div>
            <div className="mod-list">
              {modFactors.map(({ name, val, cls }) => (
                <div className="mod-row" key={name}>
                  <span className="mod-name">{name}</span>
                  <span className={`mod-badge ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net adjustment */}
          <div className="net-row">
            <span className="net-label">Net lifestyle adjustment</span>
            <div className="net-vals">
              <div className="net-item pot">
                <div className="net-dot" />
                <span className="net-val">{fmtAdj(potAdj)}</span>
                <span className="net-unit">potency</span>
              </div>
              <div className="net-item cont">
                <div className="net-dot" />
                <span className="net-val">{fmtAdj(contAdj)}</span>
                <span className="net-unit">continence</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <strong>Research use only.</strong> COMPASS uses a literature-calibrated framework with
            coefficients derived from published studies. Predictions require institutional calibration
            using the Mount Sinai cohort for clinical implementation and do not replace clinical
            judgment. AUC ranges: Potency 0.76–0.81 | Continence 0.72–0.78 (internal validation).
            · Icahn School of Medicine at Mount Sinai · Department of Urology · Tewari Lab
          </div>

        </div>{/* end results-panel */}

      </div>{/* end app-body */}

      {/* ── BOTTOM NAV (mobile only) ─────────────── */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn${mobileTab === 'configure' ? ' active' : ''}`}
          onClick={() => setMobileTab('configure')}
        >
          Configure
        </button>
        <button
          className={`nav-btn${mobileTab === 'results' ? ' active' : ''}`}
          onClick={() => setMobileTab('results')}
        >
          Results
        </button>
      </nav>

    </div>
  )
}
