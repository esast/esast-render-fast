import Identifier from 'esast/lib/Identifier'
import {describeAndTest} from './test'

describeAndTest(
	'Identifier',
	'foo',
	new Identifier('foo'))
