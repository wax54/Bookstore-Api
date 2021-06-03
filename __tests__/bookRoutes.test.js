process.env.NODE_ENV = 'test';

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");


describe("Book Routes Tests", function () {
    let b1;
    beforeEach(async function () {
        await db.query("DELETE FROM books");

        b1 = await Book.create({
            isbn: "069161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 4,
            publisher: "Bellhouse Publishing",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
    });

    /** GET / => {books: [book, ...]}  */

    describe("GET /books/", function () {
        test("gets all books in a list", async function () {
            let response = await request(app)
                .get("/books/")

            expect(response.body).toEqual({
                books:[{
                    isbn: "069161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 4,
                    publisher: "Bellhouse Publishing",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                    }
                ]
            });
        });
    });

    /** GET /[id]  => {book: book} */
    
    describe("GET /books/:id", function () {
        test("gets the specified book", async function () {
            let response = await request(app)
                .get(`/books/${b1.isbn}`);

            expect(response.body).toEqual({
                book:{
                    isbn: "069161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 4,
                    publisher: "Bellhouse Publishing",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }
            });
        });

        test("throws 404 if book doesn't exist", async function () {
            let response = await request(app)
                .get(`/books/0`);
            expect(response.statusCode).toEqual(404);
        });
    });

    /** POST /   bookData => {book: newBook}  */

    describe("POST /books/", function () {
        test("Creates a new book", async function () {
            let response = await request(app)
                .post(`/books/`)
                .send({     
                        isbn: "069161519",
                        amazon_url: "http://a.co/eobPtX1",
                        author: "Biggs Lewis",
                        language: "english",
                        pages: 102,
                        publisher: "Bellhouse Publishing",
                        title: "Super Up Your Game",
                        year: 2017  
                        });

            expect(response.body).toEqual({
                book: {
                    isbn: "069161519",
                    amazon_url: "http://a.co/eobPtX1",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: 102,
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: 2017
                }
            });
            expect(await Book.findOne(response.body.book.isbn)).toEqual({
                isbn: "069161519",
                amazon_url: "http://a.co/eobPtX1",
                author: "Biggs Lewis",
                language: "english",
                pages: 102,
                publisher: "Bellhouse Publishing",
                title: "Super Up Your Game",
                year: 2017
            })
        });

        test("throws 400 if book already exists", async function () {
            let response = await request(app)
                .post(`/books/`)
                .send(b1);
            expect(response.statusCode).toBe(400);
        });
        test("throws 400 if any data invalid", async function () {
            //the year has to be a number
            let response = await request(app)
                .post(`/books/`)
                .send({
                    isbn: "069161519",
                    amazon_url: "http://a.co/eobPtX1",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: 102,
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: "garbage"  
                    });
            expect(response.statusCode).toEqual(400);

            //there has to be data
            response = await request(app)
                .post(`/books/`)
                .send({});
            expect(response.statusCode).toEqual(400);

            //pages has to be a number
            response = await request(app)
                .post(`/books/`)
                .send({
                    isbn: "069161519",
                    amazon_url: "http://a.co/eobPtX1",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: "102",
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: 2017
                });
            expect(response.statusCode).toEqual(400);

            //amazon_url has to be a url
            response = await request(app)
                .post(`/books/`)
                .send({
                    isbn: "069161519",
                    amazon_url: "hello",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: 102,
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: 2017
                });
            expect(response.statusCode).toEqual(400);


        });
    });

    /** PUT /[isbn]   bookData => {book: updatedBook}  */

    describe("PUT /books/:isbn", function () {
        test("Updates a book", async function () {
            let response = await request(app)
                .put(`/books/${b1.isbn}`)
                .send({
                    pages: 500
                });

            expect(response.body).toEqual({
                book: {...b1, pages: 500}
            });
            expect(await Book.findOne(b1.isbn)).toEqual(
                { ...b1, pages: 500 }
            );
        });

        test("empty input ok, no data changed", async function () {
            //there has to be data
            response = await request(app)
                .put(`/books/${b1.isbn}`)
                .send({});
            expect(response.statusCode).toEqual(200);

            expect(response.body).toEqual({
                    book: b1
                });
            expect(await Book.findOne(b1.isbn)).toEqual(b1);
        });

        test("throws 400 if any data invalid", async function () {
            //the year has to be a number
            let response = await request(app)
                .put(`/books/${b1.isbn}`)
                .send({
                    isbn: "069161519",
                    amazon_url: "http://a.co/eobPtX1",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: 102,
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: "garbage"
                });
            expect(response.statusCode).toEqual(400);

 
            //pages has to be a number
            response = await request(app)
                .put(`/books/${b1.isbn}`)
                .send({
                    isbn: "069161519",
                    amazon_url: "http://a.co/eobPtX1",
                    author: "Biggs Lewis",
                    language: "english",
                    pages: "102",
                    publisher: "Bellhouse Publishing",
                    title: "Super Up Your Game",
                    year: 2017
                });
            expect(response.statusCode).toEqual(400);
        });
    });


    /** DELETE /[isbn]   => {message: "Book deleted"} */

    describe("DELETE /books/:isbn", function () {
        test("DELETES A BOOK", async function () {
            let response = await request(app)
                .delete(`/books/${b1.isbn}`);

            expect(response.body).toEqual({ message: "Book deleted" });
            
            response = await request(app)
                .get(`/books/${b1.isbn}`);

            expect(response.statusCode).toBe(404);
        });

        test("returns 404 if trying to delete a book that doesn't exist", async function () {
            let response = await request(app)
                .delete(`/books/${b1.isbn}`);
            response = await request(app)
                .delete(`/books/${b1.isbn}`);

            expect(response.statusCode).toBe(404);

        });
    });

});

afterAll(async function () {
    await db.end();
});
