import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // ไม่ได้ใช้ eslint-plugin-react จึงไม่มีกฎที่นับการใช้งานใน JSX
      // คอมโพเนนต์ที่ถูกอ้างใน JSX เท่านั้นเลยถูกมองว่า "ไม่ถูกใช้"
      // จึงยกเว้นชื่อขึ้นต้นด้วยตัวใหญ่ ทั้งตัวแปรและพารามิเตอร์ที่ destructure มา
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
