/**
 * Samples are json data describing anything that can be described
 */

import express from "express";
import {dbi} from "../config.js";
import {querystuff, validations} from "../util/mongo.js";

const router = express.Router();
const collname = "samples";

// list samples
router.get("/", async (req, res, next) => {
  const query = querystuff(req.query);

  const records = await dbi.findInCollection(collname, query, {});
  res.json(records);
});

// list samples, but with a body for a filter
router.report("/", async (req, res, next) => {
  const query = querystuff(req.query);
  const filter = req.body;
  const records = await dbi.findInCollection(collname, query, filter);
  res.json(records);
});

// post new sample
router.post("/", async (req, res, next) => {
  const sample = req.body;
  if (validations.empty(sample)) {
    return res.status(400).send("cannot post empty sample");
  }

  const id = await dbi.postToCollection(collname, sample);
  res.status(id ? 200 : 500).send(id);
});

// get specific sample
router.get("/:id", async (req, res, next) => {
  const document = await dbi.findOneInCollection(collname, req.params.id);
  res.status(document ? 200 : 500).json(document);
});

// delete sample
router.delete("/:id", async (req, res, next) => {
  const ok = await dbi.deleteFromCollection(collname, req.params.id);
  return res.status(ok ? 200 : 500).send();
});

// update sample
router.put("/:id", async (req, res, next) => {
  if (validations.empty(req.body)) {
    return res.status(400).send("cannot post empty sample");
  }
  const ok = await dbi.updateInCollection(collname, req.params.id, req.body);
  return res.status(ok ? 200 : 500).send();
});

export default router;
