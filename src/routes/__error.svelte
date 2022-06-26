<script context="module">
  /**
   * @readonly
   * @enum {string}
   **/
  const ErrorType = {
    MissingDay: "MissingDay",
    Unknown: "Unknown",
  };

  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export const load = async ({ error, url }) => {
    let type = ErrorType.Unknown;
    if (error.message === "Failed to load image") {
      type = ErrorType.MissingDay;
    } else if (error.message === "There aren't that many answers yet") {
      type = ErrorType.MissingDay;
    } else if (error.message.startsWith("Unknown variable dynamic import:")) {
      type = ErrorType.MissingDay;
    } else if (error.message === "Answer isn't in the options list") {
      type = ErrorType.MissingDay;
    } else {
      console.error(error);
    }

    const top = url.pathname.replace(/\//, "").split("/")[0];
    const displayed = parseInt(top, 10);
    const game = displayed - 1;

    return { props: { type }, stuff: { game } };
  };
</script>

<script>
  import WhiteQuestionMark from "~icons/twemoji/face-with-spiral-eyes";
  import Banner from "$lib/Banner.svelte";

  /** @type {ErrorType} */
  export let type;
</script>

<main class="flex flex-col flex-1 items-center justify-between">
  <div
    class="w-full sm:w-3/4 flex flex-col gap-y-4 px-8 py-12 sm:py-8 font-medium"
  >
    <Banner style="error" icon={WhiteQuestionMark}>
      {#if type === ErrorType.MissingDay}
        There is no song for this day (yet — let me know!)<!-- todo: say today if it is today -->. You can use the dropdown above to pick another day.
      {:else if type === ErrorType.Unknown}
        There was an unknown error.
      {/if}
    </Banner>
  </div>
</main>
