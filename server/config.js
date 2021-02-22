// configure long lived or global things here

import {config} from "dotenv";
import Mongler from "./util/mongo.js";

// add .env to process.env
config();

// mongo stuff
const dbi = new Mongler(process.env.MONGO_URL, process.env.MONGO_SAMPLE_DATABASE);
dbi.init();

// clean up
const cleanup = () => {

  console.log("closing mongo connections");
  dbi.close();
};

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

export {
  dbi
};
