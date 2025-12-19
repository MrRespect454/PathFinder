package ru.pathfinder.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.pathfinder.domain.User;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;

    public String authenticate(String usernameOrEmail, String password) {
        // Сначала ищем по username
        Optional<User> userOptional = userService.findByUsername(usernameOrEmail);
        if (userOptional.isEmpty()) {//иначе Email
            userOptional = userService.findByEmail(usernameOrEmail);
        }
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (userService.validatePassword(password, user.getPassword())) {
                // Generate and return JWT token
                return jwtService.generateToken(user.getUsername());
            }
        }
        return null;
    }
}