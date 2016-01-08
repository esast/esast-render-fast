import {parse as acornParse} from 'acorn'
import Node from 'esast/lib/Node'
import fromJson from 'esast-from-json/lib/fromJSON'

/**
Parses source code.
@param {string} src JavaScript source code.
@param {object} options Options for [acorn](https://github.com/marijnh/acorn).
@return {Node}
*/
export default function parse(src: string, options: Object = {}): Node {
	options = Object.assign({}, baseOpts, options)
	return fromJson(acornParse(src, options))
}
const baseOpts = {
	ecmaVersion: 6,
	locations: true,
	sourceType: 'module'
}
