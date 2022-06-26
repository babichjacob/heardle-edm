<script>
  import { spring } from "svelte/motion";
  import Headphones from "~icons/twemoji/headphone";
  import { browser } from "$app/env";
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/stores";
  import { days } from "$lib/date";
  import { history, Result } from "$lib/history";
  import { range } from "$lib/utils";
  import "../app.css";

  const maxGame = Math.max(0, ~~days);
  const maxDisplay = maxGame + 1;

  const selectable = range(maxDisplay).map((i) => i + 1);

  const opacity = spring(1, { precision: 0.0001 });
  $: if ($navigating) {
    opacity.stiffness = 0.1;
    opacity.damping = 0.8;
    opacity.set(0.5);
  } else {
    opacity.stiffness = 0.3;
    opacity.damping = 0.9;
    $opacity = 1;
  }

  /** @type {Record<Result, string>} */
  const indicator = {
    [Result.Lost]: " ✗",
    [Result.Won]: " ✓",
    [Result.Unknown]: "  ",
    [Result.Unplayed]: " !",
  };
</script>

<div
  data-theme="sky"
  class="bg-primary text-on-primary font-light selection:bg-accent selection:text-on-accent"
  class:cursor-wait={$navigating}
>
  <div class="min-h-screen flex flex-col" style:opacity={$opacity}>
    <div class="min-h-screen flex flex-col">
      <header
        class="text-2xl sm:text-4xl justify-center flex p-8 gap-x-5 bg-primary-weak"
      >
        <span>
          <Headphones class="inline align-sub" />
          <a href="/" class="hover:underline decoration-2 underline-offset-4"
            ><span class="font-medium">Heardle</span> EDM</a
          >
        </span>
        {#if $page.url.pathname !== "/options/"}
          <span class="inline-block font-medium">
            #<select
              class="appearance-none w-[calc(4ch)] bg-transparent border-none [font-size:inherit] [font-weight:inherit] p-0 focus:outline-none cursor-pointer"
              on:change={(event) => {
                goto(`/${event.currentTarget.value}`);
              }}
              >{#each [...selectable, ...($page.stuff.game === undefined || selectable.includes($page.stuff.game + 1) ? [] : [$page.stuff.game + 1])] as i}<option
                  value={i}
                  selected={i === $page.stuff.game + 1}
                  >{i}{browser
                    ? indicator[$history[i - 1] ?? Result.Unplayed]
                    : ""}</option
                >{/each}</select
            >
          </span>
        {/if}
      </header>

      <slot />
    </div>

    <footer class="flex flex-col items-center bg-accent-faint">
      <div class="w-full sm:w-3/4 flex flex-col gap-y-4 px-8 py-12 sm:py-8">
        <div
          class="text-on-primary-weak leading-relaxed flex flex-col gap-y-4"
        >
          <p>
            Heardle EDM is not affiliated with Heardle.
          </p>
          <p>I made this game because we love Heardle but wished the music in the game fit our taste.</p>
          <p>Check out <a href="https://heardle.app" class="text-accent-strong hover:underline underline-offset-2 decoration-1" target="_blank">the original game</a> and <a href="https://ko-fi.com/heardle"  class="text-accent-strong hover:underline underline-offset-2 decoration-1" target="_blank">help support the creators</a>.</p>
        </div>
      </div>
    </footer>
  </div>
</div>

<svelte:head>
  <title>{$page.stuff.title ?? "Heardle EDM"}</title>
</svelte:head>
