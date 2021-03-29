const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'antonio_hernandez96@hotmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
        html: `
        <p>Welcome to the app, ${name}.</p>
        <p>Let me know how you get along with the app.</p>
        `
    })
}

const sendGoobyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'antonio_hernandez96@hotmail.com',
        subject: 'Don\'t leave so soon!',
        text: `Hi ${name}, we saw you recently cancelled your account and we wanted to know what we could to do improve our service, we hope to see you soon again.`,
        html: `
        <p>Hi ${name},</p>
        <p>we saw you recently cancelled your account and we wanted to know what we could to do improve our service,</p>
        <p>we hope to see you soon again.</p>
        `
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoobyeEmail
}