import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { createEvent, checkAccessToken, getEvent, getUser, addUserToEvent, removeUserFromEvent, createUser, deleteUser } from './db/db.mjs';

const app = express();
const port = process.env.serverPort;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({success: true, message: "The server is up and running!"})
})

app.post("/create", async (req, res) => {
    try {
        const data = await req.body;
        const accessToken = data.access_token;
        const validToken = await checkAccessToken(accessToken);
        if (!validToken) {
            res.status(403).json({
                error: "Invalid Token, please ask Obadiah for a token."
            });
            return;
        } else {
            const event = await createEvent(data, validToken);
            if (!event) {
                res.sendStatus(400);
                return
            }
            res.status(200).json({
                link: event
            });
        }
    } catch (e) {
        res.sendStatus(400);
    }
});

app.get("/event/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.sendStatus(403);
            return;
        }
        const event = await getEvent(id);
        if (event) {
            res.status(200).json(event);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

app.get("/user/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.sendStatus(403);
            return;
        }
        const user = await getUser(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

app.post("/invite", async (req, res) => {
    try {
        const { name, number } = await req.body;
        const [status, sms_email] = await checkNumber(number);
        if (!status) {
            res.status(400).json({ "errorMessage": "Invalid Phone Number!" });
            return;
        }
        await createUser(name, number, sms_email);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

const checkNumber = async (number) => {
    const gates = {
        Sprint: "@tmomail.net"
    };
    const res = await fetch(`https://www.ipqualityscore.com/api/json/phone/${process.env.PHONENUMBERAPIKEY}/${"1" + number}`);
    let { valid, sms_email, carrier } = await res.json();
    if (sms_email === "N\/A") {
        sms_email = number + gates[carrier];
    }
    return [valid, sms_email];
};

app.post("/edit/event/:id", async (req, res) => {
    try {
        const evId = req.params.id;
        const data = await req.body;
        const { uid, mode, guests, message } = data;

        const event = await getEvent(evId);

        if (!event) {
            res.sendStatus(404);
        };

        const user = await getUser(uid);
        let name = "Guest";
        if (user) {
            name = user.name;
        }

        if (mode === "going") {
            const wasSuccessful = await addUserToEvent(evId, name, guests);
            if (!wasSuccessful) res.sendStatus(500);
        } else if (mode === "not going") {
            const wasSuccessful = await removeUserFromEvent(evId, name, message);
            if (!wasSuccessful) res.sendStatus(500);
        } else {
            res.sendStatus(400);
        }
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(400);
    }
});

app.post("/delete-user", async (req, res) => {
    try {
        const { number } = await req.body;
        const info = await deleteUser(number);
        if (info.deletedCount > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

app.listen(port, () => {
    console.log("listening");
})

export default app;

