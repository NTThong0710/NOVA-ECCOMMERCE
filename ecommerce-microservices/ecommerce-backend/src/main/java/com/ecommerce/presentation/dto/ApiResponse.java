package com.ecommerce.auth.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    private ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> res = new ApiResponse<>();
        res.success = true;
        res.data = data;
        return res;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> res = new ApiResponse<>();
        res.success = true;
        res.data = data;
        res.message = message;
        return res;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> res = new ApiResponse<>();
        res.success = false;
        res.message = message;
        return res;
    }
}
