import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.user_email,
    pass: process.env.user_pass,
  }
});
export async function sendMail(names_expair:string) {
  await transporter.sendMail({
    from:process.env.user_email,
    to:process.env.email_to,
    subject: "تنبيه انتهاء صلاحية دواء",
    text: `medicine expiar or expaired soon:\n\n${names_expair}`
  });
 
}