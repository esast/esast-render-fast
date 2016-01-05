import * as assert from 'assert'
import Loc, {Pos} from 'esast/lib/Loc'
import {renderWithSourceMap} from '../lib/render'
import parse from './parse'
import {equal} from './util'

describe('source maps', () => {
	it('parse', () => {
		const src = 'debugger;\n1'
		const ast = parse(src)
		assert(equal(ast.loc, new Loc(new Pos(1, 0), new Pos(2, 1))))
		const {code, sourceMap} = renderWithSourceMap(ast, 'inFileName', 'outFileName.js')
		assert(code === src)

		assert(equal(sourceMap, {
			version: 3,
			sources: ['inFileName'],
			names: [],
			mappings: 'AAAA;AACA',
			file: 'outFileName.js'
		}))
	})
})
