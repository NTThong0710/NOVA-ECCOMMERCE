package com.ecommerce.order.infrastructure.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * VNPayService - Tich hop cong thanh toan VNPay (Sandbox).
 *
 * Luong hoat dong:
 * 1. Checkout -> buildPaymentUrl(orderId, amount, clientIp) -> redirect user
 * 2. User thanh toan tren VNPay
 * 3. VNPay redirect ve /api/payment/callback voi cac params
 * 4. verifyReturn(params) -> kiem tra chu ky HMAC-SHA512
 */
@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    /**
     * Tao URL thanh toan VNPay.
     *
     * @param orderId  Ma don hang (duy nhat, dung lam vnp_TxnRef)
     * @param amount   So tien (don vi: VND)
     * @param clientIp IP cua user
     * @return URL hoan chinh de redirect user sang trang thanh toan VNPay
     */
    public String buildPaymentUrl(Long orderId, Double amount, String clientIp) {
        // Dung TreeMap de tu sap xep key theo thu tu alphabet (yeu cau cua VNPay)
        Map<String, String> params = new TreeMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);

        // Quy doi USD sang VND: 1 USD = 25,400 VND
        // VNPay tinh theo don vi xu VND (so tien * 100)
        double amountVND = (amount != null && amount < 1000.0) ? (amount * 25400.0) : (amount != null ? amount : 0.0);
        long amountInCents = Math.round(amountVND * 100);
        params.put("vnp_Amount", String.valueOf(amountInCents));

        params.put("vnp_CurrCode", "VND");
        // Them timestamp vao TxnRef de tranh loi trung lap giao dich tren Sandbox
        String txnRef = orderId + "_" + System.currentTimeMillis();
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        if (clientIp == null || clientIp.isEmpty() || "0:0:0:0:0:0:0:1".equals(clientIp) || "::1".equals(clientIp)) {
            clientIp = "127.0.0.1";
        }
        params.put("vnp_IpAddr", clientIp);

        // Thoi gian tao va het han giao dich
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        params.put("vnp_CreateDate", formatter.format(cal.getTime()));
        cal.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cal.getTime()));

        // === Ky HMAC-SHA512 theo chuan VNPay ===
        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(hashSecret, hashData);
        params.put("vnp_SecureHash", secureHash);

        return payUrl + "?" + buildQueryString(params);
    }

    /**
     * Verify chu ky tu VNPay callback.
     * Quan trong nhat de chong hack gia mao ket qua thanh toan!
     *
     * @param params Tat ca query params tu VNPay callback
     * @return true neu chu ky hop le
     */
    public boolean verifyReturn(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.isEmpty()) {
            return false;
        }

        Map<String, String> paramsToHash = new TreeMap<>(params);
        paramsToHash.remove("vnp_SecureHash");
        paramsToHash.remove("vnp_SecureHashType");

        String hashData = buildHashData(paramsToHash);
        String expectedHash = hmacSHA512(hashSecret, hashData);

        return vnpSecureHash.equalsIgnoreCase(expectedHash);
    }

    /** "00" = Thanh cong, con lai = That bai/Huy */
    public String getResponseCode(Map<String, String> params) {
        return params.getOrDefault("vnp_ResponseCode", "99");
    }

    /** Lay orderId tu params callback */
    public Long getOrderId(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isEmpty()) return null;
        if (txnRef.contains("_")) {
            return Long.parseLong(txnRef.split("_")[0]);
        }
        return Long.parseLong(txnRef);
    }

    /** Lay ma giao dich do VNPay tao (de luu vao Payment record) */
    public String getTransactionNo(Map<String, String> params) {
        return params.getOrDefault("vnp_TransactionNo", "");
    }

    // =====================================================================
    // PRIVATE HELPERS (Chuan VNPay 2.1.0)
    // =====================================================================

    private String buildHashData(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (sb.length() > 0) sb.append("&");
                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                  .append("=")
                  .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (sb.length() > 0) sb.append("&");
                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                  .append("=")
                  .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Loi tinh HMAC-SHA512: " + e.getMessage(), e);
        }
    }
}

