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

export const sendEventOut = async (excludedUser, eventId) => {

    const userList = await getAllUsers(excludedUser)
    userList.forEach((u) => {
        const message = `
        New Event: http://event.obadiahfusco.com/event/${eventId}/${u._id.toString()}\n
        Stop Receiving Messages: http://event.obadiahfusco.com/stop
        `
        sendSMS(u.gate_way, message)
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
/*
const message = `
        New Event: http://event.obadiahfusco.com/event/667f06b4412acd6792de2549/667f066b412acd6792de2546\n
        Stop Receiving Messages: http://event.obadiahfusco.com/stop
        `
sendSMS("3606678831@txt.att.net", message)
*/