/**
 * Templates are...
 *  a label (location/company header/body)
 *  a type (sample template, report template, calculation template, etc)
 *  arbitrary data that can be imported by the type
 * 
 *  examples:
 *  - a header for a report
 *  - a common extraction pattern for a report or calculation
 *  - a common set of fields for logging a partiulcar kind of sample
 * 
 *  intended usage is that a user will "import" a template and it will immediately transform or mutate their working document
 */

import express from "express";
import {dbi} from "../config.js";
import {querystuff, validations} from "../util/mongo.js";

const router = express.Router();
const collname = "templates";

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
// custom validation on template, needs to contain a name you can search for and a type of template
// where the type is sample, report, or calculation
router.post("/", async (req, res, next) => {
  const document = req.body;
  const types = ["sample", "report", "calculation"];
  if (!document.name || !document.type) {
    return res.status(400).send("template must include a name and type");
  } else if (!types.includes(document.type)) {
    return res.status(400).send("template type must be one of: " + types.join(", "));
  } else if (Object.keys(document).length < 3) {
    return res.status(400).send("cannot post empty template")
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
    return res.status(400).send("cannot post empty template");
  }
  const ok = await dbi.updateInCollection(collname, req.params.id, req.body);
  return res.status(ok ? 200 : 500).send();
});

export default router;
