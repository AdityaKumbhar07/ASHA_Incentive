// Calculate all derived NORM values from user entered D column values
export function calculateNormTargets(normData) {
  const D3 = Number(normData.D3) || 0
  const D4 = Number(normData.D4) || 0
  const D6 = Number(normData.D6) || 0
  const D7 = Number(normData.D7) || 0
  const D12 = Number(normData.D12) || 0
  const D14 = Number(normData.D14) || 0
  const D19 = Number(normData.D19) || 0

  // Derived values exactly as Sheet 3 (NORM) formulas
  const D5  = D4 * 0.90          // D5  = D4*90%
  const D8  = D7                  // D8  = E7 = D7
  const D9  = D8 * 0.2375        // D9  = D8*23.75%
  const D10 = D8                  // D10 = D8
  const D11 = D10 * 0.13         // D11 = D10*13%
  const F12 = D12                 // F12 = D12  (static, no /12)
  const D13 = F12 * 0.03         // D13 = F12*3%
  const D15 = 52 * 12
  const D16 = 60
  const D17 = 12
  const D18 = 36
  const D20 = 22 * 10 * 12

  // Monthly targets (F column) — exactly as NORM sheet formulas
  // Sheet 2 uses ROUND(NORM!Fx, 0) as denominator → apply Math.round() here too
  const F3  = Math.round(D3  / 12)   // F3  = ROUND(E3/12, 0)
  const F4  = Math.round(D4  / 12)   // F4  = ROUND(E4/12, 0)
  const F5  = Math.round(D5  / 12)   // F5  = ROUND(E5/12, 0)
  const F6  = Math.round(D6  / 12)   // F6  = ROUND(E6/12, 0)
  const F7  = Math.round(D7  / 12)   // F7  = ROUND(E7/12, 0)
  const F8  = Math.round(D8  / 12)   // F8  = ROUND(E8/12, 0)
  const F9  = Math.round(D9  / 12)   // F9  = ROUND(E9/12, 0)
  const F10 = Math.round(D10 / 12)   // F10 = ROUND(E10/12, 0)
  const F11 = Math.round(D11 / 12)   // F11 = ROUND(E11/12, 0)
  // F12 = D12  (already computed above, integer input — no round needed)
  const F13 = Math.round(D13)        // F13 = ROUND(D13, 0)
  const F14 = Math.round(D14)        // F14 = ROUND(D14, 0)
  const F15 = Math.round(D15 / 12)   // F15 = 52  (integer always)
  const F16 = Math.round(D16 / 12)   // F16 = 5   (integer always)
  const F17 = Math.round(D17 / 12)   // F17 = 1
  const F18 = Math.round(D18 / 12)   // F18 = 3
  const F19 = Math.round(D19)        // F19 = ROUND(D19, 0)
  const F20 = Math.round(D20 / 12)   // F20 = 220 (integer always)

  // Order matches Sheet 2 rows: 6,8,10,12,14,16,18,20,22,24,26,28,30
  // Sheet2 F-refs: F3,F4,F5,F6,F7,F8,F9,F10,F11,F13,F14,F15,F16
  return [F3, F4, F5, F6, F7, F8, F9, F10, F11, F13, F14, F15, F16, F17, F18, F19, F20]
}

export function calculateSalary(normData, sheet1Data) {
  const targets = calculateNormTargets(normData)

  // Sheet 1 row totals
  const totals = Array.from({ length: 17 }, (_, i) => {
    const values = sheet1Data[i] || new Array(31).fill(0)
    return values.reduce((a, b) => a + (Number(b) || 0), 0)
  })

  const INDICATOR_NAMES = [
    "Proportion of estimated pregnancies registered (First Trimester)",
    "Proportion of pregnant women registered who received ANC",
    "Proportion of Newborns who received HBNC visits",
    "Proportion of Children up to 2 years who received immunization",
    "Proportion of above 30 years whose CBAC form was filled",
    "Proportion of above 30 years screened for Hypertension",
    "Proportion of patient of HYPERTENSION on Treatment",
    "Proportion of above 30 years screened for Diabetes Mellitus",
    "Proportion of patient of Diabetes Mellitus on Treatment",
    "Proportion of cases referred for TB Screening",
    "Monitoring of Referral cases Upward and Downward",
    "HWC Teleconsultation services provided",
    "Yoga Sessions organised & wellness activities held",
    "Monthly JAS Meeting Held at SHC-HWCs",
    "VHSND held against planned",
    "Number of footfalls in the month",
    "Home visits per month in the catchment area",
  ]

  const rows = []
  let totalPayment = 0

  // Indicators 0-12 (rows 1-13) — percentage based 45/60 rule
  // targets[0] to targets[12] map to sheet1Data[0] to sheet1Data[12]
  for (let i = 0; i <= 12; i++) {
    const performance = totals[i]
    const target = targets[i]
    const achievement = target > 0 ? (performance / target) * 100 : 0
    let payment = 0
    if (achievement >= 100) payment = 60
    else if (achievement >= 75) payment = 45
    else payment = 0

    totalPayment += payment
    rows.push({
      name: INDICATOR_NAMES[i],
      performance,
      target: Math.round(target * 100) / 100,
      achievement: Math.round(achievement * 10) / 10,
      payment,
      rule: "75%=₹45, 100%=₹60"
    })
  }

  // Row 13 — JAS Meeting (Sheet2 row 32)
  // G32 = E32*100/ROUND(F32,0)  →  achievement = count*100/Math.round(target)
  // J32 = IF(ROUND(E32,0)>=1, 50, 0)
  const jasCount  = totals[13]
  const jasTarget = targets[13]                                        // F17 = 1
  const jasAch    = jasTarget > 0 ? (jasCount * 100) / jasTarget : 0  // E*100/ROUND(F,0)
  const jasPayment = Math.round(jasCount) >= 1 ? 50 : 0               // ROUND(E,0)>=1
  totalPayment += jasPayment
  rows.push({
    name: INDICATOR_NAMES[13],
    performance: jasCount,
    target: jasTarget,
    achievement: Math.round(jasAch * 10) / 10,
    payment: jasPayment,
    rule: "ROUND(count,0)≥1 = ₹50"
  })

  // Row 14 — VHSND (Sheet2 row 33)
  // G33 = E33*100/ROUND(F33,0)  →  achievement = count*100/Math.round(target)
  // J33 = IF(ROUND(E33,0)>=1, 50, 0)
  const vhsndCount  = totals[14]
  const vhsndTarget = targets[14]                                            // F18 = 3
  const vhsndAch    = vhsndTarget > 0 ? (vhsndCount * 100) / vhsndTarget : 0
  const vhsndPayment = Math.round(vhsndCount) >= 1 ? 50 : 0
  totalPayment += vhsndPayment
  rows.push({
    name: INDICATOR_NAMES[14],
    performance: vhsndCount,
    target: vhsndTarget,
    achievement: Math.round(vhsndAch * 10) / 10,
    payment: vhsndPayment,
    rule: "ROUND(count,0)≥1 = ₹50"
  })

  // Row 15 — Footfall — targets[15] = F19
  const footfallPerf = totals[15]
  const footfallTarget = targets[15]
  const footfallAch = footfallTarget > 0 ? (footfallPerf / footfallTarget) * 100 : 0
  let footfallPayment = 0
  if (footfallAch >= 100) footfallPayment = 60
  else if (footfallAch >= 75) footfallPayment = 45
  rows.push({
    name: INDICATOR_NAMES[15],
    performance: footfallPerf,
    target: Math.round(footfallTarget * 100) / 100,
    achievement: Math.round(footfallAch * 10) / 10,
    payment: footfallPayment,
    rule: "75%=₹45, 100%=₹60"
  })
  totalPayment += footfallPayment

  // Row 16 — Home Visit — targets[16] = F20
  const homePerf = totals[16]
  const homeTarget = targets[16]
  const homeAch = homeTarget > 0 ? (homePerf / homeTarget) * 100 : 0
  let homePayment = 0
  if (homeAch >= 100) homePayment = 60
  else if (homeAch >= 75) homePayment = 45
  rows.push({
    name: INDICATOR_NAMES[16],
    performance: homePerf,
    target: Math.round(homeTarget * 100) / 100,
    achievement: Math.round(homeAch * 10) / 10,
    payment: homePayment,
    rule: "75%=₹45, 100%=₹60"
  })
  totalPayment += homePayment

  return { rows, totalPayment }
}