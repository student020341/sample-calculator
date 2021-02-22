<script>
  export let samples;
  export let calculations;
  export let excludeId;
  export let symbol;

  import Picker from "@components/ObjectPicker.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // pick another calculation to reference a value from
  const otherCalc = calculations.filter((c) => c.id !== excludeId);
  const thisCalc = calculations.find((c) => c.id === excludeId);

  // non local calc groups / from db
  // todo: make this like samples - import into top level if needed!
  let externalCalcs = [];

  // do nothing / cancel
  const dismiss = () => dispatch("dismiss");

  // select local calc
  const selectLocal = (c) => {
    // a calculation entry only yields one value or set of values, so no additional
    // ui is needed. Whatever is returned by this other local calculation entry will be passed
    // as the argument to this calculation.
    if (confirm(`Select local calculation ${c.name} (${c.equation}) ?`)) {
      dispatch("select", {
        type: "local",
        id: c.id,
      });
    }
  };

  // todo: make this less ugly
  let selectedItem = null;
  const selectSampleCandidate = (s) => {
    selectedItem = {
      type: "sample",
      item: s,
    };
  };
  const selectCalcCandidate = (c) => {
    selectedItem = {
      type: "calculation",
      item: c,
    };
  };

  // select value from sample
  const selectFromSample = (ev) => {
    // present a ui that allows the user to select a specific value from the given sample
    if (confirm(`Select ${ev.detail.selectedPath.join("->")}(${ev.detail.selectedValue}) from ${selectedItem.type}?`)) {
      dispatch("select", {
        type: "sample",
        id: selectedItem.item._id,
        path: ev.detail.selectedPath
      });
    }
  };

  // select value from external calc
  const selectFromExternal = () => {
    // present a ui similar to sample picker, but to pick a calculation entry from the external sample
  };
</script>

<div>
  {#if selectedItem === null}
    <h4>Select an element to grab a value from</h4>
    <p>
      Selecting value for variable "{symbol}" from "{thisCalc.name}", equation {thisCalc.equation}
    </p>
    <button on:click={dismiss}>cancel</button>
    {#if samples.length > 0}
      <p>samples</p>
      <ul>
        {#each samples as sample}
          <li on:click={() => selectSampleCandidate(sample)}>
            {JSON.stringify(sample)}
          </li>
        {/each}
      </ul>
    {:else}
      <p>no samples added to calculation</p>
    {/if}
    {#if otherCalc.length > 0}
      <p>local calculations</p>
      <ul>
        {#each otherCalc as c}
          <li on:click={() => selectLocal(c)}>{c.name} : {c.equation}</li>
        {/each}
      </ul>
    {:else}
      <p>No other local calculations</p>
    {/if}
  {:else}
    <button on:click={() => selectedItem = null}>back</button>
    <p>select value from {selectedItem.type}</p>
      <Picker data={selectedItem.item} on:emit={selectFromSample} />
  {/if}
</div>
