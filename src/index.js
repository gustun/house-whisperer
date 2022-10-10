import pararius from "./vendors/pararius";

const cityName = "utrecht";
const chatId = 5036014638;
const delay = 1000 * 60 * 10;

const runner = async function () {
    await pararius.checkNewAdvertisements(cityName, chatId);
    setTimeout(() => runner(), delay);
}

runner();
