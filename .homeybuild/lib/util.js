exports.normalize = function (value, min, max) {
	var normalized = (value - min) / (max - min);
	return Number(normalized.toFixed(2));
}

exports.denormalize = function (normalized, min, max) {
	var denormalized = ((1 - normalized) * (max - min) + min);
	return Number(denormalized.toFixed(0));
}
