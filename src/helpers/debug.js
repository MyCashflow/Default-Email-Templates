const HTML_OUTPUT = process.env.NODE_ENV !== 'production';
const MAX_LENGTH = 4000;

function safe(html) {
	return { toHTML: function() { return html; }, toString: function() { return html; } };
}

function serialise(value) {
	const seen = new WeakSet();

	const json = JSON.stringify(value, function(key, item) {
		if (typeof item === 'function') {
			return '[function]';
		}

		if (item && typeof item === 'object') {
			if (seen.has(item)) {
				return '[circular]';
			}

			seen.add(item);
		}

		return item;
	}, '\t');

	return json.length > MAX_LENGTH ? `${json.slice(0, MAX_LENGTH)}\n… truncated` : json;
}

// MCF reads interface tags straight out of the markup, comments included, so braces
// must be neutralised or the dump becomes executable. "--" would close the comment.
function comment(text) {
	const body = text
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;')
		.replace(/--/g, '&#45;&#45;');

	return `<!-- debug\n${body}\n-->`;
}

module.exports = function(...args) {
	const options = args.pop();
	const root = options?.data?.root ?? {};

	const context = args.length
		? args.reduce((picked, key) => Object.assign(picked, { [key]: this[key] ?? root[key] }), {})
		: Object.assign({}, root, this === root ? null : { _context: this });

	const dump = serialise(context);

	console.log(`debug [${root._page || root.page || 'unknown'}]\n${dump}`);

	return HTML_OUTPUT ? safe(comment(dump)) : '';
};
