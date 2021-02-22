<script>
import { createVerify } from "crypto";

  export let sample;
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher();
  const emitDelete = () => dispatch("delete", {});
  let expanded = false;
</script>

<div class="container">
  {#if expanded}
    {#each Object.entries(sample) as [key, value]}
      <p>{key}:{value}</p>
    {/each}
    <button on:click={() => (expanded = false)}>minimize</button>
    <button on:click={emitDelete}>remove</button>
  {:else}
    <p on:click={() => (expanded = true)}>{sample._id}</p>
  {/if}
</div>

<style>
  .container {
    border: 1px solid black;
  }
</style>
