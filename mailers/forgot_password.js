const nodeMailer = require("../config/nodemailer");
// this is another way of exporting a method
module.exports.newpasswordlink = (newpasswordlink) => {
  let htmlString = nodeMailer.renderTemplate(
    { newpasswordlink: newpasswordlink },
    "/password/new_resetlink.ejs"
  );
  console.log("nodemailer");
  nodeMailer.transporter.sendMail(
    {
      from: "buzzinga50@gmail.com",
      to: newpasswordlink.user.email,
      subject: "Link to reset your password!",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }

      //console.log('Message sent', info);
      return;
    }
  );
};
