<script>
  import JSONEditor from "jsoneditor/dist/jsoneditor.js";
  import "jsoneditor/dist/jsoneditor.min.css";
  import { onMount, createEventDispatcher } from "svelte";

  export let data;
  const id = data._id ? data._id : data.id ? data.id : "obj";

  const dispatch = createEventDispatcher();
  const emit = () => dispatch("emit", {selectedValue, selectedPath});

  let editorNode, editor, selectedValue;
  let selectedPath = [];
  const options = {
    mode: "view",
    onEvent: (n, e) => {
      if (e.type === "click") {
        selectedPath = n.path;
        selectedValue = n.value;
      }
    },
  };
  onMount(() => {
    editor = new JSONEditor(editorNode, options);
    editor.set(data);
  });
</script>

<div class="container">
  <div bind:this={editorNode} />
  <p>
    <span>selected value: {id}</span>
    {#if selectedPath.length > 0}
      <span>->{selectedPath.join("->")}({selectedValue})</span>
    {/if}
  </p>
  <button disabled={selectedPath.length === 0} on:click={emit}>Submit</button>
</div>
