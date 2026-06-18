export interface CsvParseOptions {
    delimiter?: string;
    hasHeader?: boolean;
    trimWhitespace?: boolean;
}

export interface CsvParseResult {
    headers: string[];
    rows: string[][];
    rowCount: number;
    colCount: number;
    isValid: boolean;
    error?: string;
}

export interface CsvStats {
    rowCount: number;
    colCount: number;
    emptyCount: number;
    delimiter: string;
    hasHeader: boolean;
}

export function detectDelimiter(input: string): string {
    const sample = input.slice(0, 2000);
    const candidates = [',', ';', '\t', '|'];
    let best = ',';
    let bestCount = -1;

    for (const delimiter of candidates) {
        // Count occurrences outside quoted fields in the first few lines
        let count = 0;
        let inQuote = false;
        for (let i = 0; i < sample.length; i++) {
            const ch = sample[i];
            if (ch === '"') {
                if (inQuote && sample[i + 1] === '"') {
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (!inQuote && ch === delimiter) {
                count++;
            }
        }
        if (count > bestCount) {
            bestCount = count;
            best = delimiter;
        }
    }

    return best;
}

function parseRow(line: string, delimiter: string): string[] {
    const fields: string[] = [];
    let i = 0;
    const len = line.length;

    while (i <= len) {
        if (i === len) {
            fields.push('');
            break;
        }

        if (line[i] === '"') {
            // Quoted field
            i++; // skip opening quote
            let field = '';
            while (i < len) {
                if (line[i] === '"') {
                    if (i + 1 < len && line[i + 1] === '"') {
                        // Escaped quote
                        field += '"';
                        i += 2;
                    } else {
                        // Closing quote
                        i++;
                        break;
                    }
                } else {
                    field += line[i];
                    i++;
                }
            }
            fields.push(field);
            // Skip delimiter
            if (i < len && line[i] === delimiter) {
                i++;
            }
        } else {
            // Unquoted field
            const start = i;
            while (i < len && line[i] !== delimiter) {
                i++;
            }
            fields.push(line.slice(start, i));
            if (i < len) {
                i++; // skip delimiter
            } else {
                break;
            }
        }
    }

    return fields;
}

function tokenizeRows(input: string, delimiter: string): string[][] {
    const rows: string[][] = [];
    let i = 0;
    const len = input.length;
    let currentLine = '';
    let inQuote = false;

    while (i < len) {
        const ch = input[i];

        if (ch === '"') {
            if (inQuote && input[i + 1] === '"') {
                currentLine += '""';
                i += 2;
                continue;
            }
            inQuote = !inQuote;
            currentLine += ch;
            i++;
        } else if ((ch === '\r' || ch === '\n') && !inQuote) {
            // End of row
            if (ch === '\r' && input[i + 1] === '\n') {
                i++; // skip \r\n as one
            }
            rows.push(parseRow(currentLine, delimiter));
            currentLine = '';
            i++;
        } else {
            currentLine += ch;
            i++;
        }
    }

    // Last line (no trailing newline)
    if (currentLine.length > 0 || rows.length === 0) {
        rows.push(parseRow(currentLine, delimiter));
    }

    return rows;
}

export function parseCsv(input: string, options?: CsvParseOptions): CsvParseResult {
    const delimiter = options?.delimiter ?? detectDelimiter(input);
    const hasHeader = options?.hasHeader ?? true;
    const trimWhitespace = options?.trimWhitespace ?? true;

    if (!input.trim()) {
        return {
            headers: [],
            rows: [],
            rowCount: 0,
            colCount: 0,
            isValid: false,
            error: 'Input is empty',
        };
    }

    try {
        const allRows = tokenizeRows(input, delimiter);

        if (allRows.length === 0) {
            return {
                headers: [],
                rows: [],
                rowCount: 0,
                colCount: 0,
                isValid: false,
                error: 'No rows found',
            };
        }

        const applyTrim = (value: string) => (trimWhitespace ? value.trim() : value);

        let headers: string[];
        let dataRows: string[][];

        if (hasHeader && allRows.length >= 1) {
            headers = allRows[0].map(applyTrim);
            dataRows = allRows.slice(1).map((row) => row.map(applyTrim));
        } else {
            const colCount = Math.max(...allRows.map((r) => r.length));
            headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
            dataRows = allRows.map((row) => row.map(applyTrim));
        }

        const colCount = headers.length;

        return {
            headers,
            rows: dataRows,
            rowCount: dataRows.length,
            colCount,
            isValid: true,
        };
    } catch (e) {
        return {
            headers: [],
            rows: [],
            rowCount: 0,
            colCount: 0,
            isValid: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}

export function csvToJson(input: string, options?: CsvParseOptions): string {
    const result = parseCsv(input, options);

    if (!result.isValid) {
        throw new Error(result.error ?? 'Failed to parse CSV');
    }

    const objects = result.rows.map((row) => {
        const obj: Record<string, string> = {};
        result.headers.forEach((header, idx) => {
            obj[header] = row[idx] ?? '';
        });
        return obj;
    });

    return JSON.stringify(objects, null, 2);
}

function escapeCsvField(value: string, delimiter: string): string {
    const needsQuoting =
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes('\n') ||
        value.includes('\r');

    if (!needsQuoting) return value;

    return '"' + value.replace(/"/g, '""') + '"';
}

export function jsonToCsv(input: string, delimiter = ','): string {
    let parsed: unknown;

    try {
        parsed = JSON.parse(input);
    } catch (e) {
        throw new Error(e instanceof Error ? `Invalid JSON: ${e.message}` : 'Invalid JSON input');
    }

    if (!Array.isArray(parsed)) {
        throw new Error('JSON input must be an array of objects');
    }

    if (parsed.length === 0) {
        return '';
    }

    const firstItem = parsed[0];
    if (typeof firstItem !== 'object' || firstItem === null || Array.isArray(firstItem)) {
        throw new Error('JSON input must be an array of objects (not primitives or nested arrays)');
    }

    const headers = Object.keys(firstItem as Record<string, unknown>);

    const headerRow = headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter);

    const dataRows = parsed.map((item) => {
        if (typeof item !== 'object' || item === null) {
            throw new Error('All array items must be objects');
        }
        const record = item as Record<string, unknown>;
        return headers
            .map((header) => {
                const value = record[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object')
                    return escapeCsvField(JSON.stringify(value), delimiter);
                return escapeCsvField(String(value), delimiter);
            })
            .join(delimiter);
    });

    return [headerRow, ...dataRows].join('\n');
}

export function getCsvStats(input: string): CsvStats {
    if (!input.trim()) {
        return {
            rowCount: 0,
            colCount: 0,
            emptyCount: 0,
            delimiter: ',',
            hasHeader: true,
        };
    }

    const delimiter = detectDelimiter(input);
    const result = parseCsv(input, { delimiter, hasHeader: true });

    let emptyCount = 0;
    for (const row of result.rows) {
        for (const cell of row) {
            if (cell.trim() === '') emptyCount++;
        }
    }

    return {
        rowCount: result.rowCount,
        colCount: result.colCount,
        emptyCount,
        delimiter,
        hasHeader: true,
    };
}
