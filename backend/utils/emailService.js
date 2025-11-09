import nodemailer from 'nodemailer';

// Create transporter (using Gmail as example)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (email, verificationLink, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Career Guidance Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Career Guidance Platform!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

/**
 * Send admission status notification
 */
export const sendAdmissionNotification = async (email, studentName, institutionName, courseName, status) => {
  try {
    const transporter = createTransporter();
    
    const statusMessage = status === 'admitted' 
      ? `Congratulations! You have been admitted to ${courseName} at ${institutionName}.`
      : `We regret to inform you that your application for ${courseName} at ${institutionName} was not successful.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Admission Decision - ${institutionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Admission Decision</h2>
          <p>Dear ${studentName},</p>
          <p>${statusMessage}</p>
          <div style="background-color: ${status === 'admitted' ? '#d1fae5' : '#fee2e2'}; 
                     padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: ${status === 'admitted' ? '#065f46' : '#991b1b'};">
              Status: ${status.toUpperCase()}
            </p>
          </div>
          <p>Course: ${courseName}</p>
          <p>Institution: ${institutionName}</p>
          ${status === 'admitted' ? `
            <p>Please log in to your account to accept the admission offer and proceed with registration.</p>
          ` : `
            <p>We encourage you to apply for other courses that match your qualifications.</p>
          `}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admission notification sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admission notification:', error);
    return false;
  }
};

/**
 * Send job application notification
 */
export const sendJobApplicationNotification = async (email, studentName, companyName, jobTitle) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Job Application Submitted - ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Job Application Submitted</h2>
          <p>Dear ${studentName},</p>
          <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
          <p>The company will review your application and contact you if you are shortlisted for an interview.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin: 0;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>You can track your application status from your student dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Job application notification sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending job application notification:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetLink, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Career Guidance Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset</h2>
          <p>Hello ${userName},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            For security reasons, do not share this link with anyone.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send company approval notification
 */
export const sendCompanyApprovalEmail = async (email, companyName, approved) => {
  try {
    const transporter = createTransporter();
    
    const subject = approved 
      ? 'Company Account Approved - Career Guidance Platform'
      : 'Company Account Suspended - Career Guidance Platform';

    const message = approved
      ? `Congratulations! Your company account "${companyName}" has been approved. You can now post job opportunities and access all platform features.`
      : `Your company account "${companyName}" has been suspended. Please contact support for more information.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Company Account Update</h2>
          <p>Dear ${companyName} Team,</p>
          <p>${message}</p>
          <div style="background-color: ${approved ? '#d1fae5' : '#fee2e2'}; 
                     padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: ${approved ? '#065f46' : '#991b1b'};">
              Status: ${approved ? 'APPROVED' : 'SUSPENDED'}
            </p>
          </div>
          ${approved ? `
            <p>You can now:</p>
            <ul>
              <li>Post job opportunities</li>
              <li>Review qualified applicants</li>
              <li>Manage your company profile</li>
              <li>Connect with potential candidates</li>
            </ul>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Company approval email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending company approval email:', error);
    return false;
  }
};

export default {
  sendVerificationEmail,
  sendAdmissionNotification,
  sendJobApplicationNotification,
  sendPasswordResetEmail,
  sendCompanyApprovalEmail,
};