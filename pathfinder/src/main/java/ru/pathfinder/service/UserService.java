package ru.pathfinder.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.pathfinder.domain.User;
import ru.pathfinder.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 

    public User register(User user) {
        Optional<User> optionalUser = userRepository.findByEmail(user.getEmail()); 
        if (optionalUser.isPresent()) {
            throw new IllegalStateException("Пользователь с таким Email уже существует");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));//сразу хешируем пароль
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email); 
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}