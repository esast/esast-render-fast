import {FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {LiteralNumber, LiteralString} from 'esast/lib/Literal'
import {BlockStatement, ExpressionStatement} from 'esast/lib/Statement'

export const
	a = new Identifier('a'), b = new Identifier('b'), c = new Identifier('c'),
	one = new LiteralNumber(1), two = new LiteralNumber(2),
	doOne = new ExpressionStatement(one), doTwo = new ExpressionStatement(two),
	blockDoOne = new BlockStatement([doOne]),
	emptyBlock = new BlockStatement([]),
	emptyFun = new FunctionExpression(null, [], emptyBlock),
	emptyGenFun = new FunctionExpression(null, [], emptyBlock, {generator: true}),
	litA = new LiteralString('a')
