package ru.pathfinder.service;

import java.util.Optional;

import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.pathfinder.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User register(User user) {
       Optional<User> optionalUser = UserRepository.findByEmail(user.getEmail());
       if (optionalUser.isPresent()) {
        throw new IllegalStateException("Пользователь с таким Email уже существует")
       }
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

 public User findByEmail(String email){
    return userRepository.findByUsername(email);
 }

 public boolean validatePassword()// - проверка пароля
 {
    return passwordEncoder.matches(rawPassword, encodedPassword);
        
    }    
}
