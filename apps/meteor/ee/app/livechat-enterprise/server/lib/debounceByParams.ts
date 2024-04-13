import mem from 'mem';

import { debounce } from '../../../../../app/utils/debounce';

interface IMemoizeDebouncedFunction<F extends (...args: any[]) => any> {
	(...args: Parameters<F>): void;
	flush: (...args: Parameters<F>) => void;
}

// Debounce `func` based on passed parameters
// ref: https://github.com/lodash/lodash/issues/2403#issuecomment-816137402
export function memoizeDebounce<P extends any[], F extends (...args: P) => any>(func: F, wait = 0): IMemoizeDebouncedFunction<F> {
	const debounceMemo = mem((..._args: Parameters<F>) => debounce(func, wait));

	function wrappedFunction(this: IMemoizeDebouncedFunction<F>, ...args: Parameters<F>): ReturnType<F> | void {
		return debounceMemo(...args)(...args);
	}

	wrappedFunction.flush = (...args: Parameters<F>): void => {
		debounceMemo(...args).flush();
	};

	return wrappedFunction as unknown as IMemoizeDebouncedFunction<F>;
}
