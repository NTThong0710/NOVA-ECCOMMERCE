package com.ecommerce.notification.application.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(String toEmail, Long orderId, Double totalAmount, String shippingAddress) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("BigTech Store - Xác nhận đơn hàng #" + orderId);
            
            String htmlContent = buildOrderConfirmationHtml(orderId, totalAmount, shippingAddress);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi email xác nhận đơn hàng: " + e.getMessage());
        }
    }

    public void sendOrderCancellation(String toEmail, Long orderId, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("BigTech Store - Hủy đơn hàng #" + orderId);
            
            String htmlContent = buildOrderCancellationHtml(orderId, reason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi email hủy đơn hàng: " + e.getMessage());
        }
    }

    public void sendOrderShipped(String toEmail, Long orderId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("BigTech Store - Đơn hàng #" + orderId + " đang được giao");
            
            String htmlContent = buildOrderShippedHtml(orderId);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi email đơn hàng đang giao: " + e.getMessage());
        }
    }

    private String buildOrderConfirmationHtml(Long orderId, Double totalAmount, String shippingAddress) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;\">"
                + "<h2 style=\"color: #4CAF50; text-align: center;\">BigTech Store</h2>"
                + "<h3 style=\"color: #333;\">Xác nhận đơn hàng thành công!</h3>"
                + "<p>Cảm ơn bạn đã mua sắm tại BigTech Store. Đơn hàng của bạn đã được ghi nhận.</p>"
                + "<table style=\"width: 100%; border-collapse: collapse; margin-top: 10px;\">"
                + "<tr><td style=\"padding: 8px; border: 1px solid #ddd;\"><strong>Mã đơn hàng:</strong></td><td style=\"padding: 8px; border: 1px solid #ddd;\">#" + orderId + "</td></tr>"
                + "<tr><td style=\"padding: 8px; border: 1px solid #ddd;\"><strong>Tổng tiền:</strong></td><td style=\"padding: 8px; border: 1px solid #ddd;\">$" + totalAmount + "</td></tr>"
                + "<tr><td style=\"padding: 8px; border: 1px solid #ddd;\"><strong>Địa chỉ giao hàng:</strong></td><td style=\"padding: 8px; border: 1px solid #ddd;\">" + shippingAddress + "</td></tr>"
                + "</table>"
                + "<p style=\"text-align: center; margin-top: 20px; font-size: 12px; color: #777;\">"
                + "Nếu bạn có thắc mắc, vui lòng liên hệ support@bigtech.com.<br>"
                + "<a href=\"#\" style=\"color: #4CAF50;\">Unsubscribe</a>"
                + "</p>"
                + "</div>";
    }

    private String buildOrderCancellationHtml(Long orderId, String reason) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;\">"
                + "<h2 style=\"color: #F44336; text-align: center;\">BigTech Store</h2>"
                + "<h3 style=\"color: #333;\">Thông báo hủy đơn hàng</h3>"
                + "<p>Rất tiếc, đơn hàng <strong>#" + orderId + "</strong> của bạn đã bị hủy.</p>"
                + "<p><strong>Lý do:</strong> " + reason + "</p>"
                + "<p>Chúng tôi sẽ hoàn tiền (nếu có) trong thời gian sớm nhất. Xin lỗi vì sự bất tiện này.</p>"
                + "<p style=\"text-align: center; margin-top: 20px; font-size: 12px; color: #777;\">"
                + "<a href=\"#\" style=\"color: #F44336;\">Unsubscribe</a>"
                + "</p>"
                + "</div>";
    }

    private String buildOrderShippedHtml(Long orderId) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;\">"
                + "<h2 style=\"color: #2196F3; text-align: center;\">BigTech Store</h2>"
                + "<h3 style=\"color: #333;\">Đơn hàng đang được giao!</h3>"
                + "<p>Tuyệt vời! Đơn hàng <strong>#" + orderId + "</strong> của bạn đã được giao cho đơn vị vận chuyển.</p>"
                + "<p>Vui lòng chú ý điện thoại để nhận hàng.</p>"
                + "<p style=\"text-align: center; margin-top: 20px; font-size: 12px; color: #777;\">"
                + "<a href=\"#\" style=\"color: #2196F3;\">Unsubscribe</a>"
                + "</p>"
                + "</div>";
    }
}
