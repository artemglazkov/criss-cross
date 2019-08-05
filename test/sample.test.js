'use strict';

const {expect} = require('chai');

describe('Sample Test', () => {
  it('1 eq 1', () => {
    expect(1).eq(1);
  });

  it('1 eq 1 async', async () => {
    const test = async (value) => Promise.resolve(value);

    let res = await test(1);

    expect(res).eq(1);
  });
});