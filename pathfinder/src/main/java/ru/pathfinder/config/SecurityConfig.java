package ru.pathfinder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Разрешить ВСЕМ (включая неавторизованных)
                .requestMatchers(
                    "/", "/index", "/index.html",
                    "/register", "/register.html",
                    "/login", "/login.html", 
                    "/map", "/map.html",
                    "/css/**", "/js/**", "/images/**",
                    "/api/public/**",
                    "/api/auth/**",      // ← РЕГИСТРАЦИЯ И ЛОГИН
                    "/api/simple/**"     // ← API ДЛЯ КАРТЫ
                ).permitAll()
                
                // Только для авторизованных
                .requestMatchers(
                    "/profile/**",
                    "/api/secure/**",
                    "/create-tag"
                ).authenticated()
                
                .anyRequest().permitAll()  // или .authenticated() - по вашему выбору
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")  // ← ОТКЛЮЧАЕМ CSRF ДЛЯ API
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/perform_login")
                .defaultSuccessUrl("/map", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/perform_logout")
                .logoutSuccessUrl("/?logout=true")
                .permitAll()
            );
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}