
export default class ApiController {
    // todo: find out tyepscript typings are busted
    model;
    store;
    headers;
    api;

    constructor(model, store) {
        this.model = model;
        this.store = store;
        this.headers = {"Content-Type": "application/json"};
        this.api = process.env.API_URL;
    }

    async fetchModel(page=0, size=10, filter={}) {
        const search = new URLSearchParams();
        search.set("page", page.toString());
        search.set("pageSize", size.toString());
        const collection = await fetch(`${this.api}/api/${this.model}?${search.toString()}`, {
            headers: this.headers,
            method: "REPORT", 
            body: JSON.stringify(filter)
        })
            .then(res => res.json());
            
        return collection;
    }

    fetchModelById(id) {
        return fetch(`${this.api}/api/${this.model}/${id}`)
            .then(res => res.json());
    }

    async fetchAndStoreModel (page=0, size=10, filter={}) {
        const collection = await this.fetchModel(page, size, filter);
        this.store.set(collection);
    }

    deleteModelById(id) {
        return fetch(`${this.api}/api/${this.model}/${id}`, {method: "DELETE"}).then(res => res.status === 200);
    }

    updateModel(id, document) {
        return fetch(`${this.api}/api/${this.model}/${id}`, {
            headers: this.headers,
            method: "PUT", 
            body: JSON.stringify(document)
        }).then(res => res.status === 200);
    }

    createModel(document) {
        // server will delete _id from payload, no need to check here
        return fetch(`${this.api}/api/${this.model}`, {
            headers: this.headers, 
            method: "POST", 
            body: JSON.stringify(document)
        }).then(async (res) => {
            if (res.status === 200) {
                return await res.text();
            } else {
                return false;
            }
        }).catch(() => false);
    }
}
