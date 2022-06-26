<script context="module">
  import answers from "$lib/answers.json";
  import { days } from "$lib/date";

  export const prerender = false;

  /** @type {import("@sveltejs/kit").Load} */
  export const load = async () => {
    const game =
      days < 1 ? 0 : days >= answers.length ? answers.length - 1 : ~~days;
    const displayed = game + 1;

    return {
      status: 307,
      redirect: `/${displayed}`,
    };
  };
</script>
