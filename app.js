const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const _=require('lodash');
// const Item = require(__dirname + '/ItemSchema.js');
// const List = require(__dirname + '/ListSchema.js');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))


//Open the mongoose connection
mongoose.connect(process.env.MONGO_db);

//Schemas
const itemSchema = mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);

const ListSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", ListSchema);

//Making new items to insert into the databse

const course = new Item({
    name: "MERN stack"
});
const bookRead = new Item({
    name: "2 Books"
});
const phyActivity = new Item({
    name: "Swimming"
});

const defaultItems = [course, bookRead, phyActivity];

//making array of items to use it for rendering


app.get("/", function (req, res) {

    const toDoList = [];
    Item.find({})
        .then(function (items) {
            if (items.length === 0) {
                console.log("List is empty");
                Item.insertMany([course, bookRead, phyActivity])
                    .then(function () {
                        console.log("New Inserted successfully");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                res.redirect("/");
            }
            else {
                items.forEach(function (oneItem) {
                    toDoList.push(oneItem);
                    console.log("ONe inserted");
                })
                const day = date.getDate();
                console.log(toDoList);
                console.log(defaultItems);
                res.render("list",
                    {
                        colName: "Today",
                        taskList: toDoList
                    });
            }

        })


});

app.post("/", function (req, res) {
    const item = req.body.taskList;
    const listName = req.body.list;
    const newItem = new Item({
        name: item
    });
    if (listName === "Today") {
        newItem.save();
        console.log("New Task added succesfully");
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName })
            .then(function (lixt) {
                console.log(lixt);
                console.log("=====");
                lixt.items.push(newItem);
                lixt.save();
                res.redirect("/" + listName);
            })
    }

})

app.post("/delete", function (req, res) {
    const checkItem = req.body.checkbox;
    const listName = req.body.collectionName;
    console.log(req.body.checkbox);
    if (listName === "Today") {
        Item.findByIdAndRemove({ _id: checkItem })
            .then(function () {
                console.log("Deleted succesfully");
                res.redirect("/");
            })
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItem } } })
            .then(function () {
                console.log("Deleted yo");

                res.redirect("/" + listName);
            })
    }

})

app.get("/:route", function (req, res) {
    const routeName = _.capitalize(req.params.route);
    console.log(routeName);
    // 
    List.findOne({ name: routeName })
        .then(function (foundList) {
            console.log(foundList);
            if (!foundList) {
                console.log("Doesn't exist");
                const newCollection = new List({
                    name: routeName,
                    items: defaultItems
                });
                newCollection.save();
                res.redirect("/" + routeName);
            } else {
                console.log("Found");
                console.log(foundList);
                res.render("list", {
                    colName: foundList.name,
                    taskList: foundList.items
                });
            }
        })




});


app.listen(3000, function () {
    console.log("Server is up and running")
})