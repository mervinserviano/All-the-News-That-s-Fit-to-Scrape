var mongoose = require("mongoose");

// schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    }
});

var Note = mongoose.model("Note", NoteSchema);

// export
module.exports = Note;