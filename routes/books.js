const express = require("express");
const ExpressError = require("../expressError");
const jsonschema = require("jsonschema");
const newBookSchema = require("../schemas/book/newBookValidation.json");
const editBookSchema = {...newBookSchema, "required": []};
const Book = require("../models/book");

const router = new express.Router();

const validateInput = (data, schema) =>{
  const verify = jsonschema.validate(data, schema);
  if (!verify.valid) {
    const errors = verify.errors.map(e => e.stack);
    throw new ExpressError(errors, 400);
  }
  else {
    return true;
  }
};

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const bookData = req.body;
    validateInput(bookData, newBookSchema);

    const book = await Book.create(bookData);
    return res.status(201).json({ book });
    
  } catch (err) {
    if(err.code === "23505"){
      err = new ExpressError("BOOK ALREADY EXISTS!", 400);
    }
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const bookData = req.body;
    validateInput(bookData, editBookSchema);

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });

  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
