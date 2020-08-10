module.exports = {
  verificationEmail: function (url, name) {
    return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0"
        style="width:100%!important;line-height: 1.4;color: #4d4d4d;padding: 0px; box-sizing: border-box; font-weight: 500;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20"
                    style="border:1px solid #eaeaea;border-radius:5px;margin:40px 0">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="border: 3px solid #000; padding: 10px;">
                                <tr>
                                    <td width="100%">
                                        <table align="center" width="570" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding:10px 35px;">
                                                    <h1
                                                        style="color: #333;font-size: 20px;margin-bottom: 40px; text-align: left;font-family: Roboto, sans-serif">
                                                        <span
                                                            style="color: #464646;font-size: 30px; font-weight: bolder;">Weirdo</span>
                                                    </h1>
                                                    <div style="color: #4d4d4d; margin-bottom: 10px;font-family: Roboto, sans-serif">Hello <strong
                                                            style="color: #464646;font-size: 20px;">${name}</strong>,
                                                    </div>
                                                    <p style="font-family: Roboto, sans-serif">Thanks for signing up for
                                                        <span style=" font-size: 20px;color: #464646;font-family: Roboto, sans-serif; font-weight:
                                                    bold;">Weirdo</span>.
                                                        We're excited to have you as user. To complete the login
                                                        process,
                                                        please
                                                        click the
                                                        button below:
                                                    </p>
                                                    <table style=" margin: 30px auto;" align="center" width="100%"
                                                        cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td align="center">
                                                                <div>
                                                                    <a href="${url}"
                                                                        style="display: inline-block;width: 200px;background-color: #464646;border-radius: 3px;color: #333;font-size: 15px;line-height: 45px;text-align: center;text-decoration: none;-webkit-text-size-adjust: none;margin-top: 20px; border: 3px solid #333; font-weight: bold;line-height: 3.5;color: #fff;font-family: Roboto, sans-serif">
                                                                        Verify Email</a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p
                                                        style="text-align: center; padding-top: 20px;font-family: Roboto, sans-serif">
                                                        Or copy and paste this URL into a new tab of your browser:
                                                    </p>
                                                    <div
                                                        style="word-break: break-all;margin:30px 15px 50px;text-align: center;">
                                                        <a href="${url}"
                                                            style="text-align:center;color:#3899fa;text-decoration:none;font-size: 15px; font-family: Roboto, sans-serif">
                                                           ${url}
                                                        </a>
                                                    </div>

                                                    <p style="font-family: Roboto, sans-serif">Thanks,<br> Weirdo Team</p>
                                                    <table
                                                        style="margin-top: 25px;padding-top: 20px;border-top: 1px solid #E7EAEC;font-family: Roboto, sans-serif">
                                                        <tr>
                                                            <td>
                                                                <p class="sub">If you didn't attempt to log in but
                                                                    received
                                                                    this
                                                                    email, or if the location doesn't match, please
                                                                    ignore
                                                                    this
                                                                    email. If you are concerned about your account's
                                                                    safety,
                                                                    please
                                                                    reply to this email to get in touch with us.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <p style="font-size: 15px;text-align: center;font-family: Roboto, sans-serif">
                                                        Weirdo, Inc.
                                                        <br>&copy; Copyrights reserved
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
        `
  },
  resetEmail: function (url, name) {
    return `
      <table width="100%" border="0" cellspacing="0" cellpadding="0"
      style="width:100%!important;line-height: 1.4;color: #4d4d4d;padding: 0px; box-sizing: border-box; font-weight: 500;font-family: Roboto, sans-serif">
      <tr>
          <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="20"
                  style="border:1px solid #eaeaea;border-radius:5px;margin:40px 0">
                  <tr>
                      <td align="center">
                          <table width="100%" cellpadding="0" cellspacing="0"
                              style="border: 3px solid #000; padding: 10px;">
                              <tr>
                                  <td width="100%">
                                      <table align="center" width="570" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                              <td style="padding:10px 35px;">
                                                  <h1
                                                      style="color: #333;font-size: 20px;margin-bottom: 40px; text-align: left;">
                                                      <span
                                                          style="color: #000;font-size: 30px; font-family: Roboto, sans-seriffont-weight: bolder;">Weirdo</span>
                                                  </h1>
                                                  <div style="color: #4d4d4d; margin-bottom: 10px;">Hello <strong
                                                          style="color: #000;font-size: 20px;">${name}</strong>,
                                                  </div>
                                                  <p style="font-family: Roboto, sans-serif">
                                                      It seems that you are having trouble remembering your password.
                                                      Inorder to create a new password, please click the button below:
                                                  </p>
                                                  <table style=" margin: 30px auto;" align="center" width="100%"
                                                      cellpadding="0" cellspacing="0">
                                                      <tr>
                                                          <td align="center">
                                                              <div>
                                                                  <a href="${url}"
                                                                      style="display: inline-block;width: 200px;background-color: #464646;border-radius: 3px;color: #fff;font-size: 15px;line-height: 45px;text-align: center;text-decoration: none;-webkit-text-size-adjust: none;margin-top: 20px;  font-weight: bold;line-height: 3.5;font-family: Roboto, sans-serif; border: 3px solid #464646;">
                                                                      Verify Email</a>
                                                              </div>
                                                          </td>
                                                      </tr>
                                                  </table>
                                                  <p
                                                      style="text-align: center; padding-top: 20px;font-family: Roboto, sans-serif">
                                                      Or copy and paste this URL into a new tab of your browser:
                                                  </p>
                                                  <div
                                                      style="word-break: break-all;margin:30px 15px 50px;text-align: center;">
                                                      <a href="${url}"
                                                          style="text-align:center;color:#3899fa;text-decoration:none;font-size: 15px;font-family: Roboto, sans-serif">
                                                          ${url}
                                                      </a>
                                                  </div>

                                                  <p style="font-family: Roboto, sans-serif">Thanks,<br> Weirdo's Team</p>
                                                  <table
                                                      style="margin-top: 25px;padding-top: 20px;border-top: 1px solid #E7EAEC;font-family: Roboto, sans-serif">
                                                      <tr>
                                                          <td>
                                                              <p class="sub">
                                                                  If you didn't attempt to change account password but
                                                                  received this email, or if the location doesn't
                                                                  match, please ignore this email. If you are
                                                                  concerned about your account's safety, please reply
                                                                  to this email to get in touch with us.
                                                              </p>
                                                          </td>
                                                      </tr>
                                                  </table>

                                                  <p style="font-size: 15px;text-align: center;font-family: Roboto, sans-serif">
                                                      Weirdo, Inc.
                                                      <br>&copy; Copyrights reserved
                                                  </p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
      `
  },
}
