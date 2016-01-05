export function equal(a: any, b: any): boolean {
	if (typeof a === 'object') {
		if (typeof b !== 'object')
			return false

		if (a === null)
			return b === null

		const keys = Object.keys(a)
		if (b === null) {
			console.log('Only first has ', a)
			return false
		}
		if (Object.keys(b).length !== keys.length) {
			console.log('different keys', keys, Object.keys(b))
			return false
		}
		return keys.every(key => equal(a[key], b[key]))
	} else
		return a === b
}
