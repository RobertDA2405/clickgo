export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

import { useEffect, useState } from 'react';

/**
 * Simple debounce hook that returns a debounced version of a value.
 */
export function useDebouncedValue<T>(value: T, ms = 200) {
	const [v, setV] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setV(value), ms);
		return () => clearTimeout(t);
	}, [value, ms]);
	return v;
}