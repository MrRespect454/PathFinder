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

    public String authenticate(String username, String password) {
        Optional<User> userOptional = userService.findByUsername(username);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (userService.validatePassword(password, user.getPassword())) {
                // Generate and return JWT token
                return jwtService.generateToken(username);
            }
        }
        return null;
    }
}