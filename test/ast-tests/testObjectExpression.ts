import {CallExpression} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import ObjectExpression, {ComputedName, PropertyGet, PropertyMethod, PropertyPlain, PropertySet
	} from 'esast/lib/ObjectExpression'
import {a, b, blockDoOne, litA, one, two} from './constants'
import {test} from './test'

describe('ObjectExpression', () => {
	// ObjectExpression
	test(
		'empty',
		// Put it inside a call or it will be confused for a BlockStatement
		'a({})',
		new CallExpression(a, [new ObjectExpression([])]))
	test(
		'properties',
		`
			a({
				a:1,
				b(){
					1
				},
				*a(){
					1
				},
				[a]:2,
				get b(){
					1
				},
				set ["a"](a){
					1
				}
			})`,
		new CallExpression(a, [
			new ObjectExpression([
				new PropertyPlain(a, one),
				new PropertyMethod(
					b,
					new FunctionExpression(null, [], blockDoOne)),
				new PropertyMethod(
					a,
					new FunctionExpression(null, [], blockDoOne, {generator: true})),
				// todo:
				// new Property('init', b,
				// 	new FunctionExpression(null, [], blockDoOne, {async: true}),
				// 	false, true),
				new PropertyPlain(new ComputedName(a), two),
				new PropertyGet(b, new FunctionExpression(null, [], blockDoOne)),
				new PropertySet(new ComputedName(litA), new FunctionExpression(null, [a], blockDoOne))
			])
		]))
})
