import {VariableDeclarator, VariableDeclarationConst} from 'esast/lib/Declaration'
import {FunctionDeclaration} from 'esast/lib/Function'
import {ExportSpecifier, ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration,
	ImportDeclaration, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier
	} from 'esast/lib/Program'
import {a, b, c, emptyBlock, litA, one} from './constants'
import {test, describeAndTest} from './test'

describe('Program', () => {
	describe('ImportDeclaration', () => {
		test(
			'ImportSpecifier',
			'import {a,b as c} from "a"',
			new ImportDeclaration([new ImportSpecifier(a), new ImportSpecifier(b, c)], litA))
		test(
			'ImportNamespaceSpecifier',
			'import * as a from "a"',
			new ImportDeclaration([new ImportNamespaceSpecifier(a)], litA))
		test(
			'ImportDefaultSpecifier',
			'import a from "a"',
			new ImportDeclaration([new ImportDefaultSpecifier(a)], litA))
		test(
			'ImportDeclaration',
			'import a,{b} from "a"',
			new ImportDeclaration([new ImportDefaultSpecifier(a), new ImportSpecifier(b)], litA))
	})

	describe('exports', () => {
		describe('ExportNamedDeclaration', () => {
			test(
				'declaration',
				'export const a=1',
				new ExportNamedDeclaration(
					new VariableDeclarationConst([new VariableDeclarator(a, one)]),
					[],
					null))
			test(
				'ExportSpecifier',
				'export {a,b as c} from "a"',
				new ExportNamedDeclaration(
					null,
					[new ExportSpecifier(a), new ExportSpecifier(c, b)],
					litA))
		})

		describe('ExportDefaultDeclaration', () => {
			test(
				'value',
				'export default 1',
				new ExportDefaultDeclaration(one))
			test(
				'declaration',
				'export default function a(){}',
				new ExportDefaultDeclaration(
					new FunctionDeclaration(a, [], emptyBlock, false)))
		})

		describeAndTest(
			'ExportAllDeclaration',
			'export * from "a"',
			new ExportAllDeclaration(litA))
	})
})
