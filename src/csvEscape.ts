/**
 * Escapes a single CSV cell per RFC 4180-style quoting rules.
 */
export function csvEscape(cell: string): string {
  const needsQuotes =
    cell.includes(",") ||
    cell.includes('"') ||
    cell.includes("\n") ||
    cell.includes("\r");
  const escaped = cell.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Joins escaped cells into one CSV row.
 */
export function csvRow(cells: readonly string[]): string {
  return cells.map(csvEscape).join(",");
}
