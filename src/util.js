export function bind(callerObj, method) {
	return function() {
		return method.apply(callerObj, arguments);
	};
}
