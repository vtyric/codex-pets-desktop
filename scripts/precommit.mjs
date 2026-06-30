import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const prettierExtensions = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.jsx',
    '.mjs',
    '.scss',
    '.ts',
    '.tsx',
    '.yaml',
    '.yml',
]);
const eslintExtensions = new Set([
    '.cjs',
    '.cts',
    '.js',
    '.jsx',
    '.mjs',
    '.mts',
    '.ts',
    '.tsx',
]);

const run = (command, args) => {
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        shell: false,
    });

    if (result.error) {
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

const output = spawnSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
    {
        encoding: 'utf8',
        shell: false,
    },
);

if (output.error) {
    console.error(output.error.message);
    process.exit(1);
}

const stagedFiles = output.stdout
    .split('\0')
    .filter(Boolean)
    .filter(existsSync);

if (stagedFiles.length === 0) {
    console.log('No staged files to check.');
    process.exit(0);
}

const extensionOf = (file) => {
    const match = file.match(/(\.[^./]+)$/);
    return match?.[1] ?? '';
};

const prettierFiles = stagedFiles.filter((file) =>
    prettierExtensions.has(extensionOf(file)),
);
const eslintFiles = stagedFiles.filter((file) =>
    eslintExtensions.has(extensionOf(file)),
);

if (prettierFiles.length > 0) {
    run('pnpm', [
        'exec',
        'prettier',
        '--check',
        '--ignore-unknown',
        ...prettierFiles,
    ]);
}

if (eslintFiles.length > 0) {
    run('pnpm', ['exec', 'eslint', ...eslintFiles]);
}

console.log('Pre-commit checks passed.');
