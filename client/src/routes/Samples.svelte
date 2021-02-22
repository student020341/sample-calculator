<script>
  import { onMount } from "svelte";
  import {Link} from "svelte-routing";
  import SamplesApi from "@controllers/Samples";
  import {Samples} from "@stores/data";
  import List from "@components/WideGutterList.svelte";
  import Search from "@components/Search.svelte";

  onMount(() => {
    // fetch samples, set in store, will be rendered from store by SampleList component
    SamplesApi.fetchAndStoreModel();
  });

</script>

<div>
  <!-- controls -->
  <div class="controls">
    <div>
      <Link to="/samples/new">
        <button>Add New</button>
      </Link>
    </div>
    <div>
      <Search modelSearch={(...args) => SamplesApi.fetchAndStoreModel(...args)} />
    </div>
  </div>
  <!-- list -->
  <List store={Samples} viewItemBuilder={(id) => `/samples/${id}`} />
</div>
