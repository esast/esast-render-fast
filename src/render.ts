import * as Ast from 'esast/lib/ast'
import Node, {ArrowFunctionExpression, BlockStatement, ForInOfStatement, FunctionExpression, Identifier, ImportDefaultSpecifier,
	ImportNamespaceSpecifier, ImportSpecifier, Literal, Property} from 'esast/lib/ast'
import Loc, {Pos} from 'esast/lib/Loc'
import Op, {opEach} from 'op/Op'
import {SourceMapGenerator} from 'source-map/dist/source-map.min'

/** Create JavaScript source code from a [[Node]]. */
export default function render(ast: Node, options: RenderOptions = {}): string {
	setUp(options)
	e(ast)
	const res = strOut
	tearDown()
	return res
}

/**
Same as [[render]], but with a source map as part of the output.
@param inFilePath Name of input file.
@param outFilePath Name of output file.
*/
export function renderWithSourceMap(ast: Node, inFilePath: string, outFilePath: string, options: RenderOptions = {}): {code: string, sourceMap: string} {
	setUp(options)
	setUpSourceMaps(inFilePath, outFilePath)
	e(ast)
	const res = {code: strOut, sourceMap: sourceMap.toJSON()}
	tearDown()
	return res
}

export interface RenderOptions {
	/** If true, will not render unnecessary whitespace. */
	ugly?: boolean
}

// Must init these all before rendering.
let
	// rendering
	strOut: string,
	indentAmount: number,
	indentStr: string,
	// source maps
	usingSourceMaps: boolean,
	curAst: Node,
	inFilePath: string,
	sourceMap: SourceMapGenerator,
	outLine: number,
	outColumn: number,
	lastMappedAst: Op<Node>,
	// options
	ugly: boolean

function setUp(options: RenderOptions): void {
	ugly = Boolean(options.ugly)

	indentAmount = 0
	_setIndent()
	strOut = ''
	usingSourceMaps = false
}

function setUpSourceMaps(inPath: string, outPath: string): void {
	usingSourceMaps = true
	inFilePath = inPath
	sourceMap = new SourceMapGenerator({file: outPath})
	outLine = Pos.start.line
	outColumn = Pos.start.column
	lastMappedAst = null
}

function tearDown(): void {
	strOut = inFilePath = sourceMap = curAst = lastMappedAst = null
}

// Renders a single expression.
function e(ast: Node): void {
	if (usingSourceMaps)
		curAst = ast;
	(<any> ast)[renderSymbol]()
}

// Outputs a string.
// str may not contain newlines.
function o(str: string): void {
	strOut = strOut + str
	if (usingSourceMaps)
		_mapStr(str)
}

function interleave(asts: Array<Node>, str: string): void {
	if (!isEmpty(asts)) {
		const maxI = asts.length - 1
		for (let i = 0; i < maxI; i = i + 1) {
			e(asts[i])
			o(str)
		}
		e(asts[maxI])
	}
}

function paren(asts: Array<Node>): void {
	o('(')
	interleave(asts, ',')
	o(')')
}

function block(blockLines: Array<Node>, lineSeparator: string): void {
	if (isEmpty(blockLines))
		o('{}')
	else {
		o('{')
		indent()
		nl()
		lines(blockLines, lineSeparator)
		unindent()
		nl()
		o('}')
	}
}

function lines(lines: Array<Node>, lineSeparator: string): void {
	if (lines.length > 0) {
		const maxI = lines.length - 1
		for (let i = 0; i < maxI; i = i + 1) {
			e(lines[i])
			o(lineSeparator)
			nl()
		}
		e(lines[maxI])
	}
}

const indentStrs = ['']
function _setIndent(): void {
	indentStr = indentStrs[indentAmount]
	while (indentStr === undefined) {
		indentStrs.push(`${last(indentStrs)}\t`)
		indentStr = indentStrs[indentAmount]
	}
}

function indent(): void {
	if (!ugly) {
		indentAmount = indentAmount + 1
		_setIndent()
	}
}

function unindent(): void {
	if (!ugly) {
		indentAmount = indentAmount - 1
		_setIndent()
	}
}

function nl(): void {
	if (!ugly) {
		strOut = `${strOut}\n${indentStr}`
		if (usingSourceMaps)
			_mapNewLine()
	}
}

//Private
function _mapStr(str: string): void {
	if (curAst !== lastMappedAst)
		opEach(curAst.loc, loc => {
			sourceMap.addMapping({
				source: inFilePath,
				original: loc.start,
				generated: new Pos(outLine, outColumn)
			})
			lastMappedAst = curAst
		})
	outColumn = outColumn + str.length
}
function _mapNewLine(): void {
	outLine = outLine + 1
	outColumn = Pos.start.column + indentAmount
	// Mappings end at end of line. Must begin anew.
	lastMappedAst = null
}

// Implementations used more than once

function fun(): void {
	if (this.async)
		o('async ')
	o('function')
	if (this.generator)
		o('*')
	if (this.id !== null) {
		o(' ')
		e(this.id)
	}
	paren(this.params)
	e(this.body)
}

function arr(): void {
	if (isEmpty(this.elements))
		o('[]')
	else {
		o('[')
		interleave(this.elements, ',')
		o(']')
	}
}

function rClass(): void {
	o('class ')
	if (this.id !== null)
		e(this.id)
	if (this.superClass !== null) {
		o(' extends ')
		e(this.superClass)
	}
	e(this.body)
}

//-> function declaration
function forInOf(_: ForInOfStatement, kind: string): void {
	o('for(')
	e(_.left)
	o(kind)
	e(_.right)
	o(')')
	e(_.body)
}

//-> function declarations
function implementMany(holder: any, method: symbol, nameToImpl: any): void {
	Object.keys(nameToImpl).forEach((name: string) => {
		holder[name].prototype[method] = nameToImpl[name]
	})
}

function isEmpty<A>(arr: Array<A>): boolean {
	return arr.length === 0
}

function last<A>(arr: Array<A>): A {
	return arr[arr.length - 1]
}

const renderSymbol = Symbol('render')

implementMany(Ast, renderSymbol, {
	Program() {
		lines(this.body, ';')
	},

	Identifier() {
		o(this.name)
	},

	// Statements
	EmptyStatement() { },
	BlockStatement() {
		block(this.body, ';')
	},
	ExpressionStatement() {
		e(this.expression)
	},
	IfStatement() {
		o('if(')
		e(this.test)
		o(')')
		e(this.consequent)
		if (this.alternate !== null) {
			if (!(this.consequent instanceof BlockStatement))
				o(';')
			o(' else ')
			e(this.alternate)
		}
	},
	LabeledStatement() {
		e(this.label)
		o(':')
		e(this.body)
	},
	BreakStatement() {
		o('break')
		if (this.label !== null) {
			o(' ')
			e(this.label)
		}
	},
	ContinueStatement() {
		o('continue')
		if (this.label !== null) {
			o(' ')
			e(this.label)
		}
	},
	SwitchCase() {
		if (this.test === null)
			o('default')
		else {
			o('case ')
			e(this.test)
		}
		o(':')
		switch (this.consequent.length) {
			case 0:
				break
			case 1:
				e(this.consequent[0])
				break
			default:
				indent()
				nl()
				lines(this.consequent, ';')
				unindent()
		}
	},
	SwitchStatement() {
		o('switch(')
		e(this.discriminant)
		o(')')
		block(this.cases, '')
	},
	ReturnStatement() {
		if (this.argument === null)
			o('return')
		else {
			o('return ')
			e(this.argument)
		}
	},
	ThrowStatement() {
		o('throw ')
		e(this.argument)
	},
	CatchClause() {
		o('catch(')
		e(this.param)
		o(')')
		e(this.body)
	},
	TryStatement() {
		o('try ')
		e(this.block)
		if (this.handler !== null)
			e(this.handler)
		if (this.finalizer !== null) {
			o('finally')
			e(this.finalizer)
		}
	},
	WhileStatement() {
		o('while(')
		e(this.test)
		o(')')
		e(this.body)
	},
	DoWhileStatement() {
		o('do ')
		e(this.body)
		if (!(this.body instanceof BlockStatement))
			o(';')
		o(' while(')
		e(this.test)
		o(')')
	},
	ForStatement() {
		o('for(')
		if (this.init !== null)
			e(this.init)
		o(';')
		if (this.test !== null)
			e(this.test)
		o(';')
		if (this.update !== null)
			e(this.update)
		o(')')
		e(this.body)
	},
	ForInStatement() {
		forInOf(this, ' in ')
	},
	ForOfStatement() {
		forInOf(this, ' of ')
	},
	DebuggerStatement() {
		o('debugger')
	},

	// Declarations
	FunctionDeclaration: fun,
	VariableDeclarator() {
		e(this.id)
		if (this.init !== null) {
			o('=')
			e(this.init)
		}
	},
	VariableDeclaration() {
		o(this.kind)
		o(' ')
		interleave(this.declarations, ',')
	},

	// Expressions
	ThisExpression() {
		o('this')
	},
	ArrayExpression: arr,
	ObjectExpression() {
		if (isEmpty(this.properties))
			o('{}')
		else
			block(this.properties, ',')
	},
	PropertyPlain() {
		outputPropertyKey(this)
		o(':')
		e(this.value)
	},
	PropertyMethod() {
		if (this.value.async)
			o('async ')
		if (this.value.generator)
			o('*')
		outputPropertyFunction(this, this.value)
	},
	PropertyGet() {
		o('get ')
		outputPropertyFunction(this, this.value)
	},
	PropertySet() {
		o('set ')
		outputPropertyFunction(this, this.value)
	},

	FunctionExpression: fun,
	ArrowFunctionExpression() {
		if (this.params.length === 1 && this.params[0] instanceof Identifier)
			e(this.params[0])
		else
			paren(this.params)
		o('=>')
		e(this.body)
	},
	SequenceExpression() {
		interleave(this.expressions, ',')
	},
	UnaryExpression() {
		o(this.operator)
		o(' ')
		e(this.argument)
	},
	BinaryExpression() {
		o('(')
		e(this.left)
		o(this.operator === 'instanceof' ? ' instanceof ' : this.operator)
		e(this.right)
		o(')')
	},
	AssignmentExpression() {
		e(this.left)
		o(this.operator)
		e(this.right)
	},
	UpdateExpression() {
		if (this.prefix) {
			o(this.operator)
			e(this.argument)
		} else {
			e(this.argument)
			o(this.operator)
		}
	},
	LogicalExpression() {
		o('(')
		e(this.left)
		o(this.operator)
		e(this.right)
		o(')')
	},
	ConditionalExpression() {
		o('(')
		e(this.test)
		o('?')
		e(this.consequent)
		o(':')
		e(this.alternate)
		o(')')
	},
	NewExpression() {
		o('new (')
		e(this.callee)
		o(')')
		paren(this.arguments)
	},
	Super() {
		o('super')
	},
	CallExpression() {
		if (this.callee instanceof ArrowFunctionExpression) {
			o('(')
			e(this.callee)
			o(')')
		} else
			e(this.callee)
		paren(this.arguments)
	},
	SpreadElement() {
		o('...')
		e(this.argument)
	},
	MemberExpressionPlain() {
		e(this.object)
		//NumberLiteral
		if (this.object instanceof Literal && typeof this.object.value === 'number' &&
			this.object.value === (this.object.value | 0))
			o('..')
		else
			o('.')
		e(this.property)
	},
	MemberExpressionComputed() {
		e(this.object)
		o('[')
		e(this.property)
		o(']')
	},
	YieldExpression() {
		if (this.argument === null)
			o('(yield)')
		else {
			o(this.delegate ? '(yield* ' : '(yield ')
			if (this.argument !== null)
				e(this.argument)
			o(')')
		}
	},
	// Boolean, Number, RegExp all have same implementation
	Literal() {
		o(this.value.toString())
	},
	LiteralNull() {
		o('null')
	},
	LiteralString() {
		o('"')
		o(escapeStringForLiteral(this.value))
		o('"')
	},
	// Templates
	TemplateElement() {
		o(this.value.raw)
	},
	TemplateLiteral() {
		o('`')
		e(this.quasis[0])
		for (let i = 0; i < this.expressions.length; i = i + 1)	 {
			o('${')
			e(this.expressions[i])
			o('}')
			e(this.quasis[i + 1])
		}
		o('`')
	},
	TaggedTemplateExpression() {
		e(this.tag)
		e(this.quasi)
	},

	// Patterns
	AssignmentProperty() {
		e(this.key)
		if (this.key !== this.value) {
			o(':')
			e(this.value)
		}
	},
	ObjectPattern() {
		o('{')
		interleave(this.properties, ',')
		o('}')
	},
	ArrayPattern: arr,
	RestElement() {
		o('...')
		e(this.argument)
	},

	MethodDefinitionPlain() {
		if (this.static)
			o('static ')

		if (this.value.async)
			o('async ')
		if (this.value.generator)
			o('*')

		if (this.kind !== 'method') {
			o(this.kind) // 'get' or 'set'
			o(' ')
		}

		if (this.computed) {
			o('[')
			e(this.key)
			o(']')
		} else
			e(this.key)

		paren(this.value.params)
		e(this.value.body)
	},

	MethodDefinitionConstructor() {
		o('constructor')
		paren(this.value.params)
		e(this.value.body)
	},

	ClassBody() {
		block(this.body, '')
	},

	ClassDeclaration: rClass,
	ClassExpression: rClass,

	MetaProperty() {
		e(this.meta)
		o('.')
		e(this.property)
	},

	ImportDeclaration() {
		o('import ')

		let def: ImportDefaultSpecifier, namespace: ImportNamespaceSpecifier
		const specifiers: Array<ImportSpecifier> = []
		for (const s of this.specifiers)
			if (s instanceof ImportDefaultSpecifier)
				if (def === undefined)
					def = s
				else
					throw new Error('Multiple default imports')
			else if (s instanceof ImportNamespaceSpecifier)
				if (namespace === undefined)
					namespace = s
				else
					throw new Error('Multiple namespace imports')
			else
				// ImportSpecifier
				specifiers.push(s)

		let needComma = false
		if (def !== undefined) {
			e(def)
			needComma = true
		}
		if (namespace !== undefined) {
			if (needComma)
				o(',')
			e(namespace)
			needComma = true
		}
		if (!isEmpty(specifiers)) {
			if (needComma)
				o(',')
			o('{')
			interleave(specifiers, ',')
			o('}')
		}

		o(' from ')
		e(this.source)
	},
	ImportSpecifier() {
		if (this.imported === this.local)
			e(this.local)
		else {
			e(this.imported)
			o(' as ')
			e(this.local)
		}
	},
	ImportDefaultSpecifier() {
		e(this.local)
	},
	ImportNamespaceSpecifier() {
		o('* as ')
		e(this.local)
	},

	ExportSpecifier() {
		e(this.local)
		if (this.exported !== this.local) {
			o(' as ')
			e(this.exported)
		}
	},
	ExportNamedDeclaration() {
		o('export ')
		if (this.declaration === null) {
			o('{')
			interleave(this.specifiers, ',')
			o('}')
			if (this.source !== null) {
				o(' from ')
				e(this.source)
			}
		} else
			e(this.declaration)
	},
	ExportDefaultDeclaration() {
		o('export default ')
		e(this.declaration)
	},
	ExportAllDeclaration() {
		o('export * from ')
		e(this.source)
	}
})

function outputPropertyKey(_: Property) {
	if (_.computed) {
		o('[')
		e(_.key)
		o(']')
	} else
		e(_.key)
}

function outputPropertyFunction(_: Property, value: FunctionExpression) {
	outputPropertyKey(_)
	paren(value.params)
	e(value.body)
}

function escapeStringForLiteral(str: string): string {
	//todo: callback shouldn't have to be so verbose
	return str.replace(/[\\"\n\t\b\f\v\r\u2028\u2029]/g, ch => literalEscapes.get(ch))
}

const literalEscapes: Map<string, string> = new Map([
	['\\', '\\\\'],
	['"', '\\"'],
	['\n', '\\n'],
	['\t', '\\t'],
	['\b', '\\b'],
	['\f', '\\f'],
	['\v', '\\v'],
	['\r', '\\r'],
	['\u2028', '\\u2028'],
	['\u2029', '\\u2029']])
