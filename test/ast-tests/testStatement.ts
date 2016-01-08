import {ArrowFunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {BlockStatement, CatchClause, DebuggerStatement, EmptyStatement, IfStatement,
	ReturnStatement, SwitchCase, SwitchStatement, ThrowStatement, TryStatement
	} from 'esast/lib/Statement'
import {blockDoOne, doOne, doTwo, emptyBlock, one, two} from './constants'
import {test, describeAndTest} from './test'

describe('Statement', () => {
	describeAndTest(
		'EmptyStatement',
		`
			{
				;
				1
			}`,
		new BlockStatement([new EmptyStatement(), doOne]))

	describe('BlockStatement', () => {
		test(
			'empty',
			'{}',
			emptyBlock)

		test(
			'single',
			`
				{
					1
				}`,
			blockDoOne)

		test(
			'multiple',
			`
				{
					1;
					2
				}`,
			new BlockStatement([doOne, doTwo]))
	})

	describe('IfStatement', () => {
		test(
			'no else',
			`
				if(1){
					1
				}`,
			new IfStatement(one, blockDoOne))
		test(
			'else',
			`
				if(1){
					1
				} else {
					1
				}`,
			new IfStatement(one, blockDoOne, blockDoOne))
		test(
			'non-block',
			'if(1)1; else 1',
			new IfStatement(one, doOne, doOne))
	})

	describeAndTest(
		'SwitchStatement',
		`
			switch(1){
				case 1:
				case 2:
					1;
					1
				default:{
					1
				}
			}`,
		new SwitchStatement(one, [
			new SwitchCase(one, []),
			new SwitchCase(two, [doOne, doOne]),
			new SwitchCase(null, [blockDoOne])
		]))

	describe('ReturnStatement', () => {
		test(
			'no value',
			`
				()=>{
					return
				}`,
			new ArrowFunctionExpression([], new BlockStatement([new ReturnStatement()])))
		test(
			'value',
			`
				()=>{
					return 1
				}`,
			new ArrowFunctionExpression([], new BlockStatement([new ReturnStatement(one)])))
	})

	describeAndTest(
		'ThrowStatement',
		'throw 1',
		new ThrowStatement(one))

	describeAndTest(
		'TryStatement',
		`
			try {
				1
			}catch(err){
				1
			}finally{
				1
			}`,
		new TryStatement(
			new BlockStatement([doOne]),
			new CatchClause(new Identifier('err'), blockDoOne),
			blockDoOne))

	describeAndTest(
		'DebuggerStatement',
		'debugger',
		new DebuggerStatement())
})
