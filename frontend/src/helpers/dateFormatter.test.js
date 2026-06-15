import dateFormatter, { formatRelativeTime, formatFullTime } from "./dateFormatter";

beforeEach(() => {
  jest.useFakeTimers();
  // 固定当前时间为 2020-01-01T12:00:00.000Z
  jest.setSystemTime(new Date("2020-01-01T12:00:00.000Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

it("should format an ISO string", () => {
  const ISOString = "2020-01-01T12:11:08.212Z";

  expect(dateFormatter(ISOString)).toBe("January 1, 2020");
});

describe("formatRelativeTime", () => {
  it("should return '刚刚' for less than 1 minute", () => {
    const updatedAt = "2020-01-01T11:59:30.000Z"; // 30秒前
    expect(formatRelativeTime(updatedAt)).toBe("刚刚");
  });

  it("should return 'X分钟前' for 1-59 minutes", () => {
    const updatedAt = "2020-01-01T11:30:00.000Z"; // 30分钟前
    expect(formatRelativeTime(updatedAt)).toBe("30分钟前");
  });

  it("should return 'X小时前' for 1-23 hours", () => {
    const updatedAt = "2020-01-01T07:00:00.000Z"; // 5小时前
    expect(formatRelativeTime(updatedAt)).toBe("5小时前");
  });

  it("should return 'X天前' for >=24 hours", () => {
    const updatedAt = "2019-12-30T12:00:00.000Z"; // 48小时前（2天前）
    expect(formatRelativeTime(updatedAt)).toBe("2天前");
  });

  it("should return null for null or undefined input", () => {
    expect(formatRelativeTime(null)).toBeNull();
    expect(formatRelativeTime(undefined)).toBeNull();
  });
});

describe("formatFullTime", () => {
  beforeAll(() => {
    process.env.TZ = 'UTC';
  });

  afterAll(() => {
    delete process.env.TZ;
  });

  it("should format ISO string to 'YYYY年MM月DD日 HH:mm'", () => {
    const updatedAt = "2020-01-01T12:11:08.212Z";
    expect(formatFullTime(updatedAt)).toBe("2020年01月01日 12:11");
  });

  it("should handle edge case midnight", () => {
    const updatedAt = "2020-12-31T00:00:00.000Z";
    expect(formatFullTime(updatedAt)).toBe("2020年12月31日 00:00");
  });
});
