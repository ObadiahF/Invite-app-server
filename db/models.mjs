import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    name: String,
    creator: String,
    description: String,
    location: String,
    short_name: String,
    date_and_time: String,
    going: [{
        name: String,
        extras: [{type: String}]
    }],
    not_going: [{
        name: String,
        message: String
    }]
});

const users = new Schema({
    name: String,
    token: String,
    number: String,
    gate_way: String
})

export const Event = model('Event', eventSchema);
export const Users = model("Users", users)
