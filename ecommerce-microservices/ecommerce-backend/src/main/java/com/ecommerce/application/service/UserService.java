package com.ecommerce.auth.application.service;
import com.ecommerce.auth.domain.User;
import java.util.List;

// Đây chỉ là mục lục
public interface UserService {

    List<User> getAllUsers();

    User getUserById(Integer id);

    User updateUser( Integer id, User userDetails);

    void deleteUser(Integer id);
}
