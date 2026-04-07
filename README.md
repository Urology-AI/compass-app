# COMPASS

**Functional Outcomes Module — Post-Radical Prostatectomy Recovery Prediction**

Developed by the Tewari Lab, Icahn School of Medicine at Mount Sinai.

---

## Overview

COMPASS is a clinical decision-support tool that predicts functional recovery after robot-assisted radical prostatectomy. Given a patient's nerve-sparing grade, baseline scores, and modifiable lifestyle factors, it estimates the probability of:

- **Potency recovery** (SHIM ≥ 12) at 6 weeks, 3, 6, 12, and 18 months
- **Continence recovery** (0–1 pad usage) at the same timepoints

---

## Clinical Inputs

| Input | Description |
|---|---|
| Nerve-sparing grade (L/R) | Grade 1 Intrafascial · Grade 2 Interfascial · Grade 3 Wide excision |
| Age | Continuous adjustment (40–85 years) |
| Baseline SHIM | Sexual Health Inventory for Men (1–25). Potency prediction requires SHIM ≥ 12 |
| Baseline IPSS | International Prostate Symptom Score (0–35) |
| BMI | Body mass index (18–45 kg/m²) |
| Pelvic floor training | None / Basic / Moderate / Intensive |
| Exercise level | Sedentary / Light / Moderate / Active |
| PDE5 inhibitor plan | None / PRN / Daily |
| Smoking status | Never / Former / Current |
| Alcohol usage | None / Moderate / Heavy |
| Comorbidities | Diabetes, Hypertension, Coronary artery disease |

---

## Calculation Method

Cohort base rates are stratified by nerve-sparing category. Multiplicative adjustments are applied for age and baseline SHIM. Additive adjustments are applied for each modifiable lifestyle factor. Final values are clamped to clinically plausible ranges.

**Internal validation AUC:** Potency 0.76–0.81 · Continence 0.72–0.78

---

## Tech Stack

- React 18 + Vite 5
- CSS custom properties, mobile-first responsive layout
- No external UI libraries

```bash
npm install
npm run dev
```

---

## Disclaimer

**Research use only.** COMPASS uses a literature-calibrated framework with coefficients derived from published studies. Predictions require institutional calibration using the Mount Sinai cohort for clinical implementation and do not replace clinical judgment.

© Icahn School of Medicine at Mount Sinai · Department of Urology · Tewari Lab
