import pararius from "./vendors/pararius";

const delay = 1000 * 60 * 10;

const runner = async function () {
    await pararius.logPage1();
    setTimeout(() => runner(), delay);
}

runner();
