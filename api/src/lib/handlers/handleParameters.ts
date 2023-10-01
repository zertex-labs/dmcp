import { removeExtensions } from './extension';

export const ParamRegExp = {
  SQUARE_BRACKETS: /\[(.*)\]/gu,
  WILD_CARD: /\[\.\.\..+\]/gu,
  MULTIPLE: /\]-\[/gu,
  ROUTE_PARAMETER: /\]\/\[/gu
} as const satisfies Record<string, RegExp>;

const actions: ((o: string) => string)[] = [
  (o) => removeExtensions(o, ['.ts', '.js']),
  (o) => o.replace(ParamRegExp.WILD_CARD, () => '*'),
  (o) =>
    o.replace(ParamRegExp.SQUARE_BRACKETS, (_, match) => `:${String(match)}`),
  (o) =>
    o
      .replace(ParamRegExp.MULTIPLE, '-:')
      .replace(ParamRegExp.ROUTE_PARAMETER, '/')
];

export const handleParameters = (part: string, debug = false) => {
  return actions.reduce((acc, action, k) => {
    const out = action(acc);
    debug && console.table({ action: k, input: acc, output: out });
    return out;
  }, part);
};

export default handleParameters;
