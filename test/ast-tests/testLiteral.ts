import {LiteralNull, LiteralString, LiteralBoolean, LiteralNumber, LiteralRegExp
	} from 'esast/lib/Literal'
import {one} from './constants'
import {test} from './test'

describe('Literal', () => {
	test(
		'LiteralBoolean',
		'true',
		new LiteralBoolean(true))

	test(
		'LiteralNull',
		'null',
		new LiteralNull())

	describe('LiteralNumber', () => {
		test(
			'int',
			'1',
			one)

		test(
			'float',
			'1.5',
			new LiteralNumber(1.5))
	})

	test(
		'LiteralRegExp',
		// TODO:ES6 test`y` flag
		'/foo/gim',
		new LiteralRegExp(/foo/gim))

	test(
		'LiteralString',
		'"a\\nb\\u2029"',
		new LiteralString('a\nb\u2029'))
})
