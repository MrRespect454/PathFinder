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
                    "/api/public/**"
                ).permitAll()
                
                // Только для авторизованных
                .requestMatchers(
                    "/profile/**",
                    "/api/secure/**",
                    "/create-tag"
                ).authenticated()
                
                .anyRequest().permitAll()  // или .authenticated() - по вашему выбору
            )
            .formLogin(form -> form
                .loginPage("/login")  // ваша кастомная страница логина
                .loginProcessingUrl("/perform_login")  // URL для обработки формы
                .defaultSuccessUrl("/map", true)  // куда идти после успешного входа
                .failureUrl("/login?error=true")  // куда идти при ошибке
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