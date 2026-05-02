import express from "express";
import { createTask, deleteTask, getUserTasks, updateTask, createBulkTasks } from "../controllers/taskController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createTask);
router.get("/all", userAuth, getUserTasks);
router.put("/update/:id", userAuth, updateTask);
router.delete("/delete/:id", userAuth, deleteTask);
router.post("/bulk-create", userAuth, createBulkTasks);

export default router;
