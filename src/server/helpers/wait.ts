/* eslint-disable implicit-arrow-linebreak */
export const wait = (amount = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, amount));
