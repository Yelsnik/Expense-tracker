import { ApiMiddleware } from './api.middleware';

describe('ApiMiddleware', () => {
  it('should be defined', () => {
    expect(new ApiMiddleware()).toBeDefined();
  });
});
