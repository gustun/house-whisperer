import axios from "axios";
import { parse } from 'node-html-parser';
import fs from "fs";
import TelegramBot from "node-telegram-bot-api/lib/telegram";

const token = "5577024603:AAGyaYt0WYvoUCP2qg90w9Zx273Ep-z050M";
const bot = new TelegramBot(token, { polling: true });
const chatId = 5036014638;

const instance = axios.create({
    baseURL: 'https://www.pararius.com/',
    timeout: 10000,
    headers: { 'x-requested-with': 'XMLHttpRequest' }
});

const resultFilePath = `${process.env.PWD}/results/pararius.json`;

export default {
    async logPage1() {
        try {
            const request = {
                "filters": {
                    "type": "for_rent",
                    "city": "eindhoven",
                    "lat": 51.450166028261,
                    "lon": 5.4585282933635
                },
                "view_options": {
                    "page": "2",
                    "view": "list"
                },
                "sorting_options": []
            };
    
            const response = await instance.post('apartments/eindhoven/page-1', request);
            const html = response.data.results;
            const root = parse(html);
            const listingsAsHtml = root.querySelectorAll(".search-list__item--listing");
            const currentListings = listingsAsHtml.map(x => {
                const titleDom = x.querySelector(".listing-search-item__title");
                const title = titleDom.childNodes[1].text;
                const url = "https://www.pararius.com" + titleDom.childNodes[1].attributes["href"];
                const locationInnerText = x.querySelector(".listing-search-item__location").innerText;
                const locationMatchs = locationInnerText.match('\n(.*?)\n');
                const location = locationMatchs.length == 2 ? locationMatchs[1].trim() : locationInnerText;
                return {
                    title,
                    url,
                    location,
                    price: parseInt(x.querySelector(".listing-search-item__price").innerText.match('€(.*?) per month')[1].replace(",", "")),
                }
            })
    
            const oldListings = JSON.parse(fs.readFileSync(resultFilePath));
    
            const news = [];
            currentListings.forEach(x => {
                if (oldListings.some(y => y.title == x.title) || x.price > 1600) {
                    return;
                }
                news.push(x);
            });
    
            console.log(new Date().toLocaleString() + " running for pararius...")
            if (news.length) {
                console.log("you should check the web site if you dont get message");
                console.log(news);
                bot.sendMessage(chatId, JSON.stringify(news));
            } else {
                console.log("no new listing.");
            }
    
            fs.writeFileSync(resultFilePath, JSON.stringify(currentListings));   
        } catch (error) {
            console.error(error)
        }
    }
}