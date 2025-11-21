package ru.pathfinder.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data   //<- анотация (посздает геттеры, сеттеры, и некоторые методы) 
@Entity  //<- помечает класс как сущность
@Table(name = "users")  //<- создает таблицу в БД с точным именем 
public class User {
    @Id   //<- анотация ID
    @GeneratedValue(strategy = GenerationType.IDENTITY)  //<- создает ранодомный ID
    private Long id;
    
    @Column(unique = true, nullable = false) //<- создает обычну строку в тб бд
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.ROLE_USER;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}

enum Role {
    ROLE_USER, ROLE_ADMIN
}