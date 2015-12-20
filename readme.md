Super-fast renderer for [esast](https://github.com/esast/esast).
Output is not very pretty. For beauty use [escodegen](https://github.com/estools/escodegen) instead.
(escodegen will work on esast trees because they mimic untyped trees.)

## Install

	npm install --save esast/esast-render-fast
	# or:
	bower install --save esast/esast-render-fast


## Use

	import {BinaryExpression, Literal} from 'esast/lib/ast'
	import {renderWithSourceMap} from 'esast-render-fast/lib/render'

	const four = new BinaryExpression('+', new Literal(2), new Literal(2))
	const {code, sourceMap} = renderWithSourcemap(four, 'input-file.xyz', 'output-file.js', {ugly: false})

## Time

Here are estimates of rendering time when run on a sample tree (the escodegen source code).

Name | Render time | Render time with source maps
:-: | :-: | :-:
esast-render-fast | 1.5ms | 17ms
[escodegen](https://github.com/estools/escodegen) | 7ms | 120ms
[esotope](https://github.com/inikulin/esotope) | 2.5ms | not supported

Converting from an untyped tree takes about 6ms, so using esast-render-fast won't help your render times if you're not directly construction esast trees. (And if not, why not?)
