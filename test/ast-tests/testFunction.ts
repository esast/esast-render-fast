import {UnaryExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionDeclaration, FunctionExpression} from 'esast/lib/Function'
import {a, b, blockDoOne, emptyBlock, emptyFun, one} from './constants'
import {test} from './test'

describe('Function', () => {
	describe('FunctionDeclaration', () => {
		test(
			'plain',
			'function a(b){}',
			new FunctionDeclaration(a, [b], emptyBlock))
		test(
			'generator',
			'function* a(){}',
			new FunctionDeclaration(a, [], emptyBlock, {generator: true}))
		// todo: waiting on https://github.com/jquery/esprima/issues/1079
		// test(
		// 	'async function a(){}',
		// 	new FunctionDeclaration(a, [], emptyBlock, {async: true}))
	})

	describe('FunctionExpression', () => {
		test(
			'empty',
			'typeof function(){}',
			new UnaryExpression('typeof', emptyFun))

		test(
			'named',
			'typeof function* a(){}',
			new UnaryExpression('typeof', new FunctionExpression(a, [], emptyBlock, {generator: true})))
	})

	describe('ArrowFunctionExpression', () => {
		test(
			'no args',
			'()=>1',
			new ArrowFunctionExpression([], one))
		test(
			'one arg',
			'a=>1',
			new ArrowFunctionExpression([a], one))
		test(
			'multiple args',
			'(a,b)=>1',
			new ArrowFunctionExpression([a, b], one))
		test(
			'block',
			`
				()=>{
					1
				}`,
			new ArrowFunctionExpression([], blockDoOne))
	})
})
