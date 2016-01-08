import TemplateLiteral, {TaggedTemplateExpression, TemplateElement} from 'esast/lib/TemplateLiteral'
import {a, b} from './constants'
import {test, describeAndTest} from './test'

describe('TemplateLiteral', () => {
	describe('TemplateLiteral', () => {
		test(
			'plain',
			'`a${b}a`',
			new TemplateLiteral(
				[
					new TemplateElement(false, {cooked: 'a', raw: 'a'}),
					new TemplateElement(true, {cooked: 'a', raw: 'a'})
				],
				[b]))
		test(
			'raw string parts are empty',
			'`${a}${b}`',
			new TemplateLiteral(
				[
					new TemplateElement(false, {cooked: '', raw: ''}),
					new TemplateElement(false, {cooked: '', raw: ''}),
					new TemplateElement(true, {cooked: '', raw: ''})
				],
				[a, b]))
		test(
			'escape interpolation',
			'`$\\{a}`',
			new TemplateLiteral(
				[new TemplateElement(true, {cooked: '${a}', raw: '$\\{a}'})],
				[]))
		test(
			'escape \\n',
			'`\\n`',
			new TemplateLiteral(
				[
					new TemplateElement(true, {cooked: '\n', raw: '\\n'})
				],
				[]))
	})

	describeAndTest(
		'TaggedTemplateExpression',
		'a`a`',
		new TaggedTemplateExpression(
			a,
			new TemplateLiteral(
				[new TemplateElement(true, {cooked: 'a', raw: 'a'})],
				[])))
})
