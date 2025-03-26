import { expect, test } from 'vitest';
import { factorial } from '../factorial';

test('factorial of 0 is 1', () => {
  expect(factorial(0)).toBe(1);
});

test('factorial of 1 is 1', () => {
  expect(factorial(1)).toBe(1);
});

test('factorial of 5 is 120', () => {
  expect(factorial(5)).toBe(120);
});

test('factorial of 10 is 3628800', () => {
  expect(factorial(10)).toBe(3628800);
});