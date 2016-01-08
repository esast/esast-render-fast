import {VariableDeclarator, VariableDeclarationConst, VariableDeclarationLet, VariableDeclarationVar
	} from 'esast/lib/Declaration'
import {a, b, one} from './constants'
import {test} from './test'

describe('VariableDeclaration', () => {
	test(
		'var',
		'var a',
		new VariableDeclarationVar([new VariableDeclarator(a)]))
	test(
		'let',
		'let a=1,b',
		new VariableDeclarationLet(
			[new VariableDeclarator(a, one), new VariableDeclarator(b)]))
	test(
		'const',
		'const a=1',
		new VariableDeclarationConst([new VariableDeclarator(a, one)]))
})
