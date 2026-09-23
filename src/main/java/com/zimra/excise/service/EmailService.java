package com.zimra.excise.service;

import com.zimra.excise.entity.SurtaxReturn;
import com.zimra.excise.entity.Taxpayer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async("emailTaskExecutor")
    public void sendNegativeVarianceEmail(
            Long returnId,
            String taxpayerName,
            String email,
            String tin,
            Integer returnMonth,
            Integer returnYear,
            BigDecimal totalPayable,
            BigDecimal totalPaid,
            BigDecimal variance) {

        // Safety check
        if (email == null || email.trim().isEmpty()) {
            logger.warn(
                    "Email not sent: Taxpayer '{}' has no email address",
                    taxpayerName
            );
            return;
        }

        if (variance == null) {
            logger.warn(
                    "Email not sent: Surtax Return {} has no variance",
                    returnId
            );
            return;
        }

        // Only send for negative variance
        if (variance.compareTo(BigDecimal.ZERO) >= 0) {
            logger.info(
                    "Email not required: Surtax Return {} has non-negative variance {}",
                    returnId,
                    formatAmount(variance)
            );
            return;
        }

        String subject =
                "Surtax Return Verification Notice - Negative Variance";

        String message = """
            Dear %s,

            This is to notify you that your Surtax Return has been submitted and reviewed by the ZIMRA Surtax Verification System.

            Return Period: %02d/%d

            Total Payable: %s
            Total Paid: %s
            Variance: %s

            Your return has been flagged because a negative variance was identified.

            Please review the payment details submitted for this return and contact the relevant ZIMRA office for clarification or further assistance.

            Taxpayer TIN: %s

            This is an automated notification. Please do not reply directly to this email.

            Regards,
            ZIMRA
            Revenue Assurance
            """.formatted(
                taxpayerName,
                returnMonth,
                returnYear,
                formatAmount(totalPayable),
                formatAmount(totalPaid),
                formatAmount(variance),
                tin
        );

        SimpleMailMessage mail = new SimpleMailMessage();

        mail.setTo(email);
        mail.setSubject(subject);
        mail.setText(message);

        try {

            logger.info(
                    "Sending negative variance email for Surtax Return {} to taxpayer '{}'",
                    returnId,
                    taxpayerName
            );

            mailSender.send(mail);

            logger.info(
                    "EMAIL SENT SUCCESSFULLY - Return ID: {}, Taxpayer: '{}', Variance: {}",
                    returnId,
                    taxpayerName,
                    formatAmount(variance)
            );

        } catch (Exception e) {

            logger.error(
                    "EMAIL FAILED - Return ID: {}, Taxpayer: '{}', Error: {}",
                    returnId,
                    taxpayerName,
                    e.getMessage(),
                    e
            );
        }
    }



    private String formatAmount(BigDecimal amount) {

        if (amount == null) {
            return "0.00";
        }

        return amount
                .setScale(2, java.math.RoundingMode.HALF_UP)
                .toPlainString();
    }
}