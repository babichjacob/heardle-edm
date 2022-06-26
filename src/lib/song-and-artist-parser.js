const pushIfNew = (arr, el) => arr.push(el);

/** @type {Record<string, string[]>} */
export const members = {
  "100 gecs [Laura Les & Dylan Brady]": ["Astrale"],
  "Auralen [Astrale]": ["Astrale"],
  "Can of Bliss": ["YeahRight!"], 
  Chromeo: ["Dave 1", "P-Thugg"],
  CloudNone: ["James Egbert"],
  dsg: [
    "Matt Lockshaw",
    "Direct",
    "YeahRight!",
    "Killabyte",
    "Ocular",
    "Redza",
    "QORA",
  ],
  "Echo Map": ["Synergy Sound"],
  "Eden Project": ["EDEN"],
  Ekcle: ["Tutara Peak", "David Gotham"],
  "Fall Out Boy": ["Patrick Stump", "TODO"],
  "food house [Gupi & Fraxiom]": ["Gupi", "Fraxiom"],
  "Gabby Start": ["Knapsack"],
  "Grant": ["Grant Bowtie"],
  Keepsake: ["Richard Caddock"],
  luminism: ["McCall", "TODO"],
  "Sarajevo Noise Beat": [], // HATE these guys too much to list them out (and it's not that I don't remember everyone in it...)
  "Siren": ["SirensCeol"],
  "six impala": ["NEUTRA", "KaTT", "underscores", "Helvetican", "SCRIPT"],
  "Tokyo Machine": ["Xilent"],
  "Virtual Self": ["Porter Robinson"],
  "webcage": ["Ubi", "Knapsack", "tetra", "To Oscar", "quickslvr", "dynastic", "bh", "Nebita", "torr", "daywaiter", "_st1cks", "evie atarax", "Rift", "Can of Bliss"],
};

export const oneArtist = [
  "100 gecs [Laura Les & Dylan Brady]",
  "Above & Beyond",
  "Black Country, New Road",
  "Case & Point",
  "Camo & Krooked",
  "Dossa & Locuzzed",
  "food house [Gupi & Fraxiom]",
  "Honey & Badger",
  "Jkyl & Hyde",
  "King Gizzard & The Lizard Wizard",
  "Louis Armstrong & His Hot Seven",
  "Nick Cave & The Bad Seeds",
  "Of Monsters and Men",
  "quickly, quickly",
  "The Geek x Vrv",
  "The World Is A Beautiful Place & I Am No Longer Afraid To Die",
  "Tyler, The Creator",
  "Vintage & Morelli",
];

/** @param {string} artistList */
const artistListToTokens = (artistList) => {
  return artistList
    .split(" & ");
};

const splitOneArtists = oneArtist.map(artistListToTokens);

/** @param {string} str */
const artistListToArtists = (str) => {
  const tokens = artistListToTokens(str);

  const artists = [];

  while (tokens.length !== 0) {
    let matchedAnyone = false;
    for (const [index, splitOneArtist] of splitOneArtists.entries()) {
      let matches = true;
      for (const [j, splitOneArtistPart] of splitOneArtist.entries()) {
        if (tokens[j] === splitOneArtistPart) continue;

        matches = false;
        break;
      }
      if (!matches) continue;

      matchedAnyone = true;
      artists.push(oneArtist[index]);
      tokens.splice(0, splitOneArtist.length);
      break;
    }
    if (!matchedAnyone) {
      artists.push(tokens.shift());
    }
  }

  return artists;
};

/** @param {string} str */
const analyzeWith = (str) => {
  const with_ = str.match(/^[Ww]ith/i);
  if (!with_) return;

  const withed = str.slice(with_[0].length).trimStart();
  const originalArtists = artistListToArtists(withed);

  return {
    originalArtists,
  };
};

/** @param {string} str */
const analyzeRemix = (str) => {
  const remix = str.match(/\b[Rr]emix$/i);
  if (!remix) return;

  const remixersList = str.slice(0, remix.index).trimEnd();
  const remixers = artistListToArtists(remixersList);

  return {
    remixers,
  };
};

/** @param {string} str */
const analyzeMix = (str) => {
  if (str === "Acoustic")
    return {
      mix: "Acoustic",
    };
  if (str === "Classical")
    return {
      mix: "Classical",
    };
  if (str === "Extended")
    return {
      mix: "Extended",
    };
  if (str === "Extended Mix")
    return {
      mix: "Extended",
      mixType: "Mix",
    };
  if (str === "Extended Version")
    return {
      mix: "Extended",
      mixType: "Version",
    };
  if (str === "Instrumental")
    return {
      mix: "Instrumental",
    };
  if (str === "Original Mix")
    return {
      mix: "Original",
      mixType: "Mix",
    };
  if (str === "Radio Edit")
    return {
      mix: "Radio",
      mixType: "Edit",
    };
  if (str === "Remastered")
    return {
      mixType: "Remastered",
    };
  if (str === "Remixes")
    return {
      remixes: true,
    };
  if (str === "Reprise")
    return {
      mixType: "Reprise",
    };
  if (str === "VIP Mix") {
    return {
      mix: "VIP",
      mixType: "Mix",
    };
  }
  if (str === "VIP") {
    return {
      mix: "VIP",
      mixType: "",
    };
  }
};

/** @param {string} inside */
const analyzeInsideGroupingSymbol = (inside) => {
  const withInfo = analyzeWith(inside);
  if (withInfo)
    return {
      originalArtists: withInfo.originalArtists,
    };

  const remixInfo = analyzeRemix(inside);
  if (remixInfo)
    return {
      remixers: remixInfo.remixers,
    };

  // TODO: check them at the end of the feature list as well
  const mixInfo = analyzeMix(inside);
  return mixInfo;
};

/** @param {string} str */
const analyzeParentheses = (str) => {
  const insideParentheses = str.match(/\((.+)\)$/);
  if (!insideParentheses)
    return {
      outsideBefore: str,
    };

  const inside = insideParentheses[1];
  const outsideBefore = str.slice(0, insideParentheses.index);

  const analyzed = analyzeInsideGroupingSymbol(inside);

  if (!analyzed)
    return {
      inside,
      outsideBefore,
    };

  return {
    ...analyzed,
    outsideBefore,
  };
};

/** @param {string} str */
const analyzeBrackets = (str) => {
  const insideBrackets = str.match(/\[(.+)\]$/);
  if (!insideBrackets)
    return {
      outsideBefore: str,
    };

  const inside = insideBrackets[1];
  const outsideBefore = str.slice(0, insideBrackets.index);

  const analyzed = analyzeInsideGroupingSymbol(inside);

  if (!analyzed)
    return {
      inside,
      outsideBefore,
    };

  return {
    ...analyzed,
    outsideBefore,
  };
};

/** @param {string} str */
const analyzeDash = (str) => {
  const [before, ...right] = str.split(" - ");
  const after = right.join(" - ");

  if (after === "") return { before };

  const remixInfo = analyzeRemix(after);

  if (remixInfo && remixInfo.remixers)
    return {
      before,
      remixers: remixInfo.remixers,
    };

  const mixInfo = analyzeMix(after);
  if (mixInfo) {
    return {
      before,
      ...mixInfo,
    };
  }

  return { after, before };
};

/**
 * @typedef {{
 *   mix: string | undefined,
 *   mixType: string | undefined,
 *   originalArtists: string[],
 *   remixers: string[],
 *   title: string,
 * }} SongInfo
 */

/**
 * @param {string} artistColumn
 * @param {string} trackColumn
 * @returns {SongInfo}
 */
export const parseSongInfo = (
  artistColumn,
  trackColumn,
 ) => {
  let mix = undefined;
  let mixType = undefined;
  /** @type {string[]} */
  const originalArtists = [];
  /** @type {string[]} */
  const remixers = [];
  let title = trackColumn;

  // Artist column
  const artistParenthesesInfo = analyzeParentheses(artistColumn);

  const [artistBeforeFeat, ...artistAfterFeat] =
    artistParenthesesInfo.outsideBefore.split(/\s[Ff](?:ea)?t\.?\s?/);

  originalArtists.push(...artistListToArtists(artistBeforeFeat.trimEnd()));
  if ("remixers" in artistParenthesesInfo)
    pushIfNew(remixers, ...(artistParenthesesInfo.remixers ?? []));


  // Track column
  const trackDashInfo = analyzeDash(trackColumn);
  const trackColumnBeforeDash = trackDashInfo.before.trimEnd();
  if (trackDashInfo.remixers) pushIfNew(remixers, ...trackDashInfo.remixers);
  if ("mixType" in trackDashInfo) mixType = trackDashInfo.mixType;
  if ("mix" in trackDashInfo) mix = trackDashInfo.mix;
    const trackBracketsInfo = analyzeBrackets(trackColumnBeforeDash);
    let trackColumnOutsideBefore = trackBracketsInfo.outsideBefore.trimEnd();
    if ("originalArtists" in trackBracketsInfo)
      pushIfNew(originalArtists, ...(trackBracketsInfo.originalArtists ?? []));
    if ("remixers" in trackBracketsInfo)
      pushIfNew(remixers, ...(trackBracketsInfo.remixers ?? []));
    if ("mix" in trackBracketsInfo) mix = trackBracketsInfo.mix;
    if ("mixType" in trackBracketsInfo) mixType = trackBracketsInfo.mixType;
    if ("inside" in trackBracketsInfo) title = trackColumnBeforeDash;
    else title = trackColumnOutsideBefore;

    const trackParenthesesInfo = analyzeParentheses(title);
    trackColumnOutsideBefore = trackParenthesesInfo.outsideBefore.trimEnd();
    if ("originalArtists" in trackParenthesesInfo)
      pushIfNew(
        originalArtists,
        ...(trackParenthesesInfo.originalArtists ?? [])
      );
    if ("remixers" in trackParenthesesInfo)
      pushIfNew(remixers, ...(trackParenthesesInfo.remixers ?? []));
    if ("mix" in trackParenthesesInfo) mix = trackParenthesesInfo.mix;
    if ("mixType" in trackParenthesesInfo)
      mixType = trackParenthesesInfo.mixType;
    if (trackParenthesesInfo.inside) title = trackColumnBeforeDash;
    else title = trackColumnOutsideBefore;

  return {
    mix,
    mixType,
    originalArtists,
    remixers,
    title,
  };
};
