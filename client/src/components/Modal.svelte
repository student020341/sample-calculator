
<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();
    const backgroundClick = () => dispatch("backgroundClick");
</script>

<div class="backdrop" on:click={backgroundClick}>
    <div on:click|stopPropagation={() => {}} class="content">
        <slot></slot>
    </div>
</div>

<style>
    .backdrop {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 10;
    }

    .content {
        padding: 8px;
        background: white;
    }
</style>
