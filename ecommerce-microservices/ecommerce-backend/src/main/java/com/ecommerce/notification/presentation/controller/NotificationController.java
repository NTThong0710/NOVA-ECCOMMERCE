package com.ecommerce.notification.presentation.controller;

import com.ecommerce.notification.domain.Notification;
import com.ecommerce.notification.infrastructure.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private Long getUserIdFromHeader(String authUser) {
        if (authUser == null || authUser.isEmpty()) {
            throw new RuntimeException("Unauthorized: Missing X-Auth-User header");
        }
        return Long.parseLong(authUser);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("X-Auth-User") String authUser) {
        Long userId = getUserIdFromHeader(authUser);
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-Auth-User") String authUser) {
        Long userId = getUserIdFromHeader(authUser);
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-Auth-User") String authUser) {
        Long userId = getUserIdFromHeader(authUser);
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden: You can only read your own notifications");
        }
        
        notification.setRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestHeader("X-Auth-User") String authUser) {
        Long userId = getUserIdFromHeader(authUser);
        
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
        
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
