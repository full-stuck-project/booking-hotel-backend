
const nodemailer = require('nodemailer');


const user = {
    mail: process.env.MAIL,
    auth: process.env.MAIL_AUTH,
    service: process.env.MAIL_SERVICE,
    // host: process.env.MAIL_SERVER,
    // port: process.env.MAIL_SERVER_PORT,
}


const mail = async (email, subject, message) => {
    console.log('Mailing...............');

    const transporterObj = user.service === 'gmail' ? 
                                    {
                                      service: 'gmail',
                                      auth: {
                                          user: user.mail,
                                          pass: user.auth
                                      }
                                    } :
                                    {
                                      host: user.host,
                                      port: user.port,
                                      secure: true,
                                      auth: {
                                          user: user.mail,
                                          pass: user.auth
                                      }
                                    }

    const transporter = nodemailer.createTransport(transporterObj);
    
    const mailOptions = {
        from: user.mail,
        to: email,
        subject,
        html: message
        //text: message
    };
    
    console.log(user)
    console.log(mailOptions)
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
       
        return { status: 'SUCCESS',
                    msg: info.response };
    } catch (err) {
            console.log(err);
            
            return { status: 'ERROR',
                        msg: err.message }
            
    } 
        
}

const getMailTemplateWithLink = (content, buttonUrl, buttonText) => {
    return `<!DOCTYPE html>
    <html>
    <body style="text-align: center; font-family: 'Verdana', serif; color: #000;">
      <div
        style="
          max-width: 400px;
          margin: 10px;
          background-color: #fafafa;
          padding: 25px;
          border-radius: 20px;
        "
      >
        <p style="text-align: left;">
          ${content}
        </p>
        <a href="${buttonUrl}" target="_blank">
          <button
            style="
              background-color: #444394;
              border: 0;
              width: 200px;
              height: 30px;
              border-radius: 6px;
              color: #fff;
            "
          >
            ${buttonText}
          </button>
        </a>
        <p style="text-align: left;">
          If you are unable to click the above button, copy paste the below URL into your address bar
        </p>
        <a href="${buttonUrl}" target="_blank">
            <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">
              ${buttonUrl}
            </p>
        </a>
      </div>
    </body>
  </html>`;
}

module.exports = { mail, getMailTemplateWithLink };