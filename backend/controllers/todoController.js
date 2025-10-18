import asyncHandler from "express-async-handler";
import TodoItem from "../models/TodoItem.js";

// @desc    Get user's todos
// @route   GET /api/todos
// @access  Private
export const getTodos = asyncHandler(async (req, res) => {
  const todos = await TodoItem.find({ user: req.user._id }).sort("-createdAt");
  res.json(todos);
});

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
export const createTodo = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  const todo = await TodoItem.create({
    user: req.user._id,
    title,
    description,
    dueDate,
    priority,
  });

  res.status(201).json(todo);
});

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await TodoItem.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  if (todo.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const updatedTodo = await TodoItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedTodo);
});

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await TodoItem.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  if (todo.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await todo.deleteOne();
  res.json({ message: "Todo deleted" });
});

// @desc    Toggle todo completion
// @route   PUT /api/todos/:id/toggle
// @access  Private
export const toggleTodo = asyncHandler(async (req, res) => {
  const todo = await TodoItem.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  if (todo.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  todo.completed = !todo.completed;
  await todo.save();

  res.json(todo);
});