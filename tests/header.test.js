const Page = require("./helpers/page");
let page
// test("test1 ", () => {
//     let sum = 2 + 1;

//     expect(sum).toEqual(3);
// })
describe('Header tests', () => {
    beforeEach(async () => {
        page = await Page.build();
        await page.goto('http://localhost:3000/')
    });
    afterEach(async () => {
        await page.close();
    })
    test("launch a browser check header text", async () => {
        // getting the header text from page
        //const text = await page.$eval('a.brand-logo', el => el.innerHTML);
        const text = await page.getContentsOf('a.brand-logo');
        console.log(text);
        expect(text).toEqual('Blogster');
    })

    test("clicking login starts outh flow", async () => {
        // clik login button 
        await page.click('.right a');
        const url = await page.url();
        console.log(url);
        expect(url).toMatch('/accounts\.google\.com/');
    })
    //run only this test
    //test.only("Set user login and show logout button", async () => {
    test("Set user login and show logout button", async () => {

        await page.login();
        // getting logout btn once login
        const btnText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
        console.log(btnText);
        expect(btnText).toEqual("Logout");
    })

})