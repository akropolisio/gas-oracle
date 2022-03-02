export function percentiles(array: number[], percents: number[]): number[] {
  const sortedArray = [...array].sort((a, b) => a - b);
  const { length } = sortedArray;

  if (length === 0) {
    return [];
  }

  return length > 0
    ? percents.map(percent => {
        if (percent >= 100 || length === 1) {
          return sortedArray[length - 1];
        }

        const i = ((length - 1) * percent) / 100;
        const floor = Math.floor(i);
        return sortedArray[floor] + (i - floor) * (sortedArray[floor + 1] - sortedArray[floor]);
      })
    : [];
}
