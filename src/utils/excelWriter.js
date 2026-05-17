import JSZip from "jszip"
import { saveAs } from "file-saver"

export async function generateExcel(headerData, normData, sheet1Data) {
  const response = await fetch("/template.xlsx")
  const arrayBuffer = await response.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  // ─── SHARED STRINGS ───────────────────────────────────
  const ssFile = zip.file("xl/sharedStrings.xml")
  let ssXml = await ssFile.async("string")
  
  const siRegex = /<si>([\s\S]*?)<\/si>/g
  let sharedStrings = []
  let m
  while ((m = siRegex.exec(ssXml)) !== null) {
    const tMatch = m[1].match(/<t[^>]*>([^<]*)<\/t>/)
    sharedStrings.push(tMatch ? tMatch[1] : "")
  }

  function escapeXml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }

  function getOrAddString(str) {
    const s = String(str)
    const idx = sharedStrings.indexOf(s)
    if (idx !== -1) return idx
    sharedStrings.push(s)
    return sharedStrings.length - 1
  }

  function buildSSXml() {
    const count = sharedStrings.length
    const items = sharedStrings
      .map(s => `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`)
      .join("")
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
      `count="${count}" uniqueCount="${count}">${items}</sst>`
  }

  // ─── CELL UPDATER ─────────────────────────────────────
  function setNumber(xml, addr, num) {
    const val = Math.max(0, Math.round(Number(num) || 0))

    const selfClose = new RegExp(`<c r="${addr}"([^>]*?)/>`)
    if (selfClose.test(xml)) {
      return xml.replace(selfClose, (_, attrs) => {
        const cleanAttrs = attrs.replace(/\s*t="[^"]*"/, "")
        return `<c r="${addr}"${cleanAttrs}><v>${val}</v></c>`
      })
    }

    const normal = new RegExp(`<c r="${addr}"([^>]*?)>[\\s\\S]*?<\\/c>`)
    if (normal.test(xml)) {
      return xml.replace(normal, (_, attrs) => {
        const cleanAttrs = attrs.replace(/\s*t="[^"]*"/, "")
        return `<c r="${addr}"${cleanAttrs}><v>${val}</v></c>`
      })
    }

    const rowNum = addr.replace(/[A-Z]+/, "")
    const rowRe = new RegExp(`(<row[^>]* r="${rowNum}"[^>]*>)([\\s\\S]*?)(<\\/row>)`)
    return xml.replace(rowRe, (_, rOpen, rContent, rClose) => {
      return `${rOpen}${rContent}<c r="${addr}"><v>${val}</v></c>${rClose}`
    })
  }

  function setString(xml, addr, str) {
    const idx = getOrAddString(str)

    const selfClose = new RegExp(`<c r="${addr}"([^>]*?)/>`)
    if (selfClose.test(xml)) {
      return xml.replace(selfClose, (_, attrs) => {
        const cleanAttrs = attrs.replace(/\s*t="[^"]*"/, "")
        return `<c r="${addr}"${cleanAttrs} t="s"><v>${idx}</v></c>`
      })
    }

    const normal = new RegExp(`<c r="${addr}"([^>]*?)>[\\s\\S]*?<\\/c>`)
    if (normal.test(xml)) {
      return xml.replace(normal, (_, attrs) => {
        const cleanAttrs = attrs.replace(/\s*t="[^"]*"/, "")
        return `<c r="${addr}"${cleanAttrs} t="s"><v>${idx}</v></c>`
      })
    }

    const rowNum = addr.replace(/[A-Z]+/, "")
    const rowRe = new RegExp(`(<row[^>]* r="${rowNum}"[^>]*>)([\\s\\S]*?)(<\\/row>)`)
    return xml.replace(rowRe, (_, rOpen, rContent, rClose) => {
      return `${rOpen}${rContent}<c r="${addr}" t="s"><v>${idx}</v></c>${rClose}`
    })
  }

  // ─── PRINT SETTINGS ───────────────────────────────────
  function setPrintSettings(xml, orientation) {
    // Set sheetPr fitToPage
    // Handle sheetPr - only update pageSetUpPr, don't replace entire tag
if (/<pageSetUpPr[^>]*\/>/.test(xml)) {
  xml = xml.replace(/<pageSetUpPr[^>]*\/>/, `<pageSetUpPr fitToPage="1"/>`)
} else if (/<sheetPr\/>/.test(xml)) {
  xml = xml.replace(/<sheetPr\/>/, `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>`)
} else if (/<sheetPr>/.test(xml)) {
  xml = xml.replace(/<sheetPr>/, `<sheetPr><pageSetUpPr fitToPage="1"/>`)
} else {
  xml = xml.replace(/<sheetData>/, `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetData>`)
}

    // Replace pageSetup
    const pageSetup = `<pageSetup paperSize="9" orientation="${orientation}" fitToWidth="1" fitToHeight="1" useFirstPageNumber="0"/>`
    if (/<pageSetup[^>]*\/>/.test(xml)) {
      xml = xml.replace(/<pageSetup[^>]*\/>/, pageSetup)
    } else {
      xml = xml.replace(/<\/worksheet>/, `${pageSetup}</worksheet>`)
    }

    // Replace margins
    const margins = `<pageMargins left="0.25" right="0.25" top="0.25" bottom="0.25" header="0" footer="0"/>`
    if (/<pageMargins[^>]*\/>/.test(xml)) {
      xml = xml.replace(/<pageMargins[^>]*\/>/, margins)
    } else {
      xml = xml.replace(/<\/worksheet>/, `${margins}</worksheet>`)
    }

    return xml
  }

  // ─── LOAD SHEET XMLs ──────────────────────────────────
  let s1 = await zip.file("xl/worksheets/sheet1.xml").async("string")
  let s2 = await zip.file("xl/worksheets/sheet2.xml").async("string")
  let s3 = await zip.file("xl/worksheets/sheet3.xml").async("string")

  // ─── SHEET 1 HEADERS ──────────────────────────────────
  s1 = setString(s1, "A2", `District : ${headerData.district}`)
  s1 = setString(s1, "C2", `Taluka : ${headerData.taluka}`)
  s1 = setString(s1, "M2", `PHC : ${headerData.phc}`)
  s1 = setString(s1, "V2", `SC : ${headerData.sc}`)
  s1 = setString(s1, "AB2", `Village : ${headerData.village}`)
  s1 = setString(s1, "V3", `Month : ${headerData.month}`)
  s1 = setString(s1, "A3", `Asha Name : ${headerData.ashaName}`)

  // ─── SHEET 2 HEADERS ──────────────────────────────────
  s2 = setString(s2, "D3", `Month : ${headerData.month}`)
  s2 = setString(s2, "H4", `Asha Name : ${headerData.ashaName}`)

  // ─── SHEET 3 NORM VALUES ──────────────────────────────
  const normCells = ["D3","D4","D6","D7","D12","D14","D19"]
  normCells.forEach(cell => {
    if (normData[cell] !== undefined) {
      s3 = setNumber(s3, cell, Number(normData[cell]))
    }
  })

  // ─── SHEET 1 DAILY DATA ───────────────────────────────
  const cols = [
    "C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "AA","AB","AC","AD","AE","AF","AG"
  ]

  for (let rowIdx = 0; rowIdx < 17; rowIdx++) {
    const values = sheet1Data[rowIdx] || new Array(31).fill(0)
    const excelRow = rowIdx + 5
    for (let dayIdx = 0; dayIdx < 31; dayIdx++) {
      const cell = `${cols[dayIdx]}${excelRow}`
      s1 = setNumber(s1, cell, values[dayIdx])
    }
  }

  // ─── APPLY PRINT SETTINGS ─────────────────────────────
  s1 = setPrintSettings(s1, "landscape")
  s2 = setPrintSettings(s2, "portrait")
  s3 = setPrintSettings(s3, "landscape")

  // ─── SET PRINT AREAS + FORCE RECALCULATION IN WORKBOOK ───
  let wbXml = await zip.file("xl/workbook.xml").async("string")

  const printAreas = `<definedNames>` +
    `<definedName name="_xlnm.Print_Area" localSheetId="0">'Table ASHA 1'!$A$1:$AH$29</definedName>` +
    `<definedName name="_xlnm.Print_Area" localSheetId="1">'Table ASHA 2'!$A$1:$J$44</definedName>` +
    `<definedName name="_xlnm.Print_Area" localSheetId="2">'NORM'!$A$1:$H$20</definedName>` +
    `</definedNames>`

  wbXml = wbXml.replace(
    `<calcPr calcId="191028"/>`,
    `${printAreas}<calcPr calcId="191028" fullCalcOnLoad="1"/>`
  )

  zip.file("xl/workbook.xml", wbXml)

  // ─── DELETE CALC CHAIN ────────────────────────────────
  zip.remove("xl/calcChain.xml")

  // ─── WRITE BACK ───────────────────────────────────────
  zip.file("xl/worksheets/sheet1.xml", s1)
  zip.file("xl/worksheets/sheet2.xml", s2)
  zip.file("xl/worksheets/sheet3.xml", s3)
  zip.file("xl/sharedStrings.xml", buildSSXml())

  // ─── DOWNLOAD ─────────────────────────────────────────
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE"
  })

  saveAs(blob, `ASHA_Report_${headerData.month}_${headerData.year}.xlsx`)
}