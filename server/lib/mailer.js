const nodemailer = require('nodemailer');
const Promise = require('bluebird');

const { mailer } = require('../../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: mailer.account,
    clientId: mailer.clientId,
    clientSecret: mailer.clientSecret,
    refreshToken: mailer.refreshToken,
  },
});

async function sendMail(to, subject, html) {
  return new Promise((resolve, reject) => {
    const mailOpts = {
      from: `${mailer.name} <${mailer.account}>`,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOpts, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  sendMail,
};
