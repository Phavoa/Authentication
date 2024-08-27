import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtarp.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    console.log(`Sending verification email to: ${email}`);
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verity your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification email: ${error}`);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "f48f5df0-1278-4883-a8ce-871ee09ab805",
      template_variables: {
        company_info_name: "Authentication Company",
        name: name,
        company_info_address: "Test_Company_info_address",
        company_info_city: "Test_Company_info_city",
        company_info_zip_code: "Test_Company_info_zip_code",
        company_info_country: "Test_Company_info_country",
      },
    });
    console.log("Welcome email sent sucessfully", response);
  } catch (error) {
    console.error(`Error sending Welcome email: ${error}`);
    throw new Error(`Error sending Welcome email: ${error}`);
  }
};

export const sendPasswordResentEmail = async (email, resetURL) => {
  const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset",
          });
        
          console.log('Password reset email sent successfully:', response);
    } catch (error) {
        console.log(`Error sending password reset email: ${email}`)
        throw new Error(`Error sending password reset email: ${email}`)
    }
  
};

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
          });
        
          console.log('Password reset email sent successfully:', response);
    } catch (error) {
        console.log(`Error sending password reset email: ${email}`)
        throw new Error(`Error sending password reset email: ${email}`)
    }
}
