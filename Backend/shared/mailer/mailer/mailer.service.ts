// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
//
// export interface EmailOptions {
//     to: string;
//     subject: string;
//     template?: string;
//     context?: Record<string, any>;
//     html?: string;
//     text?: string;
// }
//
// export interface WelcomeEmailContext {
//     name: string;
//     email: string;
//     companyName?: string;
//     supportEmail?: string;
//     loginUrl?: string;
// }
//
// @Injectable()
// export class MailerService {
//     private readonly logger = new Logger(MailerService.name);
//
//     constructor(
//         private mailerService: NestMailerService,
//         private configService: ConfigService,
//     ) {}
//
//     async sendEmail(options: EmailOptions): Promise<void> {
//         try {
//             const mailOptions: any = {
//                 to: options.to,
//                 subject: options.subject,
//             };
//
//             if (options.template && options.context) {
//                 mailOptions.template = options.template;
//                 mailOptions.context = options.context;
//             } else if (options.html) {
//                 mailOptions.html = options.html;
//             } else if (options.text) {
//                 mailOptions.text = options.text;
//             }
//
//             const result = await this.mailerService.sendMail(mailOptions);
//             this.logger.log(
//                 `Email sent successfully to ${options.to}: ${result.messageId}`,
//             );
//         } catch (error) {
//             this.logger.error(
//                 `Failed to send email to ${options.to}: ${error.message}`,
//             );
//             throw error;
//         }
//     }
//
//     async sendWelcomeEmail(email: string, name: string, otpCode: string): Promise<void> {
//         const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
//
//         const htmlContent = `
//         //     <!DOCTYPE html>
//         //     <html>
//         //     <head>
//         //         <meta charset="utf-8">
//         //         <title>Welcome to E-Learning Platform</title>
//         //         <style>
//         //           body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; color: #222; }
//         //           .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
//         //           .header { background: #f7931e; color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
//         //           .header h1 { margin: 0; font-size: 2.2rem; }
//         //           .header img { width: 80px; margin-top: 16px; }
//         //           .content { padding: 32px 24px 24px 24px; }
//         //           .content h2 { color: #00bfff; margin-top: 0; }
//         //           .otp-box { background: #f4f8fb; border: 2px dashed #00bfff; border-radius: 12px; padding: 18px; text-align: center; margin: 28px 0; }
//         //           .otp-code { font-size: 2rem; font-weight: bold; color: #f7931e; letter-spacing: 2px; }
//         //           .cta { display: block; margin: 32px auto 0 auto; background: #00bfff; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 1.1rem; width: max-content; }
//         //           .footer { text-align: center; padding: 24px; color: #888; font-size: 0.97rem; background: #f4f8fb; }
//         //         </style>
//         //     </head>
//         //     <body>
//         //         <div class="container">
//         //             <div class="header">
//         //             <h1>Welcome to E-Learning!</h1>
//         //             <img src="https://img.icons8.com/color/96/000000/graduation-cap.png" alt="Welcome" />
//         //             </div>
//         //             <div class="content">
//         //             <h2>Hello ${name},</h2>
//         //             <p>We're thrilled to have you join our learning community! Your journey to new skills and knowledge starts now.</p>
//         //             <p>To activate your account, please use the verification code below:</p>
//         //                 <div class="otp-box">
//         //               <div>Your verification code:</div>
//         //                     <div class="otp-code">${otpCode}</div>
//         //                 </div>
//         //             <p>This code is valid for 10 minutes. If you did not sign up, you can safely ignore this email.</p>
//         //             <a class="cta" href="${baseUrl}/login">Go to E-Learning Platform</a>
//         //             </div>
//         //             <div class="footer">
//         //             &copy; ${new Date().getFullYear()} E-Learning Platform. <br>
//         //             Need help? Contact <a href="mailto:support@elearning.com">support@elearning.com</a>
//         //             </div>
//         //         </div>
//         //     </body>
//         //     </html>
//         // `;
//
//         await this.sendEmail({
//             to: email,
//             subject: 'Welcome to courier services - Verify Your Email',
//             html: htmlContent,
//         });
//     }
//
//     async sendPasswordResetEmail(email: string, name: string, otpCode: string): Promise<void> {
//         const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
//         const htmlContent = `
//             // <!DOCTYPE html>
//             // <html>
//             // <head>
//             //     <meta charset="utf-8">
//             //     <title>Password Reset - E-Learning Platform</title>
//             //     <style>
//             //       body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; color: #222; }
//             //       .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
//             //       .header { background: #f44336; color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
//             //       .header h1 { margin: 0; font-size: 2.2rem; }
//             //       .header img { width: 80px; margin-top: 16px; }
//             //       .content { padding: 32px 24px 24px 24px; }
//             //       .content h2 { color: #f44336; margin-top: 0; }
//             //       .otp-box { background: #f4f8fb; border: 2px dashed #f44336; border-radius: 12px; padding: 18px; text-align: center; margin: 28px 0; }
//             //       .otp-code { font-size: 2rem; font-weight: bold; color: #f44336; letter-spacing: 2px; }
//             //       .cta { display: block; margin: 32px auto 0 auto; background: #f44336; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 1.1rem; width: max-content; }
//             //       .footer { text-align: center; padding: 24px; color: #888; font-size: 0.97rem; background: #f4f8fb; }
//             //     </style>
//             // </head>
//             // <body>
//             //     <div class="container">
//             //         <div class="header">
//             //             <h1>Password Reset Request</h1>
//             //         <img src="https://img.icons8.com/color/96/000000/lock-2.png" alt="Reset" />
//             //         </div>
//             //         <div class="content">
//             //         <h2>Hello ${name},</h2>
//             //             <p>We received a request to reset your password for your E-Learning Platform account.</p>
//             //             <div class="otp-box">
//             //           <div>Your reset code:</div>
//             //                 <div class="otp-code">${otpCode}</div>
//             //             </div>
//             //         <p>This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
//             //         <a class="cta" href="${baseUrl}/login">Go to E-Learning Platform</a>
//             //         </div>
//             //         <div class="footer">
//             //         &copy; ${new Date().getFullYear()} E-Learning Platform. <br>
//             //         Need help? Contact <a href="mailto:support@elearning.com">support@elearning.com</a>
//             //         </div>
//             //     </div>
//             // </body>
//             // </html>
//         `;
//         await this.sendEmail({
//             to: email,
//             subject: 'Password Reset - courier services',
//             html: htmlContent,
//         });
//     }
//
//     async sendEmailVerification(email: string, name: string, otpCode: string): Promise<void> {
//         const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
//         const htmlContent = `
//             // <!DOCTYPE html>
//             // <html>
//             // <head>
//             //     <meta charset="utf-8">
//             //     <title>Email Verification - E-Learning Platform</title>
//             //     <style>
//             //       body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; color: #222; }
//             //       .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
//             //       .header { background: #00bfff; color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
//             //       .header h1 { margin: 0; font-size: 2.2rem; }
//             //       .header img { width: 80px; margin-top: 16px; }
//             //       .content { padding: 32px 24px 24px 24px; }
//             //       .content h2 { color: #f7931e; margin-top: 0; }
//             //       .otp-box { background: #f4f8fb; border: 2px dashed #00bfff; border-radius: 12px; padding: 18px; text-align: center; margin: 28px 0; }
//             //       .otp-code { font-size: 2rem; font-weight: bold; color: #00bfff; letter-spacing: 2px; }
//             //       .cta { display: block; margin: 32px auto 0 auto; background: #00bfff; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 1.1rem; width: max-content; }
//             //       .footer { text-align: center; padding: 24px; color: #888; font-size: 0.97rem; background: #f4f8fb; }
//             //     </style>
//             // </head>
//             // <body>
//             //     <div class="container">
//             //         <div class="header">
//             //             <h1>Email Verification</h1>
//             //         <img src="https://img.icons8.com/color/96/000000/secured-letter.png" alt="Verify" />
//             //         </div>
//             //         <div class="content">
//             //         <h2>Hello ${name},</h2>
//             //             <p>Please verify your email address to complete your registration.</p>
//             //             <div class="otp-box">
//             //           <div>Your verification code:</div>
//             //                 <div class="otp-code">${otpCode}</div>
//             //             </div>
//             //         <p>This code is valid for 10 minutes. If you did not sign up, you can safely ignore this email.</p>
//             //         <a class="cta" href="${baseUrl}/login">Go to E-Learning Platform</a>
//             //         </div>
//             //         <div class="footer">
//             //         &copy; ${new Date().getFullYear()} E-Learning Platform. <br>
//             //         Need help? Contact <a href="mailto:support@elearning.com">support@elearning.com</a>
//             //         </div>
//             //     </div>
//             // </body>
//             // </html>
//         `;
//         await this.sendEmail({
//             to: email,
//             subject: 'Email Verification - courier services',
//             html: htmlContent,
//         });
//     }
//
//     async sendCourseEnrollmentEmail(email: string, name: string, courseName: string): Promise<void> {
//         const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
//         const htmlContent = `
//             // <!DOCTYPE html>
//             // <html>
//             // <head>
//             //     <meta charset="utf-8">
//             //     <title>Course Enrollment - E-Learning Platform</title>
//             //     <style>
//             //       body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; color: #222; }
//             //       .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
//             //       .header { background: #00bfff; color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
//             //       .header h1 { margin: 0; font-size: 2.2rem; }
//             //       .header img { width: 80px; margin-top: 16px; }
//             //       .content { padding: 32px 24px 24px 24px; }
//             //       .content h2 { color: #f7931e; margin-top: 0; }
//             //       .footer { text-align: center; padding: 24px; color: #888; font-size: 0.97rem; background: #f4f8fb; }
//             //     </style>
//             // </head>
//             // <body>
//             //     <div class="container">
//             //         <div class="header">
//             //             <h1>Course Enrollment Confirmation</h1>
//             //         <img src="https://img.icons8.com/color/96/000000/open-book--v2.png" alt="Enrolled" />
//             //         </div>
//             //         <div class="content">
//             //         <h2>Hello ${name},</h2>
//             //             <p>You have successfully enrolled in the course: <strong>${courseName}</strong></p>
//             //             <p>You can now access your course materials and start learning!</p>
//             //         <a class="cta" href="${baseUrl}/courses">Go to My Courses</a>
//             //         </div>
//             //         <div class="footer">
//             //         &copy; ${new Date().getFullYear()} E-Learning Platform. <br>
//             //         Need help? Contact <a href="mailto:support@elearning.com">support@elearning.com</a>
//             //         </div>
//             //     </div>
//             // </body>
//             // </html>
//         `;
//         await this.sendEmail({
//             to: email,
//             subject: `parcel order - ${parcel number}`,
//             html: htmlContent,
//         });
//     }
//
//     async sendCourseCompletionEmail(email: string, name: string, courseName: string): Promise<void> {
//         const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
//         const htmlContent = `
//             // <!DOCTYPE html>
//             // <html>
//             // <head>
//             //     <meta charset="utf-8">
//             //     <title>Course Completion - E-Learning Platform</title>
//             //     <style>
//             //       body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; color: #222; }
//             //       .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
//             //       .header { background: #f7931e; color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
//             //       .header h1 { margin: 0; font-size: 2.2rem; }
//             //       .header img { width: 80px; margin-top: 16px; }
//             //       .content { padding: 32px 24px 24px 24px; }
//             //       .content h2 { color: #00bfff; margin-top: 0; }
//             //       .footer { text-align: center; padding: 24px; color: #888; font-size: 0.97rem; background: #f4f8fb; }
//             //     </style>
//             // </head>
//             // <body>
//             //     <div class="container">
//             //         <div class="header">
//             //             <h1>🎉 Course Completion!</h1>
//             //         <img src="https://img.icons8.com/color/96/000000/certificate.png" alt="Completed" />
//             //         </div>
//             //         <div class="content">
//             //             <h2>Congratulations ${name}!</h2>
//             //             <p>You have successfully completed the course: <strong>${courseName}</strong></p>
//             //             <p>Your certificate will be available in your dashboard shortly.</p>
//             //             <p>Keep up the great work and continue learning!</p>
//             //         <a class="cta" href="${baseUrl}/dashboard">Go to Dashboard</a>
//             //         </div>
//             //         <div class="footer">
//             //         &copy; ${new Date().getFullYear()} E-Learning Platform. <br>
//             //         Need help? Contact <a href="mailto:support@elearning.com">support@elearning.com</a>
//             //         </div>
//             //     </div>
//             // </body>
//             // </html>
//         `;
//         await this.sendEmail({
//             to: email,
//             subject: `Course Completion - ${percel number}`,
//             html: htmlContent,
//         });
//     }
// }