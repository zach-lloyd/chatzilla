const mockDisconnect = vi.fn();

// Need to mock the entire Action Cable module for these tests.
vi.mock("@rails/actioncable", () => ({
  createConsumer: vi.fn().mockReturnValue({
    disconnect: mockDisconnect,
  }),
}));

describe("cable service", () => {
  beforeEach(() => {
    // This resets the module cache, ensuring each test gets a fresh start.
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("getConsumer creates a consumer only on the first call", async () => {
    // I had to use dynamic imports for these tests to silence an error that
    // said "cannot access mockDisconnect before initialization". It seems that
    // both the vi.mock call above and my import statements were being hoisted to
    // the top of the file. When the import statements ran, it triggered the vi.mock
    // call before mockDisconnect was defined, creating an error.
    const { createConsumer } = await import("@rails/actioncable");
    const { getConsumer } = await import("../services/cable");

    getConsumer();
    expect(createConsumer).toHaveBeenCalledTimes(1);

    getConsumer();
    expect(createConsumer).toHaveBeenCalledTimes(1);
  });

  test("disconnectConsumer calls the underlying disconnect method", async () => {
    const { createConsumer } = await import("@rails/actioncable");
    const { getConsumer, disconnectConsumer } = await import(
      "../services/cable"
    );

    getConsumer(); // This call caches the consumer instance.
    disconnectConsumer();

    // Assert that the mockDisconnect function we defined outside was called.
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
