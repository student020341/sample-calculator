<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import Samples from "@routes/Samples.svelte";
  import Calculations from "@routes/Calculations.svelte";
  import SampleEdit from "@routes/EditSample.svelte";
  import CalcEdit from "@routes/EditCalculations.svelte";

  export let url = "";
</script>

<Router {url}>
  <nav>
    <Link to="/">Home</Link>
    <Link to="samples">Samples</Link>
    <Link to="calculations">Calculations</Link>
  </nav>
  <main>
    <Route path="/">
      <p>dashboard?</p>
    </Route>
    <!-- samples -->
    <Route path="samples"><Samples /></Route>
    <Route path="samples/:id" let:params><SampleEdit id={params.id} /></Route>
    <!-- calculations -->
    <Route path="calculations"><Calculations /></Route>
    <Route path="calculations/:id" let:params><CalcEdit id={params.id} /></Route
    >
    <!-- reports -->
    <!-- templates -->
  </main>
</Router>
