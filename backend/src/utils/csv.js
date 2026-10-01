// Minimal RFC-4180-ish CSV parser (handles quoted fields containing commas,
// e.g. "Freeport, Texas"). Good enough for the small dataset files in
// backend/dataset — avoids pulling in a dependency for this.
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      pushField()
    } else if (char === '\r') {
      // ignore, handled by \n
    } else if (char === '\n') {
      pushRow()
    } else {
      field += char
    }
  }
  // last field/row (file may or may not end with a newline)
  if (field.length > 0 || row.length > 0) pushRow()

  if (rows.length === 0) return []
  const header = rows[0]
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v && v.trim() !== ''))
    .map((r) => Object.fromEntries(header.map((h, idx) => [h.trim(), (r[idx] ?? '').trim()])))
}
