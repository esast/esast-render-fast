import {ClassBody, ClassDeclaration, ClassExpression, MethodDefinitionConstructor,
	MethodDefinitionGet, MethodDefinitionPlain, MethodDefinitionSet, Super} from 'esast/lib/Class'
import {CallExpression, MemberExpressionPlain, UnaryExpression} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import {ComputedName} from 'esast/lib/ObjectExpression'
import {BlockStatement, ExpressionStatement} from 'esast/lib/Statement'
import {a, b, c, emptyBlock, emptyFun, emptyGenFun, litA} from './constants'
import {test} from './test'

describe('Class', () => {
	test(
		'ClassDeclaration',
		`
			class a extends b{
				constructor(){}
				a(){}
				*a(){}
				get b(){}
				set c(a){}
				static a(){}
				["a"](){}
				static get ["a"](){}
			}`,
		new ClassDeclaration(
			a,
			b,
			new ClassBody([
				new MethodDefinitionConstructor(emptyFun),
				new MethodDefinitionPlain(a, emptyFun),
				new MethodDefinitionPlain(a, emptyGenFun),
				// todo: new MethodDefinitionPlain(a, emptyAsyncFun, 'method'),
				new MethodDefinitionGet(b, emptyFun),
				new MethodDefinitionSet(c, new FunctionExpression(null, [a], emptyBlock)),
				new MethodDefinitionPlain(a, emptyFun, {static: true}),
				new MethodDefinitionPlain(new ComputedName(litA), emptyFun),
				new MethodDefinitionGet(new ComputedName(litA), emptyFun, {static: true})
			])))

	test(
		'ClassExpression',
		`typeof class a{}`,
		new UnaryExpression('typeof', new ClassExpression(a, null, new ClassBody([]))))

	describe('Super', () => {
		test(
			'call',
			`
				class a extends b{
					constructor(){
						super()
					}
				}`,
			new ClassExpression(a, b, new ClassBody([
				new MethodDefinitionConstructor(
					new FunctionExpression(null, [], new BlockStatement([
						new ExpressionStatement(
							new CallExpression(new Super(), []))])))])))
		test(
			'member',
			`
				class a extends b{
					constructor(){
						super.a
					}
				}`,
			new ClassExpression(a, b, new ClassBody([
				new MethodDefinitionConstructor(
					new FunctionExpression(null, [], new BlockStatement([
						new ExpressionStatement(
							new MemberExpressionPlain(new Super(), a))])))])))
	})
})
