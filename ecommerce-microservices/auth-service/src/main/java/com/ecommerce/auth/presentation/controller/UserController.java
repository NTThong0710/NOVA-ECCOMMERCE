package com.ecommerce.auth.presentation.controller;

import com.ecommerce.auth.application.service.UserService;
import com.ecommerce.auth.domain.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Đánh dấu Class này là một trạm tiếp nhận Request từ web
@RequestMapping("/users") // Tất cả API trong này đều bắt đầu bằng đường dẫn /users
public class UserController {

    // Kéo cái "bộ não" UserService vào để xài
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1. API Lấy danh sách toàn bộ User (Phương thức GET)
    // Đường dẫn thực tế sẽ là: GET http://localhost:8081/users
    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('READ_ALL_USERS')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users); // Trả về mã 200 OK kèm theo danh sách users
    }

    // 2. API Lấy thông tin 1 User theo ID
    // Dấu {id} là một biến động. VD: GET http://localhost:8081/users/1
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // 3. API Sửa thông tin User
    // Dùng phương thức PUT, lấy ID từ URL và lấy dữ liệu sửa từ Body (chuỗi JSON)
    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    // 4. API Xóa User
    // Dùng phương thức DELETE
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('DELETE_USER')")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Xoá tài khoản thành công!");
    }
}