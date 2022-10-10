import axios from "axios";
import { parse } from 'node-html-parser';
import fs from "fs";
import TelegramBot from "node-telegram-bot-api/lib/telegram";

const token = "5577024603:AAGyaYt0WYvoUCP2qg90w9Zx273Ep-z050M";
const bot = new TelegramBot(token, { polling: true });

const instance = axios.create({
    baseURL: 'https://www.pararius.com/',
    timeout: 10000,
    headers: { 'x-requested-with': 'XMLHttpRequest' }
});

const resultFilePath = `${process.env.PWD}/results/pararius.json`;

export default {
    async checkNewAdvertisements(cityName, chatId) {
        try {
            const response = await instance.post(`apartments/${cityName}`);
            const html = response.data.components.results;
            const root = parse(html);
            const listingsAsHtml = root.querySelectorAll(".search-list__item--listing");
            const currentListings = listingsAsHtml.map(x => {
                const titleDom = x.querySelector(".listing-search-item__title");
                const title = titleDom.childNodes[1].text.trim();
                const url = "https://www.pararius.com" + titleDom.childNodes[1].attributes["href"];
                const location = x.querySelector(".listing-search-item__sub-title").childNodes[0].text.trim();
                const price = parseInt(x.querySelector(".listing-search-item__price").innerText.match('€(.*?) per month')[1].replace(",", ""));
                return {
                    title,
                    url,
                    location,
                    price
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
                bot.sendMessage(chatId, createMessage(news));
            } else {
                console.log("no new listing.");
            }
    
            fs.writeFileSync(resultFilePath, JSON.stringify(currentListings));   
        } catch (error) {
            console.error(error)
        }
    }
}

function createMessage(listings) {
    var message = "";
    listings.forEach(x => {
        message += `Title: ${x.title}, price: ${x.price}, location: ${x.location}, link: ${x.url}\r\n`;
    });
    return message;
}