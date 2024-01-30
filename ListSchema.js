const mongoose = require('mongoose');
const Item = require(__dirname + '/ItemSchema.js');

const ListSchema =mongoose.Schema({
    name :String,
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

const List=mongoose.model("List",ListSchema);

module.exports=List;