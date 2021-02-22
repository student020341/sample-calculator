/**
 * reports are...
 *  references to calculations and samples
 *  snippets to extract and transform values from them
 *  instructions to map a sample into a row/section
 *  misc other info for building a csv (titles, breaks, sections, etc)
 */

import express from "express";
import {dbi} from "../config.js";
import {querystuff, validations} from "../util/mongo.js";

const router = express.Router();
const collname = "reports";

// list
router.get("/", async (req, res, next) => {
  const query = querystuff(req.query);

  const records = await dbi.findInCollection(collname, query, {});
  res.json(records);
});

// list, but with a body for a filter
router.report("/", async (req, res, next) => {
  const query = querystuff(req.query);
  const filter = req.body;
  const records = await dbi.findInCollection(collname, query, filter);
  res.json(records);
});

// post new
router.post("/", async (req, res, next) => {
  const document = req.body;
  if (validations.empty(document)) {
    return res.status(400).send("cannot post empty report");
  }

  const ok = await dbi.postToCollection(collname, document);
  res.status(ok ? 200 : 500).send();
});

// get specific
router.get("/:id", async (req, res, next) => {
  const document = await dbi.findOneInCollection(collname, req.params.id);
  res.status(document ? 200 : 500).json(document);
});

// delete
router.delete("/:id", async (req, res, next) => {
  const ok = await dbi.deleteFromCollection(collname, req.params.id);
  return res.status(ok ? 200 : 500).send();
});

// update
router.put("/:id", async (req, res, next) => {
  if (validations.empty(req.body)) {
    return res.status(400).send("cannot post empty report");
  }
  const ok = await dbi.updateInCollection(collname, req.params.id, req.body);
  return res.status(ok ? 200 : 500).send();
});

export default router;
