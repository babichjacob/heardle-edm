<script context="module">
  import { writable } from "svelte/store";

  import { browser } from "$app/env";
  import answers from "$lib/answers.json";

  export const prerender = true;

  /**
   * @readonly
   * @enum {string}
   **/
  const Copied = {
    Never: "Never",
    Forgot: "Forgot",
    Error: "Error",
    Yes: "Yes",
  };

  /**
   * @readonly
   * @enum {string}
   **/
  const Status = {
    Unused: "Unused",
    Skipped: "Skipped",
    GotArtist: "GotArtist",
    Wrong: "Wrong",
    Correct: "Correct",
  };

  /**
   * @readonly
   * @enum {string}
   */
  const Stage = {
    Zero: "0",
    One: "1",
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Won: "Won",
    Lost: "Lost",
  };

  /** @type {Record<Copied, string>} */
  const BAR = {
    [Status.Unused]: "⬜",
    [Status.Skipped]: "⬛",
    [Status.GotArtist]: "🟨",
    [Status.Wrong]: "🟥",
    [Status.Correct]: "🟩",
  };

  // TODO: consider displaying these instead
  const lengths = ["½", "1", "2", "4", "8", "16"];

  const website = "https://heardle-edm.web.app/";

  const needed = (guesses) =>
    guesses.filter((guess) => guess.status !== Status.Unused);

  const share = (won, guesses, displayed, withGuesses) => {
    const took = needed(guesses);

    return `Heardle EDM ${displayed} ${won ? took.length : "X"}/6\n${
      won ? (took.length <= 2 ? "🔊" : took.length <= 4 ? "🔉" : "🔈") : "🔇"
    }${guesses.map((guess) => BAR[guess.status]).join("")}${
      withGuesses
        ? `\n\nMy guesses:\n${took
            .map(
              (guess) =>
                `${guess.status !== Status.Skipped ? "||" : ""}${
                  guess.status === Status.Correct ? "🥳 " : ""
                }${
                  guess.status === Status.Skipped
                    ? "⏩"
                    : " ".repeat(Math.floor(Math.random() * 60)) +
                      guess.text +
                      " ".repeat(Math.random() * 60)
                }${guess.status !== Status.Skipped ? "||" : ""}`
            )
            .join("\n")}`
        : ""
    }\n\n<${website}>`;
  };

  const setup = answers.indexOf("");

  /** @type {import("@sveltejs/kit").Load} */
  export const load = async ({ params }) => {
    const displayed = parseInt(params.displayed, 10);
    const game = displayed - 1;

    const options = (await import("$lib/options.json")).default;

    const answer = answers[game];

    if (game >= setup)
      return {
        error: new Error("There aren't that many answers yet"),
        status: 404,
      };

    if (!options.includes(answer))
      return {
        error: new Error("Answer isn't in the options list"),
        status: 500,
      };

    /** @type {string} */
    const image = (await import(`../songs/${answer}/cover.png`)).default;

    if (browser) {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = (e) => {
          reject(new Error("Failed to load image"));
        };
        img.src = image;
      });
    }

    const sources = {
      [Stage.Zero]: (await import(`../songs/${answer}/0.mp3`)).default,
      [Stage.One]: (await import(`../songs/${answer}/1.mp3`)).default,
      [Stage.Two]: (await import(`../songs/${answer}/2.mp3`)).default,
      [Stage.Three]: (await import(`../songs/${answer}/3.mp3`)).default,
      [Stage.Four]: (await import(`../songs/${answer}/4.mp3`)).default,
      [Stage.Five]: (await import(`../songs/${answer}/5.mp3`)).default,
    };

    const input = writable("");

    const guesses = writable([
      ...Array.from(Array(6)).map(() => ({
        text: "",
        status: Status.Unused,
      })),
    ]);

    const [answerArtist, answerTrack] = partition(answer, " - ");
    const answerSongInfo = parseSongInfo(answerArtist, answerTrack);
    const answerArtists = [
      ...answerSongInfo.originalArtists,
      ...answerSongInfo.remixers,
    ];
    for (const band of [...answerArtists]) {
      for (const member of members[band] ?? []) {
        answerArtists.push(member);
      }
    }
    answerArtists.push();

    const submitter = (stage) => (guess) => {
      input.set("");

      if (!options.includes(guess)) {
        return stage.toString();
      }

      if (guess === answer) {
        guesses.update(($guesses) => {
          $guesses[stage].text = guess;
          $guesses[stage].status = Status.Correct;
          return $guesses;
        });

        history.update(($history) => {
          $history[game] = Result.Won;
          return $history;
        });

        return Stage.Won;
      }

      const [guessArtist, guessTrack] = partition(guess, " - ");
      const guessSongInfo = parseSongInfo(guessArtist, guessTrack);
      const guessArtists = [
        ...guessSongInfo.originalArtists,
        ...guessSongInfo.remixers,
      ];
      for (const band of [...guessArtists]) {
        for (const member of members[band] ?? []) {
          guessArtists.push(member);
        }
      }
      const sharedArtist = guessArtists.some((artist) =>
        answerArtists.includes(artist)
      );
      const yellows = true; // game >= 25;

      if (sharedArtist && yellows) {
        guesses.update(($guesses) => {
          $guesses[stage].text = guess;
          $guesses[stage].status = Status.GotArtist;
          return $guesses;
        });
      } else {
        guesses.update(($guesses) => {
          $guesses[stage].text = guess;
          $guesses[stage].status = Status.Wrong;
          return $guesses;
        });
      }

      if (stage === 5) {
        history.update(($history) => {
          $history[game] = Result.Lost;
          return $history;
        });
        return Stage.Lost;
      }
      return (stage + 1).toString();
    };

    const skipper = (stage) => () => {
      input.set("");

      guesses.update(($guesses) => {
        $guesses[stage].text = "Skipped";
        $guesses[stage].status = Status.Skipped;
        return $guesses;
      });

      if (stage === 5) {
        history.update(($history) => {
          if ($history[game] !== Result.Won) $history[game] = Result.Lost;
          return $history;
        });
        return Stage.Lost;
      }
      return (stage + 1).toString();
    };

    const stage = finite({
      [Stage.Zero]: {
        submit: submitter(0),
        skip: skipper(0),
      },
      [Stage.One]: {
        submit: submitter(1),
        skip: skipper(1),
      },
      [Stage.Two]: {
        submit: submitter(2),
        skip: skipper(2),
      },
      [Stage.Three]: {
        submit: submitter(3),
        skip: skipper(3),
      },
      [Stage.Four]: {
        submit: submitter(4),
        skip: skipper(4),
      },
      [Stage.Five]: {
        submit: submitter(5),
        skip: skipper(5),
      },
      [Stage.Won]: {},
      [Stage.Lost]: {},
    });

    const copied = finite({
      [Copied.Never]: {
        failed(e) {
          return Copied.Error;
        },
        successful() {
          return Copied.Yes;
        },
      },
      [Copied.Forgot]: {
        failed(e) {
          return Copied.Error;
        },
        successful() {
          return Copied.Yes;
        },
      },
      [Copied.Yes]: {
        async __auto() {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return Copied.Forgot;
        },
      },
      [Copied.Error]: {
        async __auto() {
          await new Promise((resolve) => setTimeout(resolve, 4000));
          return Copied.Forgot;
        },
      },
    });

    return {
      props: {
        answer,
        copied,
        game,
        guesses,
        image,
        input,
        options: browser ? options : [],
        stage,
        sources,
      },
      stuff: {
        game,
        title: `Heardle EDM #${game + 1}`,
      },
    };
  };
</script>

<script>
  import { slide } from "svelte/transition";
  import finite from "@babichjacob/finite";
  import { localStorageStore } from "@babichjacob/svelte-localstorage/svelte-kit";
  import Artist from "~icons/twemoji/microphone";
  import FingersCrossed from "~icons/twemoji/crossed-fingers";
  import Check from "~icons/twemoji/check-mark";
  import Eyes from "~icons/twemoji/eyes";
  import FastForward from "~icons/twemoji/fast-forward-button";
  import FearfulFace from "~icons/twemoji/fearful-face";
  import PartyingFace from "~icons/twemoji/partying-face";
  import BlushingFace from "~icons/twemoji/smiling-face-with-smiling-eyes";
  import SobbingFace from "~icons/twemoji/loudly-crying-face";
  import Waving from "~icons/twemoji/waving-hand";
  import X from "~icons/twemoji/cross-mark";
  import { days, ended } from "$lib/date";
  import { history, Result } from "$lib/history";
  import Banner from "$lib/Banner.svelte";
  import { members, parseSongInfo } from "$lib/song-and-artist-parser";
  import { partition } from "$lib/utils";

  export let answer;
  export let copied;
  export let game;
  export let guesses;
  export let image;
  export let input;
  export let options;
  export let stage;
  export let sources;

  const optionsDatalistId = "datalist-510925908125";

  /** @type {Record<Status, (any)>} TODO: right type */
  const icons = {
    [Status.Unused]: undefined,
    [Status.Skipped]: FastForward,
    [Status.Wrong]: X,
    [Status.GotArtist]: Artist,
    [Status.Correct]: Check,
  };

  const volume = localStorageStore("volume", 1);
  const withGuesses = localStorageStore("with-guesses", true);
</script>

<main class="flex flex-col flex-1 items-center">
  {#if game > days}
    <div class="w-full sm:w-3/4 flex flex-col px-8 py-12 sm:py-8">
      <Banner style="warning" icon={Eyes}>
        Taking a sneak peek at upcoming days? You should know that they're
        probably going to change, even at the last minute!<br />
        If you're here by accident, click the Heardle EDM link above to return to
        today's song.
      </Banner>
    </div>
  {:else if game === ended}
    <div class="w-full sm:w-3/4 flex flex-col px-8 py-12 sm:py-8">
      <Banner style="warning" icon={Waving}>
        Heardle EDM has concluded!<br />
        Here's the last day uploaded. As always, you can use the dropdown above to pick another day.
      </Banner>
    </div>
  {/if}
  <div class="flex-1 w-full flex flex-col items-center">
    <div class="w-full sm:w-3/4 flex flex-col gap-y-8 px-8 py-12 sm:py-8">
      <Banner style="info">
        {#if $stage === Stage.Zero}
          Listen to the snippet and try to make your first guess below. You can
          look at the whole list of options or type to search through it. <br />
          Good luck! <FingersCrossed class="inline align-sub" />
        {:else}
          Yellow means your guess contained one or more of the artists involved
          in the correct song — collab aliases and rebrands respected.
        {/if}
      </Banner>

      <table
        class="border-separate [border-spacing:0_1rem] -mt-[1rem] font-light cursor-default text-base"
      >
        {#each $guesses as guess, i}
          {@const current = $stage === i.toString()}
          {@const border = `border-t border-b last:border-r ${
            current
              ? current
                ? "border-on-primary-faint"
                : "border-on-primary-faint"
              : "border-transparent"
          }`}
          {@const td = `py-2 px-4 ${border}`}
          <tr
            class:bg-primary-weak={guess.status === Status.Unused}
            class:text-on-primary-weak={guess.status === Status.Unused}
            class:bg-error={guess.status === Status.Wrong}
            class:text-on-error={guess.status === Status.Wrong}
            class:bg-warning={guess.status === Status.GotArtist}
            class:text-on-warning={guess.status === Status.GotArtist}
            class:bg-good={guess.status === Status.Correct}
            class:text-on-good={guess.status === Status.Correct}
            class:bg-on-primary-weak={guess.status === Status.Skipped}
            class:text-primary={guess.status === Status.Skipped}
          >
            <td class="w-0 {td} border-l tabular-nums text-center">{i + 1}</td>
            <td
              class="{td} w-0 {[Status.Correct, Status.Wrong].includes(
                guess.status
              )
                ? 'brightness-[999]'
                : ''}"><svelte:component this={icons[guess.status]} /></td
            >
            <td
              class={td}
              class:border-l={[Status.Skipped, Status.Wrong].includes(
                guess.status
              )}>{guess.text}</td
            >
          </tr>
        {/each}
      </table>
    </div>
  </div>

  <div class="bg-accent-faint flex flex-col items-center w-full">
    <div class="w-full sm:w-3/4 flex flex-col p-8 gap-y-8">
      {#if [Stage.Won, Stage.Lost].includes($stage)}
        <div class="flex flex-col gap-y-16 sm:gap-y-8" transition:slide|local>
          <div
            class="text-5xl sm:text-8xl font-black tracking-tight leading-tight"
          >
            {#if $stage === Stage.Won}<PartyingFace class="inline align-sub" /> You
              got it!{/if}{#if $stage === Stage.Lost}<SobbingFace
                class="inline align-sub"
              />
              You didn't get it...{/if}
          </div>

          <div class="text-5xl font-semibold text-on-primary-weak">It was</div>
          <div class="bg-accent-faint-darker p-8 flex flex-col">
            <p class="text-6xl break-words">
              <img
                alt="Cover art"
                src={image}
                class="w-full sm:h-40 sm:w-40 sm:mx-auto md:float-left md:mr-8 mb-8"
              />
              <span class="flex flex-col gap-y-8">
                <span class="font-semibold text-multiply mt-0.5"
                  >{answer.split(" - ")[0]}</span
                >
                <span class="font-extrabold text-multiply-weak mb-8"
                  >{answer.split(" - ")[1]}</span
                >
              </span>
            </p>
            <audio bind:volume={$volume} controls class="w-full">
              {#key sources}
                <source src={sources[Stage.Five]} />
              {/key}
            </audio>
          </div>

          <div class="flex flex-row justify-between">
            <div class="font-bold -mt-2">
              <button
                class="px-4 py-2 [font-weight:inherit] mr-2 mt-2 focus:outline-none"
                class:cursor-default={$copied === Copied.Yes ||
                  $copied === Copied.Error}
                class:bg-accent={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:hover:bg-accent-lighter={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:hover:bg-accent-darker={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:active:bg-accent-darker={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:text-on-accent={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:focus:ring={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:focus:ring-on-accent={$copied === Copied.Never ||
                  $copied === Copied.Forgot}
                class:bg-primary={$copied === Copied.Yes}
                class:text-on-primary={$copied === Copied.Yes}
                class:bg-error={$copied === Copied.Error}
                class:text-on-error={$copied === Copied.Error}
                on:click={async () => {
                  const text = share(
                    $stage === Stage.Won,
                    $guesses,
                    game + 1,
                    $withGuesses
                  );
                  try {
                    await navigator.clipboard.writeText(text);

                    copied.successful();
                  } catch (e) {
                    copied.failed(e);
                  }
                }}
                >{#if $copied === Copied.Yes}Copied to clipboard!{:else if $copied === Copied.Error}Couldn't
                  copy to your clipboard <FearfulFace
                    class="inline align-sub"
                  />{:else}Share your results{/if}<!-- TODO: focus styles --></button
              ><span
                >{#if $copied === Copied.Never || $copied === Copied.Forgot}
                  <span class="mr-2">on Discord</span
                  ><!-- TODO: focus styles --><select
                    class="appearance-none [font-size:inherit] [font-weight:inherit] bg-primary text-on-primary px-4 py-2 mt-2 cursor-pointer focus:outline-none"
                    bind:value={$withGuesses}
                    ><option value={true}
                      >with your guesses spoiler tagged.</option
                    ><option value={false}>without your guesses.</option
                    ></select
                  >{/if}</span
              >
            </div>
          </div>
        </div>
      {/if}

      {#if $stage === Stage.Won}
        <div
          transition:slide
          class="text-on-primary-weak text-lg leading-relaxed flex flex-col gap-y-4"
        >
          Congratulations on today's victory! You might enjoy guessing other
          songs in the archive (accessible through the dropdown at the top of
          the page).
        </div>
      {/if}
      {#if $stage === Stage.Lost}
        <div
          transition:slide
          class="text-on-primary-weak text-lg leading-relaxed flex flex-col gap-y-4"
        >
          <p>
            I pick songs carefully so that Heardle EDM can be for everyone! Even
            if it wasn't for you today, tomorrow is a new opportunity with a
            different style of song that could be within your reach. For the
            time being, try playing through the archive (with the dropdown at
            the top of the page) to get your footing.
          </p>
          <p>
            Thanks for playing today, and I hope to see you back tomorrow! <BlushingFace
              class="inline align-sub"
            />
          </p>
        </div>
      {/if}

      {#if ![Stage.Won, Stage.Lost].includes($stage)}
        <div class="flex justify-between gap-x-8">
          {#key $stage}
            {#key sources}
              <audio bind:volume={$volume} controls class="flex-1">
                <source src={sources[$stage]} />
              </audio>
            {/key}
          {/key}
        </div>

        <form
          class="flex flex-col gap-y-4"
          transition:slide|local
          on:submit|preventDefault={() => {
            stage.submit($input);
          }}
        >
          <input
            bind:value={$input}
            type="text"
            list={optionsDatalistId}
            class="appearance-none rounded-none focus:outline-none text-base shadow-none flex-1 bg-primary  px-4 py-2 border border-on-primary-faint focus:border-accent focus:ring focus:ring-accent"
          />

          <div class="flex justify-between items-center">
            <button
              type="button"
              on:click={() => {
                console.log("skipping!");
                stage.skip();
              }}
              class="bg-primary-faint hover:bg-primary-faint-lighter focus:outline-none focus:ring focus:ring-accent active:bg-primary-faint-darker px-4 py-2 font-bold"
              >{#if $stage !== Stage.Five}Skip{:else}Give Up{/if}</button
            >
            <a
              class="text-lg text-accent-strong hover:underline underline-offset-2 decoration-1"
              href="/options/"
              target="_blank">View the whole options list</a
            >
            <button
              type="submit"
              class="bg-accent hover:bg-accent-lighter focus:outline-none focus:ring focus:ring-on-accent active:bg-accent-darker px-4 py-2 font-bold text-on-accent"
              >Submit</button
            >
          </div>

          <datalist id={optionsDatalistId}>
            {#each options as option}
              <option value={option} />
            {/each}
          </datalist>
        </form>
      {/if}
    </div>
  </div>
</main>
