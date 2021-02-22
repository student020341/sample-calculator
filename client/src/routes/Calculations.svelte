<script>
    import {Calculations} from "@stores/data";
    import {onMount} from "svelte";
    import {Link} from "svelte-routing";
    import CalcApi from "@controllers/Calcualtions";
    import List from "@components/WideGutterList.svelte";
    import Search from "@components/Search.svelte";

    onMount(() => {
        CalcApi.fetchAndStoreModel();
    });
</script>

<div>
    <!-- controls -->
    <div class="controls">
        <div>
            <Link to="/calculations/new">
                <button>Add New</button>
            </Link>
        </div>
        <div>
            <Search modelSearch={(...args) => CalcApi.fetchAndStoreModel(...args)} />
        </div>
    </div>
    <!-- list -->
    <List store={Calculations} viewItemBuilder={(id) => `/calculations/${id}`} />
</div>
