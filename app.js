const express = require("express");
const exphbs = require("express-handlebars");
const Restaurant = require("./models/restaurants");
const app = express();
const port = 3000;
const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", () => {
  console.log("mongoDB error");
});

db.once("open", () => {
  console.log("mongoDB connected");
});

//express template engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// 設定靜態檔案資料夾位置
app.use(express.static("public"));

// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(express.urlencoded({ extends: true }));

// 瀏覽全部餐廳
app.get("/", (req, res) => {
  Restaurant.find()
    .lean()
    .then((restaurantData) =>
      res.render("index", { restaurants: restaurantData })
    )
    .catch((error) => console.log(error));
});

// 瀏覽新餐廳
app.get("/restaurants/new", (req, res) => {
  return res.render("new");
});

// 增加新餐廳
app.post("/restaurants", (req, res) => {
  const name = req.body; // 從 req.body 拿出表單裡的資料
  return Restaurant.create(name)
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
});

// 瀏覽特定餐廳
app.get("/restaurants/:restaurant_id", (req, res) => {
  const id = req.params.restaurant_id;
  return Restaurant.findById(id)
    .lean()
    .then((item) => {
      res.render("show", { restaurant: item });
    })
    .catch((error) => {
      console.log(error);
    });
});

// 編輯餐廳頁面
app.get("/restaurant/:restaurant_id/edit"),
  (req, res) => {
    const id = req.params.restaurant_id;
    return Restaurant.findById(id)
      .lean()
      .then((item) => {
        res.render("edit", { restaurant: item });
      })
      .catch((error) => {
        console.log(error);
      });
  };

//更新餐廳
app.post("/restaurants/restaurant_:id/edit"),
  (req, res) => {
    const id = req.params.restaurant_id;
    const name = req.body.name;
    return Restaurant.findById(id)
      .then((item) => {
        item.name = name;
        return item.save();
      })
      .then(() => {
        res.redirect(`/restaurants/${id}`);
      })
      .catch((error) => console.log(error));
  };

// 搜尋餐廳
app.get("/search", (req, res) => {
  const keyword = req.query.keyword.trim().toLocaleLowerCase();
  const restaurantSearch = restaurantData.results.filter((item) => {
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword)
    );
  });
  res.render("index", { restaurants: restaurantSearch, keyword: keyword });
});

app.listen(port, () => {
  console.log(`This is listening on http://localhost:${port}`);
});
