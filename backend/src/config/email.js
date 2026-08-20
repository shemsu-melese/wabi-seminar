import nodemailer from 'nodemailer';

export const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    from: process.env.SMTP_FROM || 'WabiSeminar <noreply@wabiseminar.com>'
};

export const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
        tls: {
            rejectUnauthorized: false
        }
    });
};

export default emailConfig;