const axios = require("axios");

const { QuickDB } = require("quick.db")
const db = new QuickDB();

const timestamp = Date.now();

async function getCryptoPrice(symbol, urlAPI, typeMarket) {
    const Symbol = symbol
  
    try {
      const response = await axios.get(urlAPI, {
        params: {
          symbol: Symbol,
        },
      });
  
      const price = parseFloat(response.data.price);
      const formattedPrice = price.toFixed(3);
  
      return formattedPrice
      
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération du prix:', error.message);
    }
}

function calculFundingRate(spot, perp, interestRate) {

    let premiumIndex = ((perp - spot) / spot) * 100;
  
    if((interestRate - premiumIndex) > 0.05) { premiumIndex += 0.05 }
    if((interestRate - premiumIndex) < -0.05) { premiumIndex += -0.05 }
    if((interestRate - premiumIndex) > -0.05 && (interestRate - premiumIndex) < 0.05) { premiumIndex += interestRate }
  
    return premiumIndex
}

let differencies_SPOT_FUTURE = async () => {
    
    let fundingRate1min = [];

    setInterval(async ()=> {
      const data1 = await getCryptoPrice("BTCUSDT", "https://fapi.binance.com/fapi/v1/ticker/price")
      const data2 = await getCryptoPrice("BTCUSDT", "https://api.binance.com/api/v3/ticker/price")
      let interestRate = 0.01
  
      let data1Number = parseFloat(data1)
      let data2Number = parseFloat(data2)
  
      let fundingRate = calculFundingRate(data2Number, data1Number, interestRate)

      console.log(fundingRate)
  
      let dif = data2Number - data1Number;
      let fundingRateNumber = parseFloat(fundingRate.toFixed(4))

      fundingRate1min.push(fundingRateNumber)   

    }, 60000)

    console.log(fundingRate1min)
    setInterval(()=>{console.log(fundingRate1min)}, 60000)

    setInterval(async () => {

      console.log("pushing data FundingRate in db")

      let average = 0
        
        for(let i = (fundingRate1min.length) - 60; i < fundingRate1min.length; i++) {

          if(isNaN(fundingRate1min[i])) {
            average += fundingRate1min[i - 1]
          } else {
            average += fundingRate1min[i]
          }

          console.log("ffff", fundingRate1min[i], "length", fundingRate1min.length)
        }

        average /= 60 

      await db.push("FundingRate1hour", {fundingAverage: average.toFixed(3), timestamp: timestamp})
      console.log(`       print DB : ${average}`)

    }, 3606000)
}

module.exports = { differencies_SPOT_FUTURE }

/*db.delete("dataAPIdiff")*/


/* https://api.binance.com/api/v3/ticker/price */  //api spot binance
/* https://fapi.binance.com/fapi/v1/ticker/price */  //api future perp binance

/*ecriture marrante je pose  ca la bande de pd : 
    formattedPrice = price % 1 === 0 ? price.toFixed(0) : price.toFixed(3);
*/ 
