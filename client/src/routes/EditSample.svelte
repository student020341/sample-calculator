<script>
  export let id;
  import SamplesApi from "@controllers/Samples";
  import { navigate } from "svelte-routing";

  // reactive variables
  let newSample, sample, loading, asJson;
  $: {
    newSample = id === "new";
    sample = newSample ? {} : null;
    loading = true;
    asJson = "";
    init();
  }

  const init = () => {
    if (!newSample) {
      SamplesApi.fetchModelById(id)
        .then((res) => {
          sample = res;
          asJson = JSON.stringify(res);
        })
        .catch(() => {
          sample = null;
        })
        .finally(() => {
          loading = false;
        });
    } else {
      asJson = "{}";
    }
  };

  const confirmAndDelete = () => {
    if (confirm("Delete this sample?")) {
      SamplesApi.deleteModelById(id).then((ok) => {
        if (ok) {
          navigate("/samples");
        } else {
          // todo: toast
          alert("Failed to delete sample");
        }
      });
    }
  };

  const saveOrUpdateSample = () => {
    let obj;
    try {
      obj = JSON.parse(asJson);
    } catch (err) {
      obj = null;
    }

    if (!obj) {
      // todo: toast invalid json
      return;
    }

    if (newSample) {
      SamplesApi.createModel(obj).then((id) => {
        if (id) {
          navigate(`/samples/${id}`);
        } else {
          alert("error creating sample");
        }
      });
    } else {
      SamplesApi.updateModel(id, obj);
    }
  };
</script>

<div>
  <!-- header and controls -->
  {#if newSample}
    <p>create sample</p>
  {:else if loading}
    <p>Fetching sample {id}</p>
  {:else if sample != null}
    <p>Editing Sample {id}</p>
    <div>
      <button on:click={() => confirmAndDelete()}>Delete</button>
    </div>
  {:else}
    <p>failed to load sample</p>
  {/if}
  <!-- editor -->
  {#if sample != null}
    <textarea bind:value={asJson} />
    <br />
    <button on:click={() => saveOrUpdateSample()}>Save</button>
  {/if}
</div>
