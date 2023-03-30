const Page = require("./helpers/page");
let page
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/')
});
afterEach(async () => {
    await page.close();
})
describe('Blog tests when logged in ', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });
    test("go to blog create form page", async () => {
        const label = await page.getContentsOf("form label");
        console.log(label);
        expect(label).toEqual("Blog Title");
    })
    describe('and form having valid input ', () => {
        beforeEach(async () => {
            await page.type(".title input", "my test title");
            await page.type(".content input", "my test content");
            await page.click("form button");
        });
        test("submmiting and going to review page", async () => {
            const text = await page.getContentsOf("h5");
            console.log(text);
            expect(text).toEqual("Please confirm your entries");
        })
        test("submmiting and going to index page and adding blog", async () => {
            await page.click("button.green");
            await page.waitFor(".card");
            const title = await page.getContentsOf(".card-title");
            const content = await page.getContentsOf("p");
            console.log({ title, content });
            expect(title).toEqual("my test title");
            expect(content).toEqual("my test content");
        })
    })
    describe('and form having invalid input ', () => {
        beforeEach(async () => {
            await page.click("form button");
        });
        test("form should show a error message", async () => {
            const titleError = await page.getContentsOf(".title .red-text");
            const contentError = await page.getContentsOf(".content .red-text");
            console.log({ titleError, contentError });
            expect(titleError).toEqual("You must provide a value");
            expect(contentError).toEqual("You must provide a value");
        })
    });
})

describe('Blog tests when not logged in ', async () => {
    test("user can not create blog post", async () => {
        const result = await page.post('http://localhost:3000/api/blogs', { title: "some title", content: "some content" });
        // page.evaluate(
        //     () => {
        //         return fetch('http://localhost:3000/api/blogs', {
        //             method: 'POST',
        //             credentials: 'same-origin',
        //             headers: {
        //                 'Content-type': 'application/json'
        //             },
        //             body: JSON.stringify({ title: "some title", content: "some content" })
        //         }).then(res => res.json())
        //     }
        // );
        console.log(result);
        expect(result).toEqual({ error: 'You must log in!' })
    })
    test("user can not see blogs list", async () => {
        const result = await page.get('http://localhost:3000/api/blogs');
        // await page.evaluate(
        //     () => {
        //         return fetch('http://localhost:3000/api/blogs', {
        //             method: 'GET',
        //             credentials: 'same-origin',
        //             headers: {
        //                 'Content-type': 'application/json'
        //             }
        //         }).then(res => res.json())
        //     }
        // );
        console.log(result);
        expect(result).toEqual({ error: 'You must log in!' })
    })
})