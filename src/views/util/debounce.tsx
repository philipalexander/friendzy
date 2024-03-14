import { useEffect, useMemo, useRef } from "react";

export const useDebounce = (callback: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      (ref.current as any)?.();
    };

    return debounce(func, 500);
  }, []);

  return debouncedCallback;
};

export const debounce = (callback: any, delay: number) => {
  let timer: any;
  return function (...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {  callback(...args) }, delay)
  }
}