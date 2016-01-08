declare module 'assert' {
	const assert: any
	export = assert
}

declare function describe(desc: string, test: () => void): void

declare function it(desc: string, test: () => void): void

declare module 'acorn' {
	export function parse(_: string, options: Object): Object
}

declare module 'benchmark' {
	class Suite {
		add(name: string, test: () => void): void;
		on(name: string, action: (_: any) => void): void;
		run(): void
	}
}

declare module 'escodegen' {
	export function generate(_: any, options?: any): string
}

declare module 'esotope' {
	export function generate(_: any): string
}

declare module 'fs' {
	export function readFileSync(file: string, encoding: string): string
}

declare const module: any

