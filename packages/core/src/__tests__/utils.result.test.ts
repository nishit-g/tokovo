import { describe, expect, it } from "vitest";
import {
  Ok,
  Err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  mapErr,
  andThen,
  tryCatch,
  tryCatchAsync,
  createTokovoError,
  ErrorCodes,
} from "../utils/result";

describe("result utilities", () => {
  it("handles Ok/Err and type guards", () => {
    const ok = Ok(1);
    const err = Err(new Error("fail"));

    expect(isOk(ok)).toBe(true);
    expect(isErr(err)).toBe(true);
    expect(unwrap(ok)).toBe(1);
    expect(unwrapOr(err, 2)).toBe(2);
    expect(unwrapOr(ok, 2)).toBe(1);
    expect(() => unwrap(err)).toThrow("fail");
  });

  it("maps and chains results", () => {
    const ok = Ok(2);
    const mapped = map(ok, (v) => v * 2);
    expect(mapped).toEqual({ ok: true, value: 4 });

    const err = Err("nope");
    const mappedErr = mapErr(err, (e) => `${e}!`);
    expect(mappedErr).toEqual({ ok: false, error: "nope!" });

    const mappedErrOnOk = mapErr(ok, (e) => `${e}!`);
    expect(mappedErrOnOk).toEqual({ ok: true, value: 2 });

    const mapOnErr = map(err, (v) => v);
    expect(mapOnErr).toEqual({ ok: false, error: "nope" });

    const chained = andThen(ok, (v) => Ok(v + 1));
    expect(chained).toEqual({ ok: true, value: 3 });

    const chainedErr = andThen(err, (v) => Ok(v));
    expect(chainedErr).toEqual({ ok: false, error: "nope" });
  });

  it("wraps sync and async execution", async () => {
    expect(tryCatch(() => 1)).toEqual({ ok: true, value: 1 });
    const failure = tryCatch(() => {
      throw new Error("boom");
    });
    expect(failure.ok).toBe(false);

    const nonError = tryCatch(() => {
      throw "bad";
    });
    expect(nonError.ok).toBe(false);
    expect(nonError.error).toBeInstanceOf(Error);

    const okAsync = await tryCatchAsync(async () => 5);
    expect(okAsync).toEqual({ ok: true, value: 5 });

    const errAsync = await tryCatchAsync(async () => {
      throw "bad";
    });
    expect(errAsync.ok).toBe(false);
    expect(errAsync.error).toBeInstanceOf(Error);

    const errAsync2 = await tryCatchAsync(async () => {
      throw new Error("boom");
    });
    expect(errAsync2.ok).toBe(false);
  });

  it("creates tokovo errors and exposes codes", () => {
    const tokovoError = createTokovoError("INVALID", "Invalid", { a: 1 });
    expect(tokovoError.code).toBe("INVALID");
    expect(ErrorCodes.PLUGIN_NOT_FOUND).toBeDefined();
  });
});
