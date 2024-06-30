import 'dotenv/config'
import mongoose from 'mongoose'
import { Event, Users } from './models.mjs'
import { sendEventOut } from '../messaging/email.mjs'

const MONGO_URI = process.env.MONGODB_URI
// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
});

// Connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

export const createEvent = async (data, token) => {
    
    try {
        const event = await Event.create({
            name: data.name,
            creator: token.name,
            description: data.description,
            location: data.location,
            short_name: data.short_name,
            date_and_time: data.date_and_time,
            going: [
                {
                    name: token.name,
                    extras: []
                }
            ],
            not_going: []
        });

        sendEventOut(token._id, event._id.toString())
        return `${event._id.toString()}/${token._id.toString()}`;
    } catch (error) {
        console.error('Error creating event:', error);
        return null;
    }
};

export const getEvent = async (id) => {
    try {
        const event = await Event.findById(id);
        return event;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const createUser = async (name, number, gateWay) => {
    try {
        const user = await Users.create({
            name,
            number,
            gate_way: gateWay,
            token: Math.floor(Math.random() * 10_000).toString().padStart(4, '0') //Generate random 4 digit num
        });
        return user;
    } catch (error) {
        console.error('Error creating access token:', error);
        return null;
    }
};

export const getUser = async (id, number = null) => {
    try {
        if (number) {
            const user = await Users.findOne({
                number
            });
            return user;
        } else {
            const user = await Users.findById(id);
            return user;
        }
    } catch (error) {
        //console.error('Error creating access token:', error);
        return null;
    }
}

export const getAllUsers = async (exludedPerson) => {
    try {
        const users = await Users.find({
            _id: { $nin: [exludedPerson] }
        })
        return users;
    } catch (error) {
        console.error('Error adding user:', error);
        return false;
    }

}

export const addUserToEvent = async (evId, name, guests = null) => {
    try {
        const event = await Event.findById(evId);

        // Add user to going
        event.going = updateList(event.going, { name, extras: guests || [] });

        // Remove user from not going
        event.not_going = removeUser(event.not_going, name);

        await event.save();
        return true;
    } catch (error) {
        console.error('Error adding user:', error);
        return false;
    }
}

export const removeUserFromEvent = async (evId, name, message = "") => {
    try {
        const event = await Event.findById(evId);

        // Add user to not going
        event.not_going = updateList(event.not_going, { name, message });

        // Remove user from going
        event.going = removeUser(event.going, name);

        await event.save();
        return true;
    } catch (error) {
        console.error('Error removing user:', error);
        return false;
    }
}

export const checkAccessToken = async (token) => {
    const user = await Users.findOne({ token: token });
    return user;
}

export const deleteUser = async (number) => {
    const del = await Users.deleteOne({ number});
    return del;
}

// Helper function to update a list and remove duplicates
const updateList = (list, user) => {
    const filteredList = removeUser(list, user.name);
    return [...filteredList, user];
}

// Helper function to remove a user by name
const removeUser = (list, name) => {
    return list.filter(user => user.name !== name);
}
