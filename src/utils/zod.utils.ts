import { ZodError } from 'zod';

const buildNestedObject = (path: (string | number)[], message: string) => {
  if (path.length === 0) {
    return { _: message };
  }
  if (path.length === 1) {
    return { [path[0]]: message };
  }
  const [key, ...rest] = path;
  return { [key]: buildNestedObject(rest, message) };
};

const mergeObjects = (target: Object, source: Object) => {
  for (const key in source) {
    if (typeof target[key] === 'object' && typeof source[key] === 'object') {
      mergeObjects(target[key], source[key]);
    } else if (target[key]) {
      target[key] += `, ${source[key]}`;
    } else {
      target[key] = source[key];
    }
  }
};

export const getErrorsFromIssues = (issues: ZodError['issues']) => {
  const errorObject = {};
  issues.forEach(({ path, message }) => {
    const nestedError = buildNestedObject(path, message);
    mergeObjects(errorObject, nestedError);
  });
  return errorObject;
};
