import {parse as acornParse} from 'acorn'
import {Suite} from 'benchmark'
import fromJson from 'esast-from-json/from-json'
import {generate as escodegen} from 'escodegen'
import {generate as esotope} from 'esotope'
import {readFileSync} from 'fs'
import render, {renderWithSourceMap} from '../lib/render'
import parse from './parse'

function test(tests: any) {
	const suite = new Suite()
	for (const name in tests)
		suite.add(name, tests[name])
	suite.on('complete', function() {
		this.forEach((_: any) =>
			console.log(`${_.name}: ${_.stats.mean * 1000}ms`))
	})
	suite.on('error', err => {
		throw err.target.error
	})
	suite.run()
}

if (!module.parent) {
	const src = readFileSync('./node_modules/escodegen/escodegen.js', 'utf-8')
	const json = acornParse(src, {
		ecmaVersion: 6,
		locations: true,
		sourceType: 'module'
	})
	const ast = parse(src)

	render(ast)

	test({
		esast() {
			return render(ast, {ugly: true})
		},
		esastWithMaps() {
			return renderWithSourceMap(ast, 'in', 'out.js', {ugly: true})
		},
		escodegen() {
			return escodegen(json)
		},
		escodegenWithMaps() {
			return escodegen(json, {sourceMap: 'in', sourceMapWithCode: true})
		},
		esotope() {
			return esotope(json)
		},
		fromJson() {
			return fromJson(json)
		}
	})
}
