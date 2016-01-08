import {VariableDeclarationConst, VariableDeclarationLet, VariableDeclarator
	} from 'esast/lib/Declaration'
import {BinaryExpression, UpdateExpression} from 'esast/lib/Expression'
import {BreakStatement, ContinueStatement, DoWhileStatement, ForStatement, ForInStatement,
	ForOfStatement, LabeledStatement, WhileStatement} from 'esast/lib/Loop'
import {ExpressionStatement} from 'esast/lib/Statement'
import {a, b, doOne, emptyBlock, one, two} from './constants'
import {test, describeAndTest} from './test'

describe('Loop', () => {
	describeAndTest(
		'WhileStatement',
		'while(1)1',
		new WhileStatement(one, doOne))

	describeAndTest(
		'DoWhileStatement',
		`
			do 1; while(1)`,
		new DoWhileStatement(doOne, one))

	describe('ForStatement', () => {
		test(
			'empty',
			'for(;;){}',
			new ForStatement(null, null, null, emptyBlock))
		test(
			'full',
			'for(let a=1;(a<2);a++)1',
			new ForStatement(
				new VariableDeclarationLet([new VariableDeclarator(a, one)]),
				new BinaryExpression('<', a, two),
				new UpdateExpression('++', a, false),
				doOne))
	})

	describe('ForInOfStatement', () => {
		const declareA = new VariableDeclarationConst([new VariableDeclarator(a)])

		describeAndTest(
			'ForInStatement',
			'for(const a in b)1',
			new ForInStatement(declareA, b, doOne))

		describeAndTest(
			'ForOfStatement',
			'for(const a of b)1',
			new ForOfStatement(declareA, b, doOne))
	})

	describe('BreakStatement', () => {
		test(
			'no label',
			'while(1)break',
			new WhileStatement(one, new BreakStatement()))
		test(
			'label',
			'a:while(1)break a',
			new LabeledStatement(a, new WhileStatement(one, new BreakStatement(a))))
	})

	describe('ContinueStatement', () => {
		test(
			'no label',
			'while(1)continue',
			new WhileStatement(one, new ContinueStatement()))

		test(
			'label',
			'a:while(1)continue a',
			new LabeledStatement(a, new WhileStatement(one, new ContinueStatement(a))))
	})

	describeAndTest(
		'LabeledStatement',
		'a:1',
		new LabeledStatement(a, new ExpressionStatement(one)))
})
