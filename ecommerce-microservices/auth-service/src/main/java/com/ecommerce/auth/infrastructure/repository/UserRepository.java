package com.ecommerce.auth.infrastructure.repository;
import com.ecommerce.auth.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Cực kỳ vi diệu: Bạn chỉ cần đặt tên hàm là "findByUsername"
    // Spring Boot sẽ TỰ ĐỘNG dịch nó thành câu lệnh SQL: "SELECT * FROM users WHERE username = ?"
    // Hàm này dùng để tìm xem user có tồn tại hay không lúc họ Đăng nhập.
    Optional<User> findByUsername(String username);
    List<User> findAllByOrderByIdAsc();
}
