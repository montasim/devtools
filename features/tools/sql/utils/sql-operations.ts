import { format } from 'sql-formatter';

export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'tsql';

export const SQL_DIALECTS: { value: SqlDialect; label: string }[] = [
    { value: 'sql', label: 'Standard SQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'tsql', label: 'T-SQL' },
];

export function formatSql(sql: string, dialect: SqlDialect = 'sql'): string {
    return format(sql, {
        language: dialect,
        tabWidth: 2,
        keywordCase: 'upper',
    });
}

export function escapeSqlString(input: string): string {
    return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

export function unescapeSqlString(input: string): string {
    return input.replace(/\\\\/g, '\\').replace(/''/g, "'");
}

export function minifySql(sql: string): string {
    // Remove -- line comments
    let result = sql.replace(/--[^\n]*/g, '');
    // Remove /* block comments */
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    // Collapse whitespace to single space
    result = result.replace(/\s+/g, ' ');
    return result.trim();
}
