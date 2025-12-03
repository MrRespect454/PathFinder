package ru.pathfinder.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ru.pathfinder.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
            Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    }