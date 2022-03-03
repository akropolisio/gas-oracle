import { percentiles } from '../utils/percentiles';

describe('percentiles', () => {
  it('should calculate percentiles with R-7 method', () => {
    [
      {
        source: [5, 3, 16, 64, 10, 127, 15, 14, 152, 129],
        percents: [0, 25, 50, 90, 100],
      },
      {
        source: [12, 25, 73, 1, 39, 294, 234, 12826, 2715, 183, 22],
        percents: [0, 25, 50, 90, 100],
      },
      {
        source: [],
        percents: [0, 25, 50, 90, 100],
      },
      {
        source: [45],
        percents: [0, 25, 50, 90, 100],
      },
      {
        source: [92, 12],
        percents: [0, 25, 50, 90, 100],
      },
      {
        source: [51, 20, 102],
        percents: [],
      },
      {
        source: [1, -10, 20],
        percents: [50],
      },
    ].forEach(({ source, percents }) => {
      expect({
        source,
        percents,
        result: percentiles(source, percents),
      }).toMatchSnapshot();
    });
  });
});
