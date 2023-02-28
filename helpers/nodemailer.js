/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *   Unauthorized copying of this file, via any medium is strictly prohibited
 *   Proprietary and confidential
 *   @Written by Amine BEN DHIAB <amine@bps-tunisie.com>
 */
require("dotenv").config();
const nodemailer = require("nodemailer");
const Logger = require("winston");
const configuration = require("../config/config")



const createAndSendEmail = async (opts) => {
  let response = undefined;
  let transporter = nodemailer.createTransport({
    host: configuration.mailing.host,
    port: configuration.mailing.port,
    from: configuration.mailing.from,
    secure: true,
    auth: {
      user: configuration.mailing.user,
      pass: configuration.mailing.password
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  if (opts.to && ((Array.isArray(opts.to) && opts.to.length > 0) || (!Array.isArray(opts.to)))) {

    const mailOpts = {
      from: configuration.mailing.sender || "Doculock",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: opts.attachments
    };

    response = await transporter.sendMail(mailOpts);
    return response;
  } else {
    Logger.error("Missing arguments", opts)
  }
};

module.exports = createAndSendEmail;