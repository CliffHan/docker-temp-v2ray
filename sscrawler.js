'use strict'

const puppeteer = require("puppeteer");
const fs = require('fs');
const tabletojson = require('tabletojson');
const request = require('request');
const MAX_FREE_SS_SITE_WAIT = 10;
const REQUEST_TIMEOUT = 10;

function sync_request(opts) {
    return new Promise((resolve, reject) => {
        request(opts, function (err, res, body) {
            if (err) {
                console.error(err)
                throw reject(err);
            }
            var statusCode = res.statusCode;
            if (statusCode !== 200) {
                console.log('status code: ' + statusCode)
                throw reject(err);
            }
            resolve(body);
        });
    });
}

function encode_ss_addr(method, password, hostname, port, tag) {
    //  ss://method:password@hostname:port#tag
    // console.log(`${method}:${password}@${hostname}:${port}#${tag}`);
    return "ss://" + Buffer.from(`${method}:${password}@${hostname}:${port}`).toString('base64') + "#" +tag;
}

/*
    ps: name of configuration
    add: address of server
    port: port of server
    id: id of vmess service
    aid: alter id, usually be "0"
    net: usually be "ws"
    type: usually be "none"
    host: usually be "/" or "/ws"
    tls: usually be "none" or "tls"

    here's 2 examples:
        {"ps":"[free-ss.site]www.eieee.cf","add":"www.eieee.cf","port":"80","id":"dda8e363-879c-4a7c-f9eb-df1734fa9945","aid":"0","net":"ws","type":"none","host":"/","tls":"none"}
        {"ps":"[free-ss.site]www.kernels.bid","add":"www.kernels.bid","port":"443","id":"ddae34cd-f38c-e701-020a-7fedf96e9f14","aid":"0","net":"ws","type":"none","host":"/ws","tls":"tls"}
    usage example:
        encode_vmess_addr("[free-ss.site]www.kernels.bid", "www.kernels.bid", "443", "ddae34cd-f38c-e701-020a-7fedf96e9f14", "0", "ws", "none", "/ws", "tls");
*/
function encode_vmess_addr(ps, add, port, id, aid, net, type, host, tls) {
    let vmess_obj = {
        "ps": ps,
        "add": add,
        "port": port,
        "id": id,
        "aid": aid,
        "net": net,
        "type": type,
        "host": host,
        "tls": tls,
    };
    return "vmess://" + Buffer.from(JSON.stringify(vmess_obj)).toString('base64');
}

async function crawl_free_ss_site() {
    // console.log("Starting Browser");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //await page.setViewport({width: 1366, height: 768});
    await page.setRequestInterception(true);
    await page.on('request', interceptedRequest => {
        let url = interceptedRequest.url();
        if ((url.indexOf('.png') > -1 || url.indexOf('.jpg') > -1) && (url.indexOf('aff/') > -1))
            interceptedRequest.abort();
        else
            interceptedRequest.continue();
    });
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(window, 'webdriver', { get: () => undefined });
        Object.defineProperty(window, 'top', { get: () => window.self });
    });
    await page.goto("https://free-ss.site", {waitUntil: 'networkidle2'});

    // await page.waitFor(3000);
    // await page.screenshot({ path: "free-ss.png"});
    // const html = await page.content();
    // const table_json = tabletojson.convert(html);
    // await browser.close();
    // return table_json;

    // console.log("Loading free-ss.site for 30s");
    let wait_times = 0;
    while (true) {
        const html = await page.content();
        const table_json = tabletojson.convert(html);
        // console.log(`-------------table_json.length=${table_json.length}---------------------`);
        // console.log(table_json);
        if ((table_json.length < 2) || (table_json[1].length <= 1)) {
            wait_times += 1;
            // console.log(`wait_times=${wait_times}`);
            if (wait_times >= MAX_FREE_SS_SITE_WAIT) {
                await browser.close();
                return table_json;
            }
            await page.waitFor(1000);
            continue;            
        }
        await browser.close();
        return table_json;
    }
}

function encode_free_ss_site_vmess(data) {
    // console.log(data);
    let text = "";
    data.forEach((item, index, array) => {
        // console.log(item);
        let ps = `${item.Address}:${item.Port}`;
        text += encode_vmess_addr(ps, item.Address, item.Port, item.UID, "0", item.Network, "none", item.Path, item.TLS) + "\n";
    });
    // console.log(text);
    return text;
}

function encode_free_ss_site_ss(data) {
    // console.log(data);
    if (data.length <= 1) {
        return "";
    }
    let text = "";
    data.forEach((item, index, array) => {
        // console.log(item);
        let vtum = item['V/T/U/M'].replace(/↑/g, '').replace(/↓/g, '').replace(/\//g, '_');
        let tag = `${item['6']}_${vtum}@${item['5']}`;
        text += encode_ss_addr(item['Method'], item['Password'], item['Address'], item['Port'], tag) + "\n";
    });
    // console.log(text);
    return text;
}

async function crawl_youneed_win() {
    var url = 'https://www.youneed.win/free-ss' // input your url here    
    var timeoutInMilliseconds = REQUEST_TIMEOUT*1000;
    var opts = {
      url: url,
      timeout: timeoutInMilliseconds
    }
    let body = await sync_request(opts);
    // console.log(body);
    const table_json = tabletojson.convert(body);
    return table_json;
}

function encode_youneed_win_sub(data) {
    // console.log(data);
    let text = "";
    data.forEach((item, index, array) => {
        // console.log(item);
        let tag = `${item['国家']}@${item['更新时间']}`;
        text += encode_ss_addr(item['加密方式'], item['密码'], item['账号'], item['端口'], tag) + "\n";
    });
    // console.log(text);
    return text;
}

async function main() {
    const free_ss_json = await crawl_free_ss_site();
    let freess_vmess_addrs = encode_free_ss_site_vmess(free_ss_json[0]);
    let freess_ss_addrs = encode_free_ss_site_ss(free_ss_json[1]);
    console.log(`free-ss.site vmess addresses:\n${freess_vmess_addrs}`);
    console.log(`free-ss.site ss addresses:\n${freess_ss_addrs}`);

    const youneed_win_json = await crawl_youneed_win();
    let youneed_win_ss_addrs = encode_youneed_win_sub(youneed_win_json[0]);
    console.log(`youneed.win ss addresses:\n${youneed_win_ss_addrs}`);

    // We could enerate subscription file here with base64 convert
    // let encoded_youneed_win_addrs = Buffer.from(youneed_win_ss_addrs).toString('base64');
    console.log('execution complete');
}
  
try {
    main();
} 
catch(err){
    console.error(err);
}  
  
