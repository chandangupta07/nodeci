let puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require("../factories/userFactory");

class CustomPage {
    static async build() {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        // Logging in user
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);
        this.page.setCookie({ name: 'session', value: session });
        this.page.setCookie({ name: 'session.sig', value: sig });
        // loading page to again to setting up cookie
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(res => res.json())
        }, path);
    }

    post(path, data) {
        return this.page.evaluate((_path, _data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(_data)
            }).then(res => res.json())
        }, path, data);
    }
}

module.exports = CustomPage;