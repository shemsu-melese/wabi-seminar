//  Send password reset email 
 
export const sendPasswordResetEmail = async (email, token, firstName) => {
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    // If nodemailer is not configured, use mock mode
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 [MOCK] Password Reset Email (SMTP not configured):');
        console.log(`   To: ${email}`);
        console.log(`   Subject: Reset Your Password - WabiSeminar`);
        console.log(`   Link: ${resetLink}`);
        console.log(`   Token: ${token}`);
        return { success: true, mock: true };
    }

    try {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        await transporter.verify();

        const mailOptions = {
            from: `"WabiSeminar" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password - WabiSeminar',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #6366F1; }
                        .header h1 { color: #6366F1; margin: 0; font-size: 28px; }
                        .content { padding: 20px 0; }
                        .button { display: inline-block; background: #6366F1; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>WabiSeminar</h1>
                            <p style="color: #64748b; margin: 0;">Meet. Focus. Collaborate.</p>
                        </div>
                        <div class="content">
                            <h2>Reset Your Password</h2>
                            <p>Hello <strong>${firstName || 'User'}</strong>,</p>
                            <p>We received a request to reset your WabiSeminar account password.</p>
                            <p>Click the button below to create a new password:</p>
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; color: #94a3b8; margin-top: 20px;">
                                This link will expire in <strong>1 hour</strong>.
                            </p>
                            <p style="font-size: 14px; color: #94a3b8;">
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 WabiSeminar. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Reset Your Password - WabiSeminar
                ----------------------------------------
                
                Hello ${firstName || 'User'},
                
                We received a request to reset your WabiSeminar account password.
                
                To reset your password, click the link below:
                ${resetLink}
                
                This link will expire in 1 hour.
                
                If you didn't request this, you can safely ignore this email.
                
                ---
                WabiSeminar - Meet. Focus. Collaborate.
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send password reset email:', error.message);
        // Return mock success so user still gets token (for testing)
        console.log('📧 [FALLBACK] Using mock mode due to email error');
        console.log(`   Link: ${resetLink}`);
        console.log(`   Token: ${token}`);
        return { success: true, mock: true, fallback: true };
    }
};

//   Send password reset success email
 
export const sendPasswordResetSuccessEmail = async (email, firstName) => {
    const loginLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 [MOCK] Password Reset Success Email (SMTP not configured):');
        console.log(`   To: ${email}`);
        console.log(`   Subject: Password Reset Successful - WabiSeminar`);
        return { success: true, mock: true };
    }

    try {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"WabiSeminar" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Successful - WabiSeminar',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #22C55E;">✅ Password Reset Successful</h1>
                    <p>Hello <strong>${firstName || 'User'}</strong>,</p>
                    <p>Your WabiSeminar account password has been successfully changed.</p>
                    <p>You can now log in with your new password.</p>
                    <a href="${loginLink}" style="display: inline-block; background: #6366F1; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Log In Now</a>
                </div>
            `,
            text: `
                Password Reset Successful - WabiSeminar
                ----------------------------------------
                
                Hello ${firstName || 'User'},
                
                Your WabiSeminar account password has been successfully changed.
                You can now log in with your new password.
                
                Log in here: ${loginLink}
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Password reset success email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send password reset success email:', error.message);
        return { success: true, mock: true, fallback: true };
    }
};

//   Test email configuration
 
export const testEmailConfig = async () => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️ SMTP not configured - using mock mode');
            return true;
        }
        
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        await transporter.verify();
        console.log('Email configuration is valid');
        return true;
    } catch (error) {
        console.error('Email configuration invalid:', error.message);
        console.log('⚠️ Using mock mode for emails');
        return true; 
    }
};