let cheerio = require('cheerio');
let request = require('request');

let url = 'http://www.cwb.gov.tw/V7/forecast/taiwan/Taipei_City.htm';

function getWeather(callback){

    request(url, function(err, res, body){
        //console.log(body);
        let $ = cheerio.load(body);
        let weather = [];
    
        // console.log($('#box8 > table.FcstBoxTable01:nth-of-type(1) > tbody > tr').text());
        $('#box8 > table.FcstBoxTable01:nth-of-type(1) > tbody > tr').each(function(){
            weather.push($(this).text().split('\n'));
        });

        weather = weather.map(function(elem){
            return {
                time: elem[1].trim().split(' ')[0],
                temp: elem[2].trim(),
                rain: elem[6].trim(),
            }
        });

        let message = weather.map(function(elem){
            return elem.time + '：溫度 ' + elem.temp + '，降雨機率 ' + elem.rain;
        }).join('\n');

        // console.log(weather)
        // console.log(message)

        callback(err, message);
    });
}

module.exports = getWeather;