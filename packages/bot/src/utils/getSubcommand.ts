export const getSubcommand = <Possible extends string[]>(
  options: any
): Possible[number] => options.getSubcommand();

export default getSubcommand;
