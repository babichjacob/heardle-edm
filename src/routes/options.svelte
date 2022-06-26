<script>
  import MusicalScore from "~icons/twemoji/scroll";
  import Banner from "$lib/Banner.svelte";
  import options from "$lib/options.json";
  import { shuffle } from "$lib/utils";

  let shuffled = false;
  let songs = [...options];
</script>

<div class="flex flex-col items-center w-full">
  <div class="w-full sm:w-3/4 flex flex-col px-8 py-12 sm:py-8 gap-y-8">
    <Banner style="info" icon={MusicalScore}>
      Here are all the songs you can guess in Heardle EDM! You can use your
      browser's search to find something specific.<br />
      If you're at a loss for ideas of what to guess, try shuffling the list.
    </Banner>

    <div class="w-full flex gap-x-4">
      <div class="w-1/2 flex justify-end">
        <button
          class="bg-accent hover:bg-accent-lighter focus:outline-none focus:ring focus:ring-on-primary-faint active:bg-accent-darker px-4 py-2 font-bold text-on-accent"
          on:click={() => {
            shuffle(songs);
            songs = songs;
            shuffled = true;
          }}>Shuffle</button
        >
      </div>
      <div class="w-1/2 flex justify-start">
        {#if shuffled}
          <button
            class="bg-primary-faint hover:bg-primary-faint-lighter focus:outline-none focus:ring focus:ring-accent active:bg-primary-faint-darker px-4 py-2 font-bold"
            on:click={() => {
              songs = [...options];
              shuffled = false;
            }}>Unshuffle</button
          >
        {/if}
      </div>
    </div>
    <table
      class="w-full table-fixed border-separate [border-spacing:0_1rem] -mt-[1rem]"
    >
      <thead>
        <tr class="bg-on-primary-weak text-primary">
          <th class="font-bold py-2 px-4 text-right">Artists</th>
          <th class="font-bold py-2 px-4 text-left">Title</th>
        </tr>
      </thead>
      <tbody>
        {#each songs as song}
          {@const [artists, title] = song.split(" - ")}
          <tr class="bg-primary-weak">
            <td class="w-1/2 py-2 px-4 text-right">{artists}</td>
            <td
              class="w-1/2 py-2 px-4 text-left font-medium text-on-primary-weak"
              >{title}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
