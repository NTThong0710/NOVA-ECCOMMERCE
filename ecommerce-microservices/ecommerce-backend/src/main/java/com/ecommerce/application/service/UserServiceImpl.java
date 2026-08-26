package com.ecommerce.auth.application.service;

import com.ecommerce.auth.domain.User;
import com.ecommerce.auth.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Bắt buộc phải có để Spring Boot biến thằng này thành "bộ não"
public class UserServiceImpl implements UserService {

    // Đây là cách chúng ta "mượn" thằng Repository (Tương tác DB) ở Bước 1 mang lên đây xài
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        // Trả về toàn bộ danh sách trong DB
        return userRepository.findAllByOrderByIdAsc();
    }

    @Override
    public User getUserById(Integer id) {
        // Tìm theo ID, nếu không thấy thì quăng ra cái lỗi (Throw Exception)
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
    }

    @Override
    public User updateUser(Integer id, User userDetails) {
        // 1. Tìm user cũ trong Database
        User existingUser = getUserById(id);

        // 2. Cập nhật các trường được phép sửa
        existingUser.setFullName(userDetails.getFullName());
        existingUser.setPhone(userDetails.getPhone());
        
        // 3. Lưu lại xuống Database
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Integer id) {
        // Tìm xem có không rồi mới xoá
        User user = getUserById(id);
        userRepository.delete(user);
    }
}