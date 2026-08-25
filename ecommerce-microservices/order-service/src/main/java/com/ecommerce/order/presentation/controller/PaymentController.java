package com.ecommerce.order.presentation.controller;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.Payment;
import com.ecommerce.order.infrastructure.payment.VNPayService;
import com.ecommerce.order.infrastructure.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * PaymentController - Xu ly callback/return tu VNPay sau khi user thanh toan.
 *
 * Co 2 endpoint:
 * - GET /api/payment/callback : VNPay redirect user ve day sau khi thanh toan
 * - GET /api/payment/ipn      : VNPay goi truc tiep server (server-to-server, secure hon)
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderRepository orderRepository;

    public PaymentController(VNPayService vnPayService, OrderRepository orderRepository) {
        this.vnPayService = vnPayService;
        this.orderRepository = orderRepository;
    }

    /**
     * VNPay Return URL - User duoc redirect ve day sau khi thanh toan.
     * Frontend se doc query params tu URL nay de hien thi ket qua.
     *
     * VNPay se truyen cac params: vnp_ResponseCode, vnp_TxnRef, vnp_Amount,
     * vnp_TransactionNo, vnp_SecureHash, ...
     */
    @GetMapping("/callback")
    public ResponseEntity<?> handleCallback(HttpServletRequest request) {
        // 1. Doc tat ca query params tu VNPay
        Map<String, String> params = extractParams(request);

        // 2. BUOC QUAN TRONG NHAT: Verify chu ky de chong hack
        boolean isValidSignature = vnPayService.verifyReturn(params);
        if (!isValidSignature) {
            return ResponseEntity.status(400)
                .body(buildResult("INVALID_SIGNATURE", null, "Chu ky khong hop le - Phat hien gian lan!"));
        }

        // 3. Lay thong tin giao dich
        Long orderId = vnPayService.getOrderId(params);
        String responseCode = vnPayService.getResponseCode(params);
        String transactionNo = vnPayService.getTransactionNo(params);

        if (orderId == null) {
            return ResponseEntity.badRequest().body(buildResult("INVALID_ORDER", null, "Ma don hang khong hop le"));
        }

        // 4. Tim don hang trong DB
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();

        // 5. Xu ly dua vao ket qua thanh toan
        if ("00".equals(responseCode)) {
            // =========================
            // THANH TOAN THANH CONG
            // =========================
            order.setStatus("PAID");
            orderRepository.save(order);

            // Cap nhat Payment record
            updatePaymentRecord(order, "SUCCESS", transactionNo);

            System.out.println("[VNPay] Don hang #" + orderId + " da duoc thanh toan thanh cong. TxnNo: " + transactionNo);
            return ResponseEntity.ok(buildResult("SUCCESS", orderId, "Thanh toan thanh cong!"));

        } else {
            // =========================
            // THANH TOAN THAT BAI / HUY
            // =========================
            order.setStatus("CANCELLED");
            orderRepository.save(order);

            updatePaymentRecord(order, "FAILED", transactionNo);

            System.out.println("[VNPay] Thanh toan don hang #" + orderId + " that bai. Code: " + responseCode);
            return ResponseEntity.ok(buildResult("FAILED", orderId, mapResponseCode(responseCode)));
        }
    }

    /**
     * VNPay IPN (Instant Payment Notification) - VNPay goi truc tiep server.
     * Day la endpoint SERVER-TO-SERVER, an toan hon Return URL.
     * Dung IPN de cap nhat trang thai don hang chinh xac (du user co dong trinh duyet).
     *
     * Tra ve JSON dung format VNPay yeu cau: {"RspCode": "00", "Message": "OK"}
     */
    @PostMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);
        Map<String, String> response = new HashMap<>();

        // 1. Verify chu ky
        if (!vnPayService.verifyReturn(params)) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return ResponseEntity.ok(response);
        }

        Long orderId = vnPayService.getOrderId(params);
        String responseCode = vnPayService.getResponseCode(params);

        if (orderId == null) {
            response.put("RspCode", "01");
            response.put("Message", "Order Not Found");
            return ResponseEntity.ok(response);
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            response.put("RspCode", "01");
            response.put("Message", "Order Not Found");
            return ResponseEntity.ok(response);
        }

        Order order = orderOpt.get();

        // Tranh xu ly trung lap (idempotent)
        if ("PAID".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            response.put("RspCode", "02");
            response.put("Message", "Order Already Updated");
            return ResponseEntity.ok(response);
        }

        // Cap nhat trang thai
        if ("00".equals(responseCode)) {
            order.setStatus("PAID");
            orderRepository.save(order);
            updatePaymentRecord(order, "SUCCESS", vnPayService.getTransactionNo(params));
        } else {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
            updatePaymentRecord(order, "FAILED", vnPayService.getTransactionNo(params));
        }

        // Tra ve 00 = Da nhan va xu ly thanh cong (VNPay yeu cau format nay)
        response.put("RspCode", "00");
        response.put("Message", "Confirm Success");
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /** Doc tat ca query params tu request thanh Map */
    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }

    /** Cap nhat trang thai Payment record gan voi Order */
    private void updatePaymentRecord(Order order, String status, String transactionNo) {
        if (order.getPayment() != null) {
            order.getPayment().setStatus(status);
            order.getPayment().setTransactionId(transactionNo);
        }
    }

    /** Build response body tra ve frontend */
    private Map<String, Object> buildResult(String code, Long orderId, String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("orderId", orderId);
        result.put("message", message);
        result.put("success", "SUCCESS".equals(code));
        return result;
    }

    /** Dich ma loi VNPay sang tieng Viet */
    private String mapResponseCode(String code) {
        return switch (code) {
            case "07" -> "Giao dich bi nghi ngo gian lan.";
            case "09" -> "The chua dang ky InternetBanking.";
            case "10" -> "Xac thuc sai qua 3 lan, khoa the.";
            case "11" -> "Giao dich het han. Vui long thu lai.";
            case "12" -> "The bi khoa.";
            case "13" -> "Sai mat khau OTP.";
            case "24" -> "Khach hang huy giao dich.";
            case "51" -> "Tai khoan khong du so du.";
            case "65" -> "Vuot han muc giao dich trong ngay.";
            case "75" -> "Ngan hang dang bao tri.";
            case "79" -> "Nhap sai mat khau qua so lan quy dinh.";
            default   -> "Thanh toan that bai (Ma loi: " + code + ")";
        };
    }
}
