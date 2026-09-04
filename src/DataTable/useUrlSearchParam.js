import { useCallback, useState } from 'react';

function readParam(name, defaultValue, parse) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(name);
  return raw === null ? defaultValue : parse ? parse(raw) : raw;
}

function writeParam(name, value, defaultValue) {
  const params = new URLSearchParams(window.location.search);
  if (String(value) === String(defaultValue)) {
    params.delete(name);
  } else {
    params.set(name, String(value));
  }
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.pushState(null, '', url);
}

const parseToNumber = (raw) => {
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? raw : parsed;
};

export function useUrlSearchParam(name, defaultValue = '', parse) {
  const [value, setValueState] = useState(() =>
    readParam(name, defaultValue, parse),
  );

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next;
      setValueState(resolved);
      writeParam(name, resolved, defaultValue);
    },
    [name, defaultValue, value],
  );

  return [value, setValue];
}

export { parseToNumber };
