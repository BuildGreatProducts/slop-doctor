import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("fail stuck examinations", { minutes: 5 }, internal.pipeline.store.failStuck, {});

export default crons;
