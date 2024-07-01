import 'dotenv/config';
import { getAllUsers } from '../db/db.mjs';
import nodemailer from 'nodemailer'

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.GOOGLEAPPPASSWORD,
    },
});

export const sendEventOut = async (creator, eventId) => {
    console.log("Sending out texts")
    const userList = await getAllUsers()
    userList.forEach( async (u) => {
        let message = `
        New Event: http://event.obadiahfusco.com/event/${eventId}/${u._id.toString()}\n
        Stop Receiving Messages: http://event.obadiahfusco.com/stop
        `
        if (u._id.toString() === creator.toString()) {
            message = `\nEvent Created: http://event.obadiahfusco.com/event/${eventId}/${u._id.toString()}`
        }
        await sendSMS(u.gate_way, message)
    })
}

// Send SMS via email
const sendSMS = async (gateway, message) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: gateway,
        text: message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('SMS sent:', info.response);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};


/*const message = "Event Created: http://event.obadiahfusco.com/event/667f06b4412acd6792de2549/667f066b412acd6792de2546"
sendSMS(gateway here", message)
*/