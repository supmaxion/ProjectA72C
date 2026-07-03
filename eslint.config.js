import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
	js.configs.recommended,
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			// Vite/React 17+ automatikus JSX transform mellett nem kell
			// import React-ot minden JSX fájl tetejére, ez a szabály erre
			// figyelmeztetne feleslegesen -> kikapcsoljuk
			'react/react-in-jsx-scope': 'off',

			// Ez a szabály kapja el a nem használt, deklarált
			// paramétereket/változókat (pl. a Sun.js `direction`/`distance`
			// esetét)
			'no-unused-vars': ['error', {
				args: 'all',
				argsIgnorePattern: '^_',
				vars: 'all',
			}],
		},
		settings: {
			react: { version: 'detect' },
		},
	},
	{
		// tesztfájlokban a vitest describe/it/expect explicit importból jön,
		// nincs szükség külön globálisokra
		files: ['**/*.test.{js,jsx}'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
]
