<script>
  export let calc;
  export let samples;
  export let calculations;

  import { createEventDispatcher } from "svelte";
  import Modal from "@components/Modal.svelte";
  import RefPicker from "@components/calculations/RefPicker.svelte";

  const dispatch = createEventDispatcher();
  const emitDelete = () => dispatch("delete", {});

  // e
  let eqVars = {};
  let testEval = "";
  let testResult = 0;
  // when first loading, set to edit if there is no name
  let compactView = !!calc.name;
  let showRefModal = false;

  // todo: refactor this
  let selectedVar = "";
  const selectVarAndShowModal = (varname) => {
    selectedVar = varname;
    showRefModal = true;
  };

  // r
  $: {
    calc;
    if (!calc.equation) {
      calc.equation = "";
    }

    if (!calc.name) {
      calc.name = "";
    }

    if (!calc.refs) {
      calc.refs = {};
    }

    parseVars();
    Object.keys(calc.refs).forEach(key => {
      const ref = calc.refs[key];
      if (ref.type === "literal") {
        eqVars[key] = isNaN(ref.value) ? ref.value : Number(ref.value);
      }
    });
  }

  const test = (otherId) => {
    const subject = otherId ? calculations.find(o => o.id === otherId) : calc;
    if (!subject.equation) {
      return;
    }
    console.log("calculations\n", calculations);
    console.log("refs\n", subject.refs);
    const values = [];
    Object.keys(subject.refs).forEach(key => {
      const r = subject.refs[key];
      console.log(r);
      switch(r.type) {
        // get value from text input
        case "literal": {
          const value = isNaN(r.value) ? r.value : Number(r.value);
          values.push(value);
          break;
        }
        // get value from referenced sample
        case "sample": {
          const sample = samples.find(s => s._id === r.id);
          const [valueAtPath, pathError] = getAtPath(sample, r.path);
          if (!pathError) {
            values.push(isNaN(valueAtPath) ? valueAtPath : Number(valueAtPath));
          }
          break;
        }
        // get sample from calculation entry in the same calc
        case "local": {
          const value = test(r.id);
          values.push(isNaN(value) ? value : Number(value));
        }

        default: break;
      }
    });
    console.log("values\n", values);
    testEval = `let fn = ${subject.equation}; fn(${values.join(",")});`;
    try {
      testResult = eval(testEval);
    } catch (e) {
      testResult = e.toString();
    }

    return testResult;
  };

  // returns [value, error]
  const getAtPath = (obj, path) => {
    let value = obj;
    while (path.length > 0) {
      const nextKey = path.shift();
      if (nextKey in value) {
        value = value[nextKey];
      } else {
        return [null, true];
      }
    }

    return [value, false];
  };

  const parseVars = () => {
    // empty test
    if (calc.equation.startsWith("()")) {
      eqVars = [];
      return;
    }

    const exp = /^\((.+?)\)/;
    if (!exp.test(calc.equation)) {
      // unable to parse vars, do nothing
      return;
    }

    const match = calc.equation.match(exp);
    if (match.length !== 2) {
      // ?
      return;
    }

    // reduce into current, carry old values if they exist
    eqVars = match[1]
      .replace(/\s/g, "")
      .split(",")
      .reduce((obj, next) => {
        // make sure variable is not empty and is not a number
        if (next && isNaN(next)) {
          obj[next] = eqVars[next] ? eqVars[next] : 0;
        }
        return obj;
      }, {});
  };

  const unsetRefVar = (key) => {
    calc.refs = Object.keys(calc.refs).reduce((obj, next) => key === next ? obj : {...obj, [next]: calc.refs[next]}, {});
  };

  const handleRefSelect = (event) => {
    console.log("handle ref select\n", event);
    switch (event.detail.type) {
      case "calculation":
      case "sample": {
        calc.refs = Object.assign({}, calc.refs, {
          [selectedVar]: {
            type: event.detail.type,
            id: event.detail.id,
            path: event.detail.path,
          },
        });
        break;
      }
      case "local":
      default: {
        calc.refs = Object.assign({}, calc.refs, {
          [selectedVar]: {
            type: "local",
            id: event.detail.id,
          },
        });
        break;
      }
    }
    
    showRefModal = false;
  };

  const updateLiteral = (event, key) => {
    calc.refs = Object.assign({}, calc.refs, {
      [key]: {
        type: "literal",
        value: event.target.value
      }
    });
  };
</script>

<div class="container">
  <p>id: {calc.id}</p>
  {#if showRefModal}
    <Modal on:backgroundClick={() => (showRefModal = false)}>
      <RefPicker
        on:dismiss={() => (showRefModal = false)}
        on:select={handleRefSelect}
        {samples}
        {calculations}
        excludeId={calc.id}
        symbol={selectedVar}
      />
    </Modal>
  {/if}
  {#if compactView}
    {calc.name} : {calc.equation}
  {:else}
    <div class="equation-name">
      <p>Equation Name</p>
      <input type="text" bind:value={calc.name} />
    </div>
    <div class="equation-formula">
      <p>Equation Formula</p>
      <textarea on:input bind:value={calc.equation} />
      <br />
      <ul>
        {#each Object.keys(eqVars) as key}
          <li>
            <span>{key}:</span>
            {#if key in calc.refs && calc.refs[key].type !== "literal"}
              <span>{calc.refs[key].type}</span>
              <span>[{calc.refs[key].id}]</span>
              {#if calc.refs[key].path}
                <span>->{calc.refs[key].path.join("->")}</span>
              {/if}
              <button on:click={() => unsetRefVar(key)}>unset</button>
            {:else}
              <input type="text" bind:value={eqVars[key]} on:change={(event) => updateLiteral(event, key)} />
              <button on:click={() => selectVarAndShowModal(key)}>ref</button>
            {/if}
          </li>
        {/each}
      </ul>
      <p>Eval: {testEval}</p>
      <p>Result: {testResult}</p>
    </div>
  {/if}
  <div class="controls">
    {#if compactView}
      <button on:click={() => (compactView = false)}>edit</button>
    {:else}
      <button on:click={() => (compactView = true)}>minimize</button>
      <button on:click={() => test()}>test</button>
      <button on:click={emitDelete}>delete</button>
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    outline: 1px solid black;
  }
</style>
