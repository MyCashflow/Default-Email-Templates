function safe(html) {
	return { toHTML: function() { return html; }, toString: function() { return html; } };
}

function quote(value) {
	return String(value).replace(/'/g, '&#39;');
}

module.exports = function(name, options) {
	const args = Object.keys(options.hash)
		.filter(key => options.hash[key] !== undefined && options.hash[key] !== '')
		.map(key => {
			const value = options.hash[key];
			return typeof value === 'string'
				? `${key}: '${quote(value)}'`
				: `${key}: ${value}`;
		});

	return safe(args.length ? `{${name}(${args.join(', ')})}` : `{${name}}`);
};
