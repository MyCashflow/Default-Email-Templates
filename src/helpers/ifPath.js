function toRegExp(pattern) {
	const source = pattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*\*/g, '\u0000')
		.replace(/\*/g, '[^/]*')
		.replace(/\u0000/g, '.*');
	return new RegExp(`^${source}$`);
}
module.exports = function(...args) {
	const options = args.pop();
	const current = this._page || options?.data?.root?._page || options?.data?.root?.page;
	const matched = args.some(pattern => toRegExp(pattern).test(current));
	return matched ? options.fn(this) : options.inverse(this);
};
