/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
  interface Locals {
    userid: string;
  }

  interface Platform {}

  interface Session {}

  interface Stuff {
    game: number;
      title: string;
  }
}
