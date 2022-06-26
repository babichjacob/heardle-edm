<script>
  /** @type {"error" | "info" | "warning"} */
  export let style;

  /** @type {(import("svelte").SvelteComponent | any) | undefined} TODO: how do you use this type? */
  export let icon = undefined;
</script>

<div
  class="px-4 py-2 font-medium cursor-default"
  class:bg-error={style === "error"}
  class:text-on-error={style === "error"}
  class:bg-accent={style === "info"}
  class:text-on-accent={style === "info"}
  class:bg-warning={style === "warning"}
  class:text-on-warning={style === "warning"}
>
  <svelte:component this={icon} class="inline align-sub" />
  <slot />
</div>
