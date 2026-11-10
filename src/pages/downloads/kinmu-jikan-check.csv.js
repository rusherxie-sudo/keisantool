import { workTimeExampleCsvRows } from '../../data/work-time-examples.js';
import { csvText } from '../../lib/office-tools.js';

export function GET() {
  return new Response(csvText(workTimeExampleCsvRows()), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="kinmu-jikan-check.csv"',
    },
  });
}
