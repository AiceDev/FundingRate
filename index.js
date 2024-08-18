const axios = require('axios');
const express = require("express")

const { differencies_SPOT_FUTURE } = require("./fundingRate")

const app = express()
const port = 2000

const { QuickDB } = require("quick.db")
const db = new QuickDB();

// app.set
app.set("views", `./HTML`)
app.set("view engine", `ejs`)

// loadfile / script
app.use("/css", express.static(__dirname + "/css/"))
app.use("/scriptHTML", express.static(__dirname + "/scriptHTML/"))
app.use("/index.js", express.static(__dirname + "/index.js"))
app.use("/img", express.static(__dirname + "/img/"))

let main = async () => {

  app.get("/dataFundingRate", async (req, res) => {

    const data1 = await db.get("FundingRate1hour")

    res.json({FundingRate1Hour: data1})

  })

  app.get("/home", (req, res) => {
    
    res.render("home.ejs", {})
  })
}

app.listen(port, async () => {
  console.log(`server online in : http://localhost:${port} `)

  /*await db.deleteAll()*/

  main();

  differencies_SPOT_FUTURE();
})
                                                    