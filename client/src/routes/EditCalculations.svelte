<script>
  export let id;
  import CalcApi from "@controllers/Calcualtions";
  import { navigate } from "svelte-routing";
  import CalcEntry from "@components/calculations/CalcEntry.svelte";
  import SamplePicker from "@components/samples/SearchPick.svelte";
  import SamplesApi from "@controllers/Samples";
  import SampleEntry from "@components/samples/ListEntry.svelte";
  import { v4 as uuid } from "@lukeed/uuid";

  let newCalc, calc, loading, showSamplePicker;
  $: {
    // watch out for anything that causes a large number of updates here
    console.log("calc change");
    newCalc = id === "new";
    calc = newCalc ? { samples: [], calcs: [], name: "" } : null;
    loading = true;
    showSamplePicker = false;
    init();
  }

  let showSamples = false;
  let showCalcs = true;
  let hydratedSamples = [];

  const updateHydratedSamples = () => {
    // todo: only hydrate new entries?
    if (calc.samples.length > 0) {
      SamplesApi.fetchModel(0, 10, { _id: { $in: calc.samples } }).then(
        (res) => {
          hydratedSamples = res;
        }
      );
    }
  };

  const init = () => {
    if (!newCalc) {
      CalcApi.fetchModelById(id)
        .then((res) => {
          calc = res;
          console.log(calc);
          updateHydratedSamples();
        })
        .catch(() => {
          calc = null;
        })
        .finally(() => {
          loading = false;
        });
    }
  };

  // todo: move into model/base?
  const saveOrUpdate = () => {
    if (newCalc) {
      CalcApi.createModel(calc).then((id) => {
        if (id) {
          navigate(`/calculations/${id}`);
        } else {
          alert("error creating calculation");
        }
      });
    } else {
      CalcApi.updateModel(id, calc);
    }
  };

  const confirmAndDelete = () => {
    if (confirm("Delete this Calculation?")) {
      CalcApi.deleteModelById(id).then((ok) => {
        if (ok) {
          navigate("/calculations");
        } else {
          // todo: toast
          alert("Failed to delete calculation");
        }
      });
    }
  };

  const addCalc = () => {
    // add first so user doesn't have to scroll to find new calcs
    // give temporary ids for svelte tracking of the collection
    calc.calcs = [{ id: uuid() }].concat(calc.calcs);
  };

  const removeCalc = (id) => {
    calc.calcs = calc.calcs.reduce((arr, entry) => {
      if (entry.id !== id) {
        arr = arr.concat(entry);
      }
      return arr;
    }, []);
  };

  const removeSampleRef = (id) => {
    calc.samples = calc.samples.reduce(
      (arr, entry) => (id === entry ? arr : arr.concat(entry)),
      []
    );

    // remove from hydrated as well
    hydratedSamples = hydratedSamples.filter(hs => hs._id !== id);
  };

  const handlePickSample = async (event) => {
    if (event.detail?.length > 0) {
      const temp = new Set(calc.samples);
      event.detail.forEach((id) => temp.add(id));
      calc.samples = Array.from(temp);
      updateHydratedSamples();
    }
    showSamplePicker = false;
  };
</script>

<div>
  <!-- head -->
  {#if newCalc}
    <p>Create Calculation</p>
  {:else if loading}
    <p>Fetching Calculation {id}</p>
  {:else if calc != null}
    <p>Editing Calculation {id}</p>
    <div>
      <button on:click={() => confirmAndDelete()}>Delete</button>
    </div>
  {:else}
    <p>Failed to load Calculation</p>
  {/if}
  <!-- controls & editor -->
  {#if calc != null}
    <div>
      <button on:click={() => console.log(calc)}>debug</button>
      <button on:click={saveOrUpdate}>Save</button>
      <div>
        <span>Name</span>
        <input type="text" bind:value={calc.name} />
      </div>
      <div class="samples">
        <p on:click={() => (showSamples = !showSamples)}>
          Referenced Samples {showSamples ? "-" : "+"}
        </p>
        {#if showSamples}
          <button on:click={() => (showSamplePicker = !showSamplePicker)}
            >add sample</button
          >
          {#if showSamplePicker}
            <SamplePicker on:pick={handlePickSample} />
          {/if}
          <ul>
            {#each hydratedSamples as sample (sample._id)}
              <li>
                <SampleEntry
                  {sample}
                  on:delete={() => removeSampleRef(sample._id)}
                />
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <div class="calculations">
        <p on:click={() => (showCalcs = !showCalcs)}>
          Calculations {showCalcs ? "-" : "+"}
        </p>
        {#if showCalcs}
          <button on:click={addCalc}>add calculation</button>
          <ul>
            {#each calc.calcs as c (c.id)}
              <li>
                <CalcEntry
                  samples={hydratedSamples}
                  calc={c}
                  calculations={calc.calcs}
                  on:delete={() => removeCalc(c.id)}
                />
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
</div>
