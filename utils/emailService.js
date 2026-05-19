const nodemailer = require('nodemailer');

// Initialize Transporter exclusively using Environment Parameters loaded from .env
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generalized Send Mail Function Wrapper
const sendMailWrapper = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"MedLink Medical Operations" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        };
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent Success] Target: ${to} | Subject: ${subject}`);
    } catch (error) {
        console.error(`[Email Service Failure] Could not dispatch mail to ${to}:`, error);
        throw error; // Throw error to handle cleanly inside controllers via try/catch
    }
};

// --- STYLED HTML WRAPPER TEMPLATE ---
const getBaseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f1; }
        .email-header { background: linear-gradient(135deg, #00a8bd, #007a8c); padding: 30px; text-align: center; color: #ffffff; }
        .email-header h1 { margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px; }
        .email-body { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .email-body p { font-size: 16px; margin-top: 0; margin-bottom: 16px; }
        .highlight-box { background-color: #f0f9fa; border-left: 4px solid #00a8bd; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .email-footer { background-color: #fafcfc; padding: 20px; text-align: center; color: #777777; font-size: 13px; border-top: 1px solid #eef2f1; }
        .btn { display: inline-block; padding: 12px 24px; color: #ffffff !important; background-color: #00a8bd; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>MedLink Console</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #007a8c; margin-top: 0;">${title}</h2>
            ${bodyContent}
        </div>
        <div class="email-footer">
            <p>&copy; 2026 MedLink Management Network Platforms. All Rights Reserved.</p>
            <p>This is an automated operational alert system monitor, please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
`;

// ==========================================
// BUSINESS EVENTS MAIL INTERFACES
// ==========================================

const emailService = {
    // 1. Patient Registration Success
    sendPatientWelcome: async (patientEmail, patientName) => {
        const title = `Welcome to MedLink, ${patientName}!`;
        const body = `
            <p>Your regular patient care file account has been initialized and securely committed onto our server backplane logs.</p>
            <p>You can now book medical consultation appointments seamlessly, purchase pharmacy medicines digital prescription logs, and check historical tracking reports.</p>
            <a href="http://localhost:8080/login" class="btn">Access Patient Workspace</a>
        `;
        await sendMailWrapper(patientEmail, 'Account Verification Active - MedLink', getBaseTemplate(title, body));
    },

    // 2. Patient Appointment Booked (Pending State Confirmation)
    sendAppointmentBookingConfirmation: async (patientEmail, patientName, doctorName, date, time) => {
        const title = `Consultation Reservation Request Captured`;
        const body = `
            <p>Dear ${patientName}, your medical consultation appointment request has been compiled successfully onto our registry servers.</p>
            <div class="highlight-box">
                <strong>Practitioner Assigned:</strong> Dr. ${doctorName}<br/>
                <strong>Allocated Date:</strong> ${new Date(date).toLocaleDateString()}<br/>
                <strong>Time Window Slot:</strong> ${time}<br/>
                <strong>Current Review State:</strong> <span style="color: #d39e00; font-weight: bold;">Pending Confirmation</span>
            </div>
            <p>Our automation engines will update your care ledger cards as soon as the specialist confirms their clinical session tracking timeline panel blocks.</p>
        `;
        await sendMailWrapper(patientEmail, 'Reservation Routing Notification Log - MedLink', getBaseTemplate(title, body));
    },

    // 3. Appointment Marked Completed
    sendAppointmentCompletionAlert: async (patientEmail, patientName, doctorName) => {
        const title = `Medical Consultation Concluded Successfully`;
        const body = `
            <p>Dear ${patientName}, your medical session profile tracking ledger entries with <strong>Dr. ${doctorName}</strong> have been formally flagged as completed by the clinician terminal console.</p>
            <p>Your clinical case history files have been updated. If you ever need to follow up with the same practitioner, you can instantly rebook them from your core patient metrics workspace.</p>
            <a href="http://localhost:8080/profile" class="btn">View Care Records</a>
        `;
        await sendMailWrapper(patientEmail, 'Session Ledger Closure Logs - MedLink', getBaseTemplate(title, body));
    },

    // 4. Doctor Registration Submitted (Fixed Infinite Stack Crash bug)
    sendDoctorPendingReview: async (doctorEmail, doctorName) => {
        const title = `Practitioner Profile Staged For Validation`;
        const body = `
            <p>Hello Dr. ${doctorName}, your request application forms to board our digital clinical registries network have been safely recorded.</p>
            <div class="highlight-box">
                <strong>Registration State Status:</strong> <span style="color: #dc3545; font-weight: bold;">Awaiting Administrative Audit Approval</span>
            </div>
            <p>Our administration backplane team compiles credentialing logs manually. A confirmation receipt validation token link will hit your inbox as soon as review sessions finish execution parameters.</p>
        `;
        // ✅ CRITICAL BUG FIXED: Swferred call from inner loop to standard layout wrapper
        await sendMailWrapper(doctorEmail, 'Clinical Console Credential Processing Logs - MedLink', getBaseTemplate(title, body));
    },

    // 5. Doctor Approved (Formally Transferred onto Living Registry)
    sendDoctorApprovalNotice: async (doctorEmail, doctorName) => {
        const title = `Credentials Verified - Welcome Onboard Portal`;
        const body = `
            <p>Congratulations Dr. ${doctorName}, your administrative verification protocol cycle has successfully completed validation loops.</p>
            <p>Your profile specialist cards are now live in our public patient directory. You can access your operational dash panel desks to configure shift timelines, manage time blocks, and complete incoming consultations.</p>
            <a href="http://localhost:8080/doctorLogin" class="btn">Open Clinical Terminal Workspace</a>
        `;
        await sendMailWrapper(doctorEmail, 'Clinical Verification Clear Notification Logs - MedLink', getBaseTemplate(title, body));
    },

    // 6. Doctor Received an Incoming Patient Appointment Allocation
    sendDoctorAppointmentReceived: async (doctorEmail, doctorName, patientName, date, time) => {
        const title = `New Patient Allocated onto Your Pipeline Queues`;
        const body = `
            <p>Hello Dr. ${doctorName}, a patient has committed a new consultation slot block request against your operational tracking registry.</p>
            <div class="highlight-box">
                <strong>Regular Patient File Name:</strong> ${patientName}<br/>
                <strong>Target Consultation Date:</strong> ${new Date(date).toLocaleDateString()}<br/>
                <strong>Requested Time Block:</strong> ${time}
            </div>
            <p>Access your dashboard console console terminals sequentially to sign off on live waiting queue records.</p>
            <a href="http://localhost:8080/doctorLogin" class="btn">Manage Pending Queue</a>
        `;
        await sendMailWrapper(doctorEmail, 'Consultation Registry Update Alert - MedLink', getBaseTemplate(title, body));
    },
    // 7. Medicine Order Purchase Invoice Dispatch Sequence
    sendMedicineInvoice: async (patientEmail, patientName, purchasedItems, grandTotal) => {
        const title = `Your Digital Pharmacy Invoice Receipt`;
        
        // Loop chalakar saari bought medicines ki row design karenge html table format mein
        let itemsTableHtml = '';
        purchasedItems.forEach(item => {
            itemsTableHtml += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eef2f1;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eef2f1; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eef2f1; text-align: right;">₹${item.price.toFixed(2)}</td>
                </tr>
            `;
        });

        const body = `
            <p>Dear ${patientName}, thank you for your order! Your digital pharmaceutical transaction has been successfully authorized and billed.</p>
            <div class="highlight-box" style="padding: 15px;">
                <h4 style="margin-top: 0; color: #007a8c; border-bottom: 2px solid #00a8bd; padding-bottom: 5px;">Order Details Summary</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background-color: #f0f9fa; color: #007a8c; font-weight: bold;">
                            <th style="padding: 10px; text-align: left;">Medicine Name</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsTableHtml}
                        <tr style="font-weight: bold; background-color: #f9fbfb;">
                            <td colspan="2" style="padding: 12px 10px; text-align: left; border-top: 2px solid #eef2f1;">Grand Total Paid:</td>
                            <td style="padding: 12px 10px; text-align: right; border-top: 2px solid #eef2f1; color: #28a745; font-size: 16px;">₹${grandTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>Your items are currently being processed at the central pharmacy dispensary desk and will be routed to your delivery location shortly.</p>
            <a href="http://localhost:8080/profile" class="btn">Track Order History</a>
        `;

        await sendMailWrapper(patientEmail, 'Pharmacy Invoice Bill Logs - MedLink', getBaseTemplate(title, body));
    }
};


module.exports = emailService;