import {ArrayExpression, AssignmentExpression, BinaryExpression, CallExpression,
	ConditionalExpression, LogicalExpression, MemberExpressionComputed, MemberExpressionPlain,
	MetaProperty, NewExpression, SequenceExpression, SpreadElement, ThisExpression, UpdateExpression,
	UnaryExpression, YieldDelegateExpression, YieldExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionDeclaration} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {LiteralNumber} from 'esast/lib/Literal'
import {BlockStatement, ExpressionStatement} from 'esast/lib/Statement'
import {a, b, c, one, two} from './constants'
import {test, describeAndTest} from './test'

describe('Expression', () => {
	// ThisExpression
	describeAndTest(
		'ThisExpression',
		'this',
		new ThisExpression())

	describe('ArrayExpression', () => {
		test(
			'empty',
			'[]',
			new ArrayExpression([]))
		test(
			'plain',
			'[1,2]',
			new ArrayExpression([one, two]))
		test(
			'spread',
			'[...1]',
			new ArrayExpression([new SpreadElement(one)]))
	})

	describeAndTest(
		'SequenceExpression',
		'a,b',
		new SequenceExpression([a, b]))

	describe('UnaryExpression', () => {
		test(
			'prefix',
			'typeof a',
			new UnaryExpression('typeof', a))
		test(
			'double prefix',
			'- - 1',
			new UnaryExpression('-', new UnaryExpression('-', one)))
	})

	describeAndTest(
		'BinaryExpression',
		'((a+b) instanceof c)',
		new BinaryExpression('instanceof', new BinaryExpression('+', a, b), c))

	describeAndTest(
		'AssignmentExpression',
		'a+=1',
		new AssignmentExpression('+=', a, one))

	describe('UpdateExpression', () => {
		test(
			'prefix',
			'++a',
			new UpdateExpression('++', a, true))
		test(
			'suffix',
			'a--',
			new UpdateExpression('--', a, false))
	})

	describeAndTest(
		'LogicalExprsession',
		'(a||b)',
		new LogicalExpression('||', a, b))

	describeAndTest(
		'ConditionalExpression',
		'(a?b:c)',
		new ConditionalExpression(a, b, c))

	describe('NewExpression', () => {
		test(
			'no args',
			'new (a)()',
			new NewExpression(a, []))
		test(
			'one arg',
			'new (a)(b)',
			new NewExpression(a, [b]))
		test(
			'complex type',
			'new (a(b))(c)',
			new NewExpression(new CallExpression(a, [b]), [c]))
	})

	describe('CallExpression', () => {
		test(
			'plain',
			'a(b)',
			new CallExpression(a, [b]))
		test(
			'complex callee',
			'(a=>a)(1)',
			new CallExpression(new ArrowFunctionExpression([a], a), [one]))
		test(
			'with spread',
			'a(...b)',
			new CallExpression(a, [new SpreadElement(b)]))
		test(
			'complex spread',
			'a(...(1+1))',
			new CallExpression(a, [new SpreadElement(new BinaryExpression('+', one, one))]))
	})

	describe('MemberExpression', () => {
		test(
			'plain',
			'a.b',
			new MemberExpressionPlain(a, b))
		test(
			'computed',
			'a[1]',
			new MemberExpressionComputed(a, one))
		test(
			'of int',
			'1..a',
			new MemberExpressionPlain(one, a))
		test(
			'of float',
			'1.5.a',
			new MemberExpressionPlain(new LiteralNumber(1.5), a))
	})

	describeAndTest(
		'YieldLike',
		`
			function* a(){
				(yield);
				(yield 1);
				(yield* 2)
			}`,
		new FunctionDeclaration(
			a,
			[],
			new BlockStatement([
				new ExpressionStatement(new YieldExpression(null)),
				new ExpressionStatement(new YieldExpression(one)),
				new ExpressionStatement(new YieldDelegateExpression(two))]),
			{generator: true}))

	describeAndTest(
		'MetaProperty',
		`
			function a(){
				new.target
			}`,
		new FunctionDeclaration(
			a,
			[],
			new BlockStatement([
				new ExpressionStatement(
					new MetaProperty(new Identifier('new'), new Identifier('target')))])))
})
