import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/lib/api/schema.ts'],
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/**'],
              message:
                'Inside a feature use relative imports. Do not import other features via @/features; share via components/ or lib/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/(admin)/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/(staff)/**', '@/app/(parent)/**', '@/app/(student)/**', '@/app/(it)/**'],
              message: 'Admin pages must not import other portal side code.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
