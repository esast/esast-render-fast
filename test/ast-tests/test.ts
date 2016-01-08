import * as assert from 'assert'
import Node from 'esast/lib/Node'
import {ExpressionStatement} from 'esast/lib/Statement'
import fromJson from 'esast-from-json/lib/fromJSON'
import render, {renderWithSourceMap} from '../../lib/render'
import parse from '../parse'
import {equal} from '../util'

function doTest(indentedSrc: string, ast: Node): void {
	const src = dedent(indentedSrc)
	const parsedAst = parseProgramBody(src)
	if (!equal(ast, parsedAst)) {
		console.log(JSON.stringify(ast, null, '\t'))
		console.log(JSON.stringify(parsedAst, null, '\t'))
		throw new Error('ASTs are different')
	}

	// Test parse+render with source maps.
	renderWithSourceMap(parse(src), 'in', 'out')

	const rendered = render(ast)
	if (src !== rendered) {
		console.log(`\`${src}\``)
		console.log(`\`${rendered}\``)
		throw new Error('Render is different')
	}
	assert(equal(ast, fromJson(ast.toJSON())))
}

export function test(description: string, src: string, ast: Node): void {
	it(description, () => {
		doTest(src, ast)
	})
}

export function describeAndTest(description: string, src: string, ast: Node): void {
	describe(description, () => {
		doTest(src, ast)
	})
}

function parseProgramBody(src: string): Node {
	const program: any = parse(src, {locations: false})
	assert(program.type === 'Program')
	assert(program.body.length === 1)
	const first = program.body[0]
	return first instanceof ExpressionStatement ? first.expression : first
}

// multi-line string literals like:
// `
// 	a
// 		b
// 	c`
// have too much indentation.
// This will change it to "a\n\tb\nc" by detecting the first line's indentation.
function dedent(str: string): string {
	if (str[0] !== '\n')
		return str

	str = str.slice(1)

	let indent: number
	for (indent = 0; indent < str.length; indent = indent + 1)
		if (str[indent] !== '\t')
			break

	const dedentedLines = str.split('\n').map(line => line.slice(indent))
	return dedentedLines.join('\n')
}
