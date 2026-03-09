import express from "express";

import {
  getOrderCountByStatus,
  getAverageTotalByStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/orders/stats/count", getOrderCountByStatus);

router.get("/orders/stats/avg-total", getAverageTotalByStatus);

export default router;
