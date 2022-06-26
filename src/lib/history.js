import { localStorageStore } from "@babichjacob/svelte-localstorage/svelte-kit";

/**
 * @readonly
 * @enum {string}
 **/
export const Result = {
    Unknown: "Unknown",
    Unplayed: "Unplayed",
    Won: "Won",
    Lost: "Skipped",
};

/** @type {Record<string, Result>} */
const initialHistory = {
    // There was no progress tracking for these days
    "0": Result.Unknown,
    "1": Result.Unknown,
    "2": Result.Unknown,
    "3": Result.Unknown,
    "4": Result.Unknown,
    "5": Result.Unknown,
    "6": Result.Unknown,
    "7": Result.Unknown,
    "8": Result.Unknown,
    "9": Result.Unknown,
    "10": Result.Unknown,
    "11": Result.Unknown,
    "12": Result.Unknown,
    "13": Result.Unknown,
}

export const history = localStorageStore("history", initialHistory);
