<script>
    // component that renders samples currently in the store as tiles
    // todo: render full width set of scrollable tiles, gutter on side to allow scrolling
    import {Samples} from "@stores/";
    import {navigate} from "svelte-routing";

    const goToSample = id => navigate(`/samples/${id}`);
</script>

<div class="tiles">
    {#each $Samples as sample (sample._id)}
        <div class="tile" on:click={() => goToSample(sample._id)}>
            {#each Object.entries(sample) as [key, value] (key)}
                {#if key !== "_id"}
                    <span>{key}, {value}</span>
                {/if}
            {/each}
        </div>
    {:else}
    <p>No samples to display</p>
    {/each}
</div>

<style lang="scss">
    .tiles {
        border: 1px solid black;
    }

    .tile {
        border: 1px solid black;
        display: inline-block;
        margin: 8px;
        width: 90px;
        height: 90px;
        overflow: hidden;
        cursor: pointer;

        span {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
</style>