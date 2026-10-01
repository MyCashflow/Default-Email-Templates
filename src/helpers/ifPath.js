module.exports = function(...args) {
	const options = args.pop();
	const current = this._page || options?.data?.root?._page || options?.data?.root?.page;
	return args.includes(current) ? options.fn(this) : options.inverse(this);
};
