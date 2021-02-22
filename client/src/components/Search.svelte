<script>
  export let modelSearch;

  import { createEventDispatcher } from "svelte";

  let search = "";
  let searching = false;
  const dispatch = createEventDispatcher();

  const trySearch = () => {
    if (searching) {
      return;
    }
    searching = true;

    let input = search;
    if (!input) {
      input = "{}";
    }

    let obj;
    try {
      obj = JSON.parse(input);
      // todo: will this component handle pagination? should pagination vars be provided?
      modelSearch(0, 10, obj)
        .then((response) => {
            // let consumer do something with data if it needs to
            dispatch("search", response);
        })
        .finally(() => {
            searching = false;
        });
    } catch (e) {
      searching = false;
    }
  };
</script>

<div class="search">
  <p>powerful but user unfriendly mongo search</p>
  <textarea bind:value={search} />
  <br />
  <button on:click={trySearch} disabled={searching}>search</button>
</div>

<style lang="scss">
  textarea {
    width: 100%;
    resize: vertical;
  }
</style>
