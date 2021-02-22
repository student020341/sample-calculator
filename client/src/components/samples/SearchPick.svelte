<script>
  /**
        a component for searching and picking samples
    */
  import Search from "@components/Search.svelte";
  import SamplesApi from "@controllers/Samples";
  import { onMount, createEventDispatcher } from "svelte";

  let samples = [];
  onMount(() => {
    SamplesApi.fetchModel().then((res) => {
      samples = res;
    });
  });

  const handleSearch = (event) => {
    samples = event.detail;
  };

  const dispatch = createEventDispatcher();
  let selected = [];
  const emitSelected = () => dispatch("pick", Array.from(selected));
  const addToSelected = (id) => {
      if (!selected.includes(id)) {
        selected = selected.concat(id);
      }
  };
  const removeFromSelected = (id) => {
      selected = selected.filter(value => value !== id);
  };
</script>

<div>
  <div class="controls">
      <div>
          <p>Samples Selected</p>
          {#each Array.from(selected) as sel (sel)}
            <p on:click={() => removeFromSelected(sel)}>{sel}</p>
          {/each}
      </div>
    <div>
      <Search modelSearch={(...args) => SamplesApi.fetchModel(...args)} on:search={handleSearch} />
    </div>
    <div>
        <button on:click={emitSelected}>Done</button>
    </div>
  </div>
  <div class="samples">
    {#each samples as sample (sample._id)}
      <p on:click={() => addToSelected(sample._id)}>{JSON.stringify(sample)}</p>
    {:else}
      <p>No samples</p>
    {/each}
  </div>
</div>
