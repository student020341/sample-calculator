<script>
  export let store;
  export let viewItemBuilder;

  import {Link} from "svelte-routing";
</script>

<div class="tiles">
  {#each $store as item (item._id)}
    <div class="tile">
        <div class="controls">
            <Link to={viewItemBuilder(item._id)}>View</Link>
        </div>
      <ul>
        {#each Object.entries(item) as [key, value] (key)}
          <li>{key}, {value}</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p>No items to display</p>
  {/each}
</div>

<style lang="scss">
  .tiles {
    width: calc(100% - 100px);
    padding-left: 100px;
  }

  .tile {
    width: 100%;
    overflow: auto;
    margin-bottom: 12px;
    outline: 1px solid black;
  }
</style>
