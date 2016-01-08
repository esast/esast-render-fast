import {VariableDeclarator, VariableDeclarationConst} from 'esast/lib/Declaration'
import {ArrayPattern, AssignmentProperty, ObjectPattern, RestElement} from 'esast/lib/Pattern'
import {a, b, c} from './constants'
import {test, describeAndTest} from './test'

describe('Pattern', () => {
	describeAndTest(
		'ObjectPattern',
		'const {a,b:c}=a',
		new VariableDeclarationConst([
			new VariableDeclarator(
				new ObjectPattern([
					new AssignmentProperty(a),
					new AssignmentProperty(b, c)
				]),
				a)
		]))

	describe('ArrayPattern', () => {
		test(
			'missing element',
			'const [a,,b]=a',
			new VariableDeclarationConst(
				[new VariableDeclarator(new ArrayPattern([a, null, b]), a)]))

		test(
			'complex',
			'const [{a},...b]=a',
			new VariableDeclarationConst([
				new VariableDeclarator(
					new ArrayPattern([
						new ObjectPattern([new AssignmentProperty(a)]),
						new RestElement(b)
					]),
					a)
			]))
	})
})
